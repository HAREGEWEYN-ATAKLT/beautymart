import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

const txRef =
  searchParams.get("trx_ref") ||
  searchParams.get("tx_ref") ||
  searchParams.get("ref_id");

console.log("Chapa callback URL:", request.url);
console.log("Chapa callback txRef:", txRef);

if (!txRef) {
  return NextResponse.json(
    {
      message: "Transaction reference is missing.",
      receivedParams: Object.fromEntries(searchParams.entries()),
    },
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

    console.log("Chapa verification response:", data);

    if (!response.ok || data.status !== "success") {
      return NextResponse.json(
        {
          message: "Chapa payment verification failed.",
          details: data,
        },
        { status: 400 }
      );
    }

const transaction = data.data;

if (transaction.tx_ref !== txRef) {
  console.error("Chapa transaction reference mismatch:", {
    expected: txRef,
    received: transaction.tx_ref,
  });

  return NextResponse.json(
    { message: "Transaction reference does not match." },
    { status: 400 }
  );
}

const payment = await prisma.payment.findFirst({
  where: { transactionReference: txRef, provider: "CHAPA" },
});

if (!payment) {
  return NextResponse.json(
    { message: "Payment record not found." },
    { status: 404 }
  );
}

if (payment.status === "PAID") {
  return NextResponse.redirect(new URL("/orders", request.url));
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
  console.error("Chapa payment details mismatch:", {
    txRef,
    currency: transaction.currency,
    receivedAmount: transaction.amount,
    expectedAmount: Number(payment.amount),
  });

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
    return NextResponse.redirect(new URL("/orders", request.url));
  }

  return NextResponse.json(
    { message: "Payment status changed. Please check your order." },
    { status: 409 }
  );
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
        "Payment was confirmed, but the store-owner notification failed:",
        notificationError
      );
    }
    // Send customer back to their orders
    return NextResponse.redirect(
      new URL("/orders", request.url)
    );
  } catch (error) {
    console.error("Chapa callback error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while verifying Chapa payment.",
      },
      { status: 500 }
    );
  }
}