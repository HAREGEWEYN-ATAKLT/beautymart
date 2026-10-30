

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "../../../../lib/prisma";
import { getActiveRequestUser } from "../../../../lib/request-auth";
import { clientIp, enforceRateLimit, rateLimitResponse } from "../../../../lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const activeUser = await getActiveRequestUser(request);

    if (!activeUser || activeUser.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    const limit = await enforceRateLimit("payment", `customer:${activeUser.userId}:ip:${clientIp(request)}`);
    if (!limit.allowed) return rateLimitResponse(limit.reset ?? Date.now() + 60_000);

    const body = await request.json();
    const orderId = body?.orderId;

    if (typeof orderId !== "string" || !orderId.trim()) {
      return NextResponse.json(
        { message: "A valid order ID is required." },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: activeUser.userId },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer profile not found." },
        { status: 404 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        orderId,
        customerId: customer.customerId,
      },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 }
      );
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json(
        { message: "This order has already been paid." },
        { status: 409 }
      );
    }

    const payment = order.payments.find(
      (item) => item.provider === "CHAPA"
    );

    if (!payment) {
      return NextResponse.json(
        { message: "Chapa payment record not found." },
        { status: 404 }
      );
    }

    if (payment.status === "PAID") {
      return NextResponse.json(
        { message: "This payment has already been paid." },
        { status: 409 }
      );
    }

    // A reference means an earlier attempt may still complete.
    // Do not overwrite it or initialize a second attempt.
    if (payment.transactionReference) {
      return NextResponse.json(
        {
          message:
            "A payment attempt already exists. Check its status before retrying.",
          transactionReference: payment.transactionReference,
        },
        { status: 409 }
      );
    }

    const chapaSecretKey = process.env.CHAPA_SECRET_KEY;

    if (!chapaSecretKey) {
      return NextResponse.json(
        { message: "Chapa secret key is not configured." },
        { status: 500 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { userId: activeUser.userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { message: "A valid customer email is required for payment." },
        { status: 400 }
      );
    }

    // const txRef = `BM-${order.orderNumber}-${randomUUID()}`;
const txRef = `BM-${randomUUID()}`;
    // Persist first. The conditional update prevents two concurrent
    // requests from claiming the same payment record.
    const claimed = await prisma.payment.updateMany({
      where: {
        paymentId: payment.paymentId,
        provider: "CHAPA",
        status: "PENDING",
        transactionReference: null,
      },
      data: {
        transactionReference: txRef,
      },
    });

    if (claimed.count !== 1) {
      return NextResponse.json(
        {
          message:
            "A payment attempt already exists or the payment status changed. Check payment status before retrying.",
        },
        { status: 409 }
      );
    }

    let chapaResponse: Response;

    try {
      chapaResponse = await fetch(
        "https://api.chapa.co/v1/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${chapaSecretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: Number(order.finalAmount).toFixed(2),
            currency: "ETB",
            email: user.email,
            first_name:
              user.fullName?.trim().split(/\s+/)[0] || "Customer",
            last_name:
              user.fullName?.trim().split(/\s+/).slice(1).join(" ") ||
              "Customer",
            tx_ref: txRef,
            callback_url: process.env.CHAPA_CALLBACK_URL,
            return_url: process.env.CHAPA_RETURN_URL,
            customization: {
              title: "BeautyMart",
              description: `Payment for order ${order.orderNumber}`,
            },
          }),
          // Chapa occasionally takes longer than 15 seconds to create a
          // checkout page. A 30-second limit reduces false "unknown" states
          // while still preserving the reference if the provider is slow.
          signal: AbortSignal.timeout(30000),
        }
      );
    } catch {
      // Chapa may have accepted the request even if we timed out.
      // Keep the reference so the attempt can be reconciled.
      console.error("Chapa initialization outcome is unknown.");

      return NextResponse.json(
        {
          message:
            "We could not confirm the payment initialization result. Do not retry yet; check payment status first.",
          transactionReference: txRef,
        },
        { status: 202 }
      );
    }

    let chapaData: {
      status?: unknown;
      data?: { checkout_url?: unknown };
      message?: { tx_ref?: unknown };
    };

    try {
      chapaData = (await chapaResponse.json()) as typeof chapaData;
    } catch {
      return NextResponse.json(
        {
          message:
            "Chapa returned an unreadable response. Check payment status before retrying.",
          transactionReference: txRef,
        },
        { status: 202 }
      );
    }

    if (
      !chapaResponse.ok ||
      chapaData?.status !== "success" ||
      typeof chapaData?.data?.checkout_url !== "string"
    ) {
      
      // Chapa explicitly rejected the transaction reference.
      // This is a confirmed validation failure, not a network timeout.
      const txRefErrors = chapaData?.message?.tx_ref;

      if (
        chapaResponse.status === 400 &&
        Array.isArray(txRefErrors) &&
        txRefErrors.some(
          (message: unknown) =>
            typeof message === "string" &&
            message.toLowerCase().includes("tx ref") &&
            message.toLowerCase().includes("50 characters")
        )
      ) {
        const released = await prisma.payment.updateMany({
          where: {
            paymentId: payment.paymentId,
            provider: "CHAPA",
            status: "PENDING",
            transactionReference: txRef,
          },
          data: {
            transactionReference: null,
          },
        });

        if (released.count !== 1) {
          return NextResponse.json(
            {
              message:
                "The payment changed while handling Chapa's rejection. Check its status before retrying.",
            },
            { status: 409 }
          );
        }

        return NextResponse.json(
          {
            message:
              "Chapa rejected the transaction reference. The failed initialization was released; you can try payment again.",
          },
          { status: 400 }
        );
      }

      console.error("Chapa did not confirm payment initialization.", {
        httpStatus: chapaResponse.status,
        providerStatus: chapaData?.status,
      });

      // Keep the reference until we can establish whether Chapa
      // created a transaction. Do not silently release the attempt.
      return NextResponse.json(
        {
          message:
            "Chapa did not confirm initialization. Check the transaction status before trying again.",
          transactionReference: txRef,
        },
        { status: 202 }
      );
    }

    return NextResponse.json({
      message: "Chapa payment initialized successfully.",
      checkoutUrl: chapaData.data.checkout_url,
      txRef,
    });
  } catch {
    console.error("Chapa payment initialization failed.");

    return NextResponse.json(
      { message: "Unable to initialize payment at this time." },
      { status: 500 }
    );
  }
}
