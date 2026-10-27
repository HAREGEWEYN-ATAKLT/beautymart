import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "../../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: false,
    });

    if (!token?.id) {
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
      where: { userId: String(token.id) },
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
      console.error("Chapa status verification inconclusive:", {
        httpStatus: response.status,
        txRef,
      });

      return NextResponse.json(
        {
          status: "UNKNOWN",
          message:
            "Chapa could not confirm the current status. Please try checking again.",
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
      console.error("Chapa verification details mismatch:", {
        txRef,
        returnedReference: transaction.tx_ref,
        returnedCurrency: transaction.currency,
        returnedAmount: transaction.amount,
        expectedAmount: Number(payment.amount),
      });

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
              orderNumber: true,
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
      } catch (notificationError) {
        console.error(
          "Payment was confirmed, but payment notifications failed:",
          notificationError
        );
      }

return NextResponse.json({
  status: "PAID",
  message: "Payment verified successfully.",
});



    }

    if (transaction.status === "failed") {
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
  } catch (error) {
    console.error("Chapa payment status error:", error);

    return NextResponse.json(
      { message: "Unable to check payment status right now." },
      { status: 500 }
    );
  }
}