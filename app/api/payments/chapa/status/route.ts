import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { completeCheckoutAttemptIfPaid } from "../../../../../lib/checkout";
import { getActiveRequestUser } from "../../../../../lib/request-auth";
import { isRejectedLegacyChapaReference } from "../../../../../lib/payment-recovery";
import { isFinalUnsuccessfulChapaStatus } from "../../../../../lib/chapa-status";

export async function GET(request: NextRequest) {
  try {
    const user = await getActiveRequestUser(request);

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

 
    const requestedTxRef = request.nextUrl.searchParams.get("txRef");
    const orderId = request.nextUrl.searchParams.get("orderId");

    if (!requestedTxRef?.trim() && !orderId?.trim()) {
      return NextResponse.json(
        { message: "A transaction reference or order ID is required." },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: user.userId },
      select: { customerId: true },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer profile not found." },
        { status: 404 }
      );
    }

    const payment = await prisma.payment.findFirst({
      where: {
        provider: "CHAPA",
        order: {
          customerId: customer.customerId,
          ...(requestedTxRef?.trim()
            ? {}
            : { orderId: orderId!.trim() }),
        },
        ...(requestedTxRef?.trim()
          ? { transactionReference: requestedTxRef.trim() }
          : {}),
      },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json(
        { message: "Chapa payment attempt not found for this order." },
        { status: 404 }
      );
    }


    
    if (payment.status === "PAID") {
      if (payment.order.checkoutAttemptId) {
        await completeCheckoutAttemptIfPaid(payment.order.checkoutAttemptId);
      }
      return NextResponse.json({
        status: "PAID",
        message: "This payment has already been confirmed.",
      });
    }

    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { status: payment.status, message: "This payment is not pending." },
        { status: 409 }
      );
    }
const txRef = payment.transactionReference;

if (!txRef) {
  return NextResponse.json({
    status: "FAILED",
    retryable: true,
    message:
      "No active Chapa attempt exists for this order. You can retry payment using your existing order.",
  });
}
    const secret = process.env.CHAPA_SECRET_KEY;

    if (!secret) {
      return NextResponse.json(
        { message: "Chapa secret key is not configured." },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${secret}` },
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.status !== "success" || !result?.data) {
      // A legacy BeautyMart version stored references that Chapa rejects for
      // being too long. A 400 for that exact condition proves this reference
      // was never a usable Chapa attempt, so it can be released for a retry.
      // Do not apply this recovery rule to a normal 404 or network problem:
      // Chapa documents those as potentially unpaid/unknown states.
      if (isRejectedLegacyChapaReference(txRef, response.status)) {
        const released = await prisma.payment.updateMany({
          where: {
            paymentId: payment.paymentId,
            provider: "CHAPA",
            status: "PENDING",
            transactionReference: txRef,
          },
          data: { transactionReference: null },
        });

        if (released.count === 1) {
          return NextResponse.json({
            status: "FAILED",
            retryable: true,
            message: "This older payment attempt used a Chapa reference that was rejected before payment started. No payment was verified; you can safely retry using this order.",
          });
        }

        return NextResponse.json(
          { message: "Payment status changed while it was being checked. Please check again." },
          { status: 409 }
        );
      }

      console.error("Chapa status verification was inconclusive.", {
        httpStatus: response.status,
      });

      return NextResponse.json(
        {
          status: "UNKNOWN",
          message:
            response.status === 400
              ? "Chapa rejected this verification request. This does not prove payment failed, so do not retry yet. Check the Chapa dashboard or contact support to reconcile it."
              : "Chapa could not confirm the current status. Please try checking again.",
        },
        { status: 202 }
      );
    }

    const transaction = result.data;

    if (
      transaction.tx_ref !== txRef ||
      String(transaction.currency).toUpperCase() !== "ETB" ||
      !Number.isFinite(Number(transaction.amount)) ||
      Math.abs(Number(transaction.amount) - Number(payment.amount)) > 0.001
    ) {
  console.error("Chapa verification details did not match the saved payment.");

      return NextResponse.json(
        { message: "Verified transaction details do not match this payment." },
        { status: 409 }
      );
    }

    if (transaction.status === "success") {
      await prisma.$transaction(async (tx) => {
        const updated = await tx.payment.updateMany({
          where: {
            paymentId: payment.paymentId,
            provider: "CHAPA",
            status: "PENDING",
            transactionReference: txRef,
          },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });

        if (updated.count === 1) {
          await tx.order.updateMany({
            where: {
              orderId: payment.orderId,
              paymentStatus: { not: "PAID" },
            },
            data: { paymentStatus: "PAID" },
          });
        }
      });

      const latest = await prisma.payment.findUnique({
        where: { paymentId: payment.paymentId },
        select: { status: true },
      });

      if (latest?.status !== "PAID") {
        return NextResponse.json(
          { message: "Payment status changed concurrently. Check again." },
          { status: 409 }
        );
      }

      if (payment.order.checkoutAttemptId) {
        await completeCheckoutAttemptIfPaid(payment.order.checkoutAttemptId);
      }



      // Notify the store owner and active super admins.
      // Notification failures must never undo a verified payment.
      try {
        const [store, order, admins] = await Promise.all([
          prisma.store.findUnique({
            where: { storeId: payment.storeId },
            select: {
              ownerId: true,
              storeName: true,
            },
          }),
          prisma.order.findUnique({
            where: { orderId: payment.orderId },
            select: {
              orderId: true,
              orderNumber: true,
              customer: { select: { userId: true } },
            },
          }),
          prisma.user.findMany({
            where: {
              role: "SUPER_ADMIN",
              isActive: true,
            },
            select: {
              userId: true,
            },
          }),
        ]);

        if (store && order) {
          const notifications = [
            {
              userId: store.ownerId,
              title: "Payment received",
              message: `Payment for order ${order.orderNumber} at ${store.storeName} has been confirmed.`,
              notificationType: "PAYMENT" as const,
              deduplicationKey: `store-order-payment:${payment.paymentId}:${store.ownerId}`,
            },
            {
              userId: order.customer.userId,
              title: "Payment verified",
              message: `Your payment for order ${order.orderNumber} at ${store.storeName} has been verified successfully.`,
              notificationType: "PAYMENT" as const,
              deduplicationKey: `customer-order-payment:${payment.paymentId}:${order.orderId}:${order.customer.userId}`,
            },
            ...admins.map((admin) => ({
              userId: admin.userId,
              title: "Marketplace payment received",
              message: `Payment for order ${order.orderNumber} at ${store.storeName} has been verified successfully.`,
              notificationType: "PAYMENT" as const,
              deduplicationKey: `admin-order-payment:${payment.paymentId}:${admin.userId}`,
            })),
          ];

          await prisma.notification.createMany({
            data: notifications,
            skipDuplicates: true,
          });
        }
    } catch {
      console.error("Payment was confirmed, but payment notifications failed.");
      }

return NextResponse.json({
  status: "PAID",
  message: "Payment verified successfully.",
});



    }

    if (isFinalUnsuccessfulChapaStatus(transaction.status)) {
      // Release the reference only after Chapa confirms this attempt failed.
      // Keep the payment PENDING so the customer can safely start a new attempt.
      const released = await prisma.payment.updateMany({
        where: {
          paymentId: payment.paymentId,
          status: "PENDING",
          transactionReference: txRef,
        },
        data: { transactionReference: null },
      });

      if (released.count !== 1) {
        return NextResponse.json(
          { message: "Payment changed concurrently. Check its status again." },
          { status: 409 }
        );
      }

      // This is a final result from Chapa for this attempt. It is safe to
      // tell the customer to retry, but the order and reserved stock stay
      // unchanged until a later payment is verified.
      await prisma.notification.createMany({
        data: [{
          userId: user.userId,
          title: "Payment attempt was unsuccessful",
          message: `Chapa confirmed that the payment attempt for order ${payment.order.orderNumber} did not succeed. No payment was verified; you can try payment again from your order.`,
          notificationType: "PAYMENT",
          deduplicationKey: `customer-payment-attempt-failed:${payment.paymentId}:${txRef}`,
        }],
        skipDuplicates: true,
      }).catch(() => undefined);

      return NextResponse.json({
        status: "FAILED",
        retryable: true,
        message: "Chapa confirmed this attempt failed. You can try again.",
      });
    }

    return NextResponse.json(
      {
        status: "PENDING",
        message: "Chapa has not confirmed a final payment result yet.",
      },
      { status: 202 }
    );
  } catch {
    console.error("Chapa payment status check failed.");

    return NextResponse.json(
      { message: "Unable to check payment status right now." },
      { status: 500 }
    );
  }
}
