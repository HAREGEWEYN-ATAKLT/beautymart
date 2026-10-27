
// import { randomUUID } from "node:crypto";
// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { prisma } from "../../../../../lib/prisma";

// export const runtime = "nodejs";

// const PLAN_PRICES = {
//   STARTER: 3000,
//   STANDARD: 5000,
// } as const;

// type PaidPlan = keyof typeof PLAN_PRICES;

// function addCalendarMonths(date: Date, months: number) {
//   // Preserve calendar-month behavior without overflowing into the
//   // following month when the target month has fewer days.
//   const result = new Date(date);
//   const originalDay = result.getDate();

//   result.setDate(1);
//   result.setMonth(result.getMonth() + months);

//   const lastDay = new Date(
//     result.getFullYear(),
//     result.getMonth() + 1,
//     0
//   ).getDate();

//   result.setDate(Math.min(originalDay, lastDay));
//   return result;
// }

// export async function POST(request: Request) {
//   try {
//     const token = await getToken({
//       req: request as never,
//       secret: process.env.NEXTAUTH_SECRET,
//       secureCookie: process.env.NODE_ENV === "production",
//     });

//     if (!token?.id) {
//       return NextResponse.json(
//         { message: "You must be logged in." },
//         { status: 401 }
//       );
//     }

//     if (token.role !== "STORE_OWNER") {
//       return NextResponse.json(
//         { message: "Only store owners can purchase subscriptions." },
//         { status: 403 }
//       );
//     }

//     let body: { planType?: unknown };

//     try {
//       body = await request.json();
//     } catch {
//       return NextResponse.json(
//         { message: "Invalid request body." },
//         { status: 400 }
//       );
//     }

//     const planType = body.planType;

//     if (
//       typeof planType !== "string" ||
//       !Object.prototype.hasOwnProperty.call(PLAN_PRICES, planType)
//     ) {
//       return NextResponse.json(
//         { message: "Choose a valid paid subscription plan." },
//         { status: 400 }
//       );
//     }

//     const plan = planType as PaidPlan;
//     const amount = PLAN_PRICES[plan];

//     const callbackUrl = process.env.CHAPA_SUBSCRIPTION_CALLBACK_URL;
//     const returnUrl = process.env.CHAPA_SUBSCRIPTION_RETURN_URL;
//     const secretKey = process.env.CHAPA_SECRET_KEY;

//     if (!secretKey || !callbackUrl || !returnUrl) {
//       console.error("Subscription payment environment configuration is missing.");

//       return NextResponse.json(
//         { message: "Subscription payments are not configured yet." },
//         { status: 500 }
//       );
//     }

//     const user = await prisma.user.findUnique({
//       where: { userId: String(token.id) },
//       select: {
//         userId: true,
//         email: true,
//         fullName: true,
//         isActive: true,
//       },
//     });

//     if (!user || !user.isActive || !user.email) {
//       return NextResponse.json(
//         { message: "Your active account and email are required." },
//         { status: 403 }
//       );
//     }

//     const store = await prisma.store.findUnique({
//       where: { ownerId: user.userId },
//       include: { subscription: true },
//     });

//     if (!store) {
//       return NextResponse.json(
//         { message: "Create your store before purchasing a subscription." },
//         { status: 404 }
//       );
//     }

//     if (!store.subscription) {
//       return NextResponse.json(
//         { message: "Your store subscription record was not found." },
//         { status: 409 }
//       );
//     }

//     // Do not allow overlapping paid subscriptions or multiple concurrent
//     // checkout attempts for the same store.
//     const currentSubscription = store.subscription;
//     const now = new Date();

//     const currentPaidPlanIsActive =
//       currentSubscription.planType !== "TRIAL" &&
//       currentSubscription.status === "ACTIVE" &&
//       currentSubscription.isActive &&
//       currentSubscription.endDate.getTime() > now.getTime();

//     if (currentPaidPlanIsActive) {
//       return NextResponse.json(
//         {
//           message:
//             "Your paid subscription is still active. You can purchase another plan after it expires.",
//         },
//         { status: 409 }
//       );
//     }

//     const pendingPayment = await prisma.subscriptionPayment.findFirst({
//       where: {
//         storeId: store.storeId,
//         status: "PENDING",
//         provider: "CHAPA",
//       },
//       select: { subscriptionPaymentId: true },
//     });

//     if (pendingPayment) {
//       return NextResponse.json(
//         {
//           message:
//             "A subscription payment is already pending for this store. Complete it or wait for its status to be resolved before starting another.",
//         },
//         { status: 409 }
//       );
//     }

//     const txRef = `BM-SUB-${Date.now()}-${randomUUID()}`;

//     // Record the intended plan and server-calculated amount before
//     // contacting Chapa. The browser never chooses the payment amount.
//     const payment = await prisma.subscriptionPayment.create({
//       data: {
//         storeId: store.storeId,
//         subscriptionId: currentSubscription.subscriptionId,
//         planType: plan,
//         provider: "CHAPA",
//         transactionReference: txRef,
//         amount,
//         currency: "ETB",
//         status: "PENDING",
//       },
//     });

//     try {
//       const nameParts = user.fullName.trim().split(/\s+/);
//       const firstName = nameParts[0] || "Store";
//       const lastName = nameParts.slice(1).join(" ") || "Owner";

//       const chapaResponse = await fetch(
//         "https://api.chapa.co/v1/transaction/initialize",
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${secretKey}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             amount: amount.toFixed(2),
//             currency: "ETB",
//             email: user.email,
//             first_name: firstName,
//             last_name: lastName,
//             tx_ref: txRef,
//             callback_url: callbackUrl,
//             return_url: returnUrl,
//             customization: {
//               title: "BeautyMart",
//               description:
//                 plan === "STARTER"
//                   ? "BeautyMart six-month store subscription"
//                   : "BeautyMart one-year store subscription",
//             },
//           }),
//           cache: "no-store",
//           signal: AbortSignal.timeout(15000),
//         }
//       );

//       const chapaData = await chapaResponse.json();

//       if (
//         !chapaResponse.ok ||
//         chapaData?.status !== "success" ||
//         typeof chapaData?.data?.checkout_url !== "string" ||
//         !chapaData.data.checkout_url.startsWith("https://")
//       ) {
//         await prisma.subscriptionPayment.updateMany({
//           where: {
//             subscriptionPaymentId: payment.subscriptionPaymentId,
//             status: "PENDING",
//           },
//           data: { status: "FAILED" },
//         });

//         console.error("Chapa subscription initialization was unsuccessful.");

//         return NextResponse.json(
//           { message: "Unable to start the subscription payment. Please try again." },
//           { status: 502 }
//         );
//       }

//       return NextResponse.json({
//         message: "Subscription payment initialized.",
//         checkoutUrl: chapaData.data.checkout_url,
//       });
//     } catch (error) {
//       // A network timeout can happen after Chapa receives the request.
//       // Do not mark that payment FAILED automatically: the outcome may
//       // be uncertain, so keep it pending until it can be reconciled.
//       console.error("Subscription payment initialization could not be confirmed.");

//       return NextResponse.json(
//         {
//           message:
//             "We could not confirm the checkout result. Please do not start another payment; check the subscription page or contact support.",
//         },
//         { status: 502 }
//       );
//     }
//   } catch (error) {
//     console.error("Subscription payment initialization failed.");

//     return NextResponse.json(
//       { message: "Unable to initialize the subscription payment." },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

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

function redirectToSubscription(
  result: "success" | "failed" | "pending"
) {
  const returnUrl = process.env.CHAPA_SUBSCRIPTION_RETURN_URL;

  if (!returnUrl) {
    return NextResponse.json(
      { message: "Subscription return URL is not configured." },
      { status: 500 }
    );
  }

  try {
    const destination = new URL(returnUrl);
    destination.searchParams.set("subscription_payment", result);

    return NextResponse.redirect(destination, 303);
  } catch {
    return NextResponse.json(
      { message: "Subscription return URL is invalid." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);

    // Chapa documents trx_ref and ref_id in its callback response.
    // tx_ref is also accepted for compatibility.
    let txRef =
      requestUrl.searchParams.get("trx_ref") ??
      requestUrl.searchParams.get("tx_ref") ??
      requestUrl.searchParams.get("transaction_reference");

    // Some integrations may supply the callback fields as JSON.
    if (!txRef) {
      try {
        const payload = (await request.json()) as {
          trx_ref?: unknown;
          tx_ref?: unknown;
        };

        if (typeof payload.trx_ref === "string") {
          txRef = payload.trx_ref;
        } else if (typeof payload.tx_ref === "string") {
          txRef = payload.tx_ref;
        }
      } catch {
        // An empty GET body is normal. Continue using the URL.
      }
    }

    if (!txRef || txRef.length > 200) {
      return redirectToSubscription("failed");
    }

    const secretKey = process.env.CHAPA_SECRET_KEY;

    if (!secretKey) {
      console.error(
        "Chapa subscription verification is not configured."
      );

      return NextResponse.json(
        { message: "Payment verification is temporarily unavailable." },
        { status: 500 }
      );
    }

    const payment = await prisma.subscriptionPayment.findUnique({
      where: { transactionReference: txRef },
      select: {
        subscriptionPaymentId: true,
        transactionReference: true,
        subscriptionId: true,
        planType: true,
        amount: true,
        currency: true,
        status: true,
        provider: true,
        storeId: true,
      },
    });

    if (
      !payment ||
      payment.provider !== "CHAPA" ||
      !payment.transactionReference
    ) {
      return redirectToSubscription("failed");
    }

    // A repeated callback must never extend an already-paid plan again.
    if (payment.status === "PAID") {
      return redirectToSubscription("success");
    }

    if (
      payment.status !== "PENDING" ||
      (payment.planType !== "STARTER" &&
        payment.planType !== "STANDARD")
    ) {
      return redirectToSubscription("failed");
    }

   
let verificationResponse: Response;

try {
  verificationResponse = await fetch(
    `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    }
  );
} catch {
  console.error("Chapa subscription verification request failed.");
  return redirectToSubscription("pending");
}

if (!verificationResponse.ok) {
  console.error(
    "Chapa could not confirm the subscription transaction."
  );
  return redirectToSubscription("pending");
}


   let verification: {
  status?: unknown;
  data?: {
    status?: unknown;
    tx_ref?: unknown;
    amount?: unknown;
    currency?: unknown;
  };
};

try {
  verification = await verificationResponse.json();
} catch {
  console.error("Chapa returned an unreadable verification response.");
  return redirectToSubscription("pending");
}
    const verified = verification.data;
    const verifiedAmount =
      typeof verified?.amount === "number" ||
      typeof verified?.amount === "string"
        ? Number(verified.amount)
        : NaN;

    const expectedAmount = Number(payment.amount);

if (
  verification.status !== "success" ||
  verified?.status !== "success" ||
  verified.tx_ref !== txRef ||
  !Number.isFinite(verifiedAmount) ||
  verifiedAmount !== expectedAmount ||
  verified.currency !== payment.currency ||
  payment.currency !== "ETB"
) {
  console.error(
    "Chapa subscription verification did not match the expected payment."
  );

  // A mismatch is not proof that the payment failed.
  // Keep the payment pending for safe reconciliation.
  return redirectToSubscription("pending");
}

const activated = await prisma.$transaction<
  { activated: false } | { activated: true; endDate: Date }
>(async (tx) => {
      // Claim the pending payment exactly once. Concurrent callbacks
      // cannot activate or extend the subscription twice.
      const paymentUpdate = await tx.subscriptionPayment.updateMany({
        where: {
          subscriptionPaymentId: payment.subscriptionPaymentId,
          transactionReference: txRef,
          provider: "CHAPA",
          status: "PENDING",
        },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      if (paymentUpdate.count === 0) {
        const latestPayment =
          await tx.subscriptionPayment.findUnique({
            where: {
              subscriptionPaymentId: payment.subscriptionPaymentId,
            },
            select: { status: true },
          });
if (latestPayment?.status === "PAID") {
  return { activated: false };
}

        throw new Error(
          "Subscription payment could not be claimed safely."
        );
      }

      const subscription = await tx.subscription.findUnique({
        where: { subscriptionId: payment.subscriptionId },
        select: {
          subscriptionId: true,
          storeId: true,
          endDate: true,
        },
      });

      if (!subscription) {
        throw new Error(
          "Subscription record was not found during activation."
        );
      }
if (subscription.storeId !== payment.storeId) {
  throw new Error(
    "Subscription payment and subscription belong to different stores."
  );
}

    // Paid subscriptions start immediately after successful payment verification.
    // Any unused free-trial time is forfeited and cannot be used later.

    const now = new Date();

    if (
      payment.planType !== "STARTER" &&
      payment.planType !== "STANDARD"
    ) {
      throw new Error("Invalid paid subscription plan.");
    }

    const startDate = now;

    const endDate = addCalendarMonths(
      startDate,
      PLAN_MONTHS[payment.planType]
    );

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

      return {
        activated: true,
        endDate,
      };
    });

  if (activated.activated) {
    
      try {
        const store = await prisma.store.findUnique({
          where: { storeId: payment.storeId },
          select: {
            ownerId: true,
            storeName: true,
          },
        });

        if (store) {
          // Preserve the store-owner notification.
          try {
            await prisma.notification.create({
              data: {
                userId: store.ownerId,
                title: "Subscription activated",
                message: `Your ${payment.planType} subscription for ${store.storeName} is active until ${activated.endDate.toLocaleDateString("en-GB")}.`,
                notificationType: "SUBSCRIPTION",
              },
            });
          } catch (error) {
            console.error("Store-owner subscription notification failed:", error);
          }

          // Notify active administrators about the activation.
          try {
            const admins = await prisma.user.findMany({
              where: {
                role: "SUPER_ADMIN",
                isActive: true,
              },
              select: { userId: true },
            });

            if (admins.length > 0) {
              await prisma.notification.createMany({
                data: admins.map((admin) => ({
                  userId: admin.userId,
                  title: "Store subscription activated",
                  message: `${payment.planType} subscription for ${store.storeName} was activated and is valid until ${activated.endDate.toLocaleDateString("en-GB")}.`,
                  notificationType: "SUBSCRIPTION" as const,
                  deduplicationKey: `admin-subscription-activated:${payment.storeId}:${activated.endDate.toISOString()}:${admin.userId}`,
                })),
                skipDuplicates: true,
              });
            }
          } catch (error) {
            console.error("Admin subscription notifications failed:", error);
          }
        }
      } catch (error) {
        console.error("Could not load store for subscription notifications:", error);
      }

  }

    return redirectToSubscription("success");
  } catch {
    console.error(
      "Subscription callback processing failed."
    );

    return NextResponse.json(
      {
        message:
          "Unable to process the subscription callback. The payment may need to be checked.",
      },
      { status: 500 }
    );
  }
}
