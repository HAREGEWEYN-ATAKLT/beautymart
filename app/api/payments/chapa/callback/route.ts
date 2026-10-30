import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { completeCheckoutAttemptIfPaid } from "../../../../../lib/checkout";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

const txRef =
  searchParams.get("trx_ref") ||
  searchParams.get("tx_ref") ||
  searchParams.get("ref_id");

if (!txRef) {
  return NextResponse.json(
    { message: "Transaction reference is missing." },
    { status: 400 }
  );
}

    const chapaSecretKey = process.env.CHAPA_SECRET_KEY;

    if (!chapaSecretKey) {
      return NextResponse.json(
        { message: "Chapa secret key is not configured." },
        { status: 500 }
      );
    }

    // Verify the transaction with Chapa
    const response = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(
        txRef
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      return NextResponse.json(
        { message: "Chapa payment verification failed." },
        { status: 400 }
      );
    }

const transaction = data.data;

if (transaction.tx_ref !== txRef) {
  console.error("Chapa transaction reference did not match the callback.");

  return NextResponse.json(
    { message: "Transaction reference does not match." },
    { status: 400 }
  );
}

const payment = await prisma.payment.findFirst({
  where: { transactionReference: txRef, provider: "CHAPA" },
  include: { order: { select: { checkoutAttemptId: true } } },
});

if (!payment) {
  return NextResponse.json(
    { message: "Payment record not found." },
    { status: 404 }
  );
}

if (payment.status === "PAID") {
  if (payment.order.checkoutAttemptId) {
    await completeCheckoutAttemptIfPaid(payment.order.checkoutAttemptId);
  }
  const destination = new URL("/checkout", request.url);
  if (payment.order.checkoutAttemptId) {
    destination.searchParams.set("checkoutAttempt", payment.order.checkoutAttemptId);
  }
  return NextResponse.redirect(destination);
}

if (payment.status !== "PENDING") {
  return NextResponse.json(
    { message: "This payment is no longer pending." },
    { status: 409 }
  );
}

if (transaction.status !== "success") {
  return NextResponse.json(
    {
      message: "Chapa has not confirmed a successful payment.",
      status: transaction.status,
    },
    { status: 400 }
  );
}

if (
  String(transaction.currency).toUpperCase() !== "ETB" ||
  !Number.isFinite(Number(transaction.amount)) ||
  Math.abs(Number(transaction.amount) - Number(payment.amount)) > 0.001
) {
  console.error("Chapa payment details did not match the saved payment.");

  return NextResponse.json(
    { message: "Verified payment details do not match the order." },
    { status: 400 }
  );
}

const paymentClaim = await prisma.$transaction(async (tx) => {
  const updated = await tx.payment.updateMany({
    where: {
      paymentId: payment.paymentId,
      status: "PENDING",
      transactionReference: txRef,
      provider: "CHAPA",
    },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  });

  if (updated.count !== 1) {
    return false;
  }

  await tx.order.updateMany({
    where: {
      orderId: payment.orderId,
      paymentStatus: { not: "PAID" },
    },
    data: { paymentStatus: "PAID" },
  });

  return true;
});

if (!paymentClaim) {
  const latestPayment = await prisma.payment.findUnique({
    where: { paymentId: payment.paymentId },
    select: { status: true },
  });

  if (latestPayment?.status === "PAID") {
    if (payment.order.checkoutAttemptId) {
      await completeCheckoutAttemptIfPaid(payment.order.checkoutAttemptId);
    }
    const destination = new URL("/checkout", request.url);
    if (payment.order.checkoutAttemptId) {
      destination.searchParams.set("checkoutAttempt", payment.order.checkoutAttemptId);
    }
    return NextResponse.redirect(destination);
  }

  return NextResponse.json(
    { message: "Payment status changed. Please check your order." },
    { status: 409 }
  );
}

if (payment.order.checkoutAttemptId) {
  await completeCheckoutAttemptIfPaid(payment.order.checkoutAttemptId);
}

    

    // Notify the store owner after payment is confirmed.
    // Notification errors must not affect a verified payment.
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
    // Send customer back to their orders
    const destination = new URL("/checkout", request.url);
    if (payment.order.checkoutAttemptId) {
      destination.searchParams.set("checkoutAttempt", payment.order.checkoutAttemptId);
    }
    return NextResponse.redirect(destination);
  } catch {
    console.error("Chapa callback verification failed.");

    return NextResponse.json(
      {
        message: "Something went wrong while verifying Chapa payment.",
      },
      { status: 500 }
    );
  }
}
