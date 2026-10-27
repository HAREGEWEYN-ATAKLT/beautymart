// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { prisma } from "../../../../lib/prisma";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// export async function GET(request: Request) {
//   try {
//     const token = await getToken({
//       req: request as never,
//       secret: process.env.NEXTAUTH_SECRET,
//       secureCookie: false,
//     });

//     if (!token?.id || token.role !== "STORE_OWNER") {
//       return NextResponse.json(
//         { message: "You must be logged in as a store owner." },
//         { status: 401 }
//       );
//     }

//     const store = await prisma.store.findFirst({
//       where: {
//         ownerId: String(token.id),
//       },
//       select: {
//         storeId: true,
//       },
//     });

//     if (!store) {
//       return NextResponse.json(
//         { message: "No store was found for this account." },
//         { status: 404 }
//       );
//     }

//     const payments = await prisma.subscriptionPayment.findMany({
//       where: {
//         storeId: store.storeId,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       take: 10,
//       select: {
//         subscriptionPaymentId: true,
//         planType: true,
//         provider: true,
//         amount: true,
//         currency: true,
//         status: true,
//         createdAt: true,
//         paidAt: true,
//       },
//     });

//     return NextResponse.json(
//       {
//         payments: payments.map((payment) => ({
//           ...payment,
//           amount: payment.amount.toString(),
//         })),
//       },
//       {
//         status: 200,
//         headers: {
//           "Cache-Control": "no-store",
//         },
//       }
//     );
//   } catch (error) {
//     console.error("Subscription payment status lookup failed:", error);

//     return NextResponse.json(
//       { message: "Unable to retrieve subscription payment status." },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLAN_MONTHS = {
  STARTER: 6,
  STANDARD: 12,
} as const;

function addCalendarMonths(date: Date, months: number) {
  const result = new Date(date);
  const originalDay = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + months);

  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate();

  result.setDate(Math.min(originalDay, lastDay));
  return result;
}

export async function GET(request: Request) {
  try {
    const token = await getToken({
      req: request as never,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (!token?.id || token.role !== "STORE_OWNER") {
      return NextResponse.json(
        { message: "You must be logged in as a store owner." },
        { status: 401 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { ownerId: String(token.id) },
      select: { storeId: true },
    });

    if (!store) {
      return NextResponse.json(
        { message: "No store was found for this account." },
        { status: 404 }
      );
    }

    const secretKey = process.env.CHAPA_SECRET_KEY;

    if (secretKey) {
      const pendingPayments =
        await prisma.subscriptionPayment.findMany({
          where: {
            storeId: store.storeId,
            provider: "CHAPA",
            status: "PENDING",
            transactionReference: { not: null },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            subscriptionPaymentId: true,
            transactionReference: true,
            subscriptionId: true,
            storeId: true,
            planType: true,
            amount: true,
            currency: true,
          },
        });

      for (const payment of pendingPayments) {
        const txRef = payment.transactionReference;

        if (
          !txRef ||
          (payment.planType !== "STARTER" &&
            payment.planType !== "STANDARD")
        ) {
          continue;
        }

        try {
          const response = await fetch(
            `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${secretKey}`,
              },
              cache: "no-store",
              signal: AbortSignal.timeout(10000),
            }
          );

          if (!response.ok) continue;

          const result = await response.json();
          const verified = result?.data;
          const verifiedAmount =
            typeof verified?.amount === "number" ||
            typeof verified?.amount === "string"
              ? Number(verified.amount)
              : NaN;

  
if (
  result?.status === "success" &&
  verified?.status === "failed" &&
  verified?.tx_ref === txRef &&
  Number.isFinite(verifiedAmount) &&
  verifiedAmount === Number(payment.amount) &&
  verified?.currency === payment.currency &&
  payment.currency === "ETB"
) {
  await prisma.subscriptionPayment.updateMany({
    where: {
      subscriptionPaymentId: payment.subscriptionPaymentId,
      transactionReference: txRef,
      storeId: store.storeId,
      provider: "CHAPA",
      status: "PENDING",
    },
    data: {
      status: "FAILED",
    },
  });

  continue;
}

if (
  result?.status !== "success" ||
  verified?.status !== "success" ||
  verified?.tx_ref !== txRef ||
  !Number.isFinite(verifiedAmount) ||
  verifiedAmount !== Number(payment.amount) ||
  verified?.currency !== payment.currency ||
  payment.currency !== "ETB"
) {
  continue;
}


          await prisma.$transaction(async (tx) => {
            const claimed =
              await tx.subscriptionPayment.updateMany({
                where: {
                  subscriptionPaymentId:
                    payment.subscriptionPaymentId,
                  transactionReference: txRef,
                  storeId: store.storeId,
                  provider: "CHAPA",
                  status: "PENDING",
                },
                data: {
                  status: "PAID",
                  paidAt: new Date(),
                },
              });

            if (claimed.count === 0) return;

            const subscription =
              await tx.subscription.findUnique({
                where: {
                  subscriptionId: payment.subscriptionId,
                },
                select: {
                  subscriptionId: true,
                  storeId: true,
                },
              });

            if (
              !subscription ||
              subscription.storeId !== payment.storeId
            ) {
              throw new Error(
                "Payment and subscription store mismatch."
              );
            }

            const startDate = new Date();
            const months =
  payment.planType === "STARTER"
    ? PLAN_MONTHS.STARTER
    : payment.planType === "STANDARD"
      ? PLAN_MONTHS.STANDARD
      : null;

if (months === null) {
  throw new Error("Invalid subscription payment plan.");
}

const endDate = addCalendarMonths(startDate, months);

            await tx.subscription.update({
              where: {
                subscriptionId: subscription.subscriptionId,
              },
              data: {
                planType: payment.planType,
                status: "ACTIVE",
                isActive: true,
                startDate,
                endDate,
              },
            });
          });
        } catch {
          console.error(
            "A pending subscription payment could not be reconciled."
          );
        }
      }
    }

    const payments = await prisma.subscriptionPayment.findMany({
      where: { storeId: store.storeId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        subscriptionPaymentId: true,
        planType: true,
        provider: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
        paidAt: true,
      },
    });

    return NextResponse.json(
      {
        payments: payments.map((payment) => ({
          ...payment,
          amount: payment.amount.toString(),
        })),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Subscription payment status lookup failed:", error);

    return NextResponse.json(
      { message: "Unable to retrieve subscription payment status." },
      { status: 500 }
    );
  }
}
