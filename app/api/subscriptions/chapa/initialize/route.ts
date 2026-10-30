
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getActiveRequestUser } from "../../../../../lib/request-auth";

export const runtime = "nodejs";

const PLAN_PRICES = {
  STARTER: 3000,
  STANDARD: 5000,
} as const;

type PaidPlan = keyof typeof PLAN_PRICES;

export async function POST(request: NextRequest) {
  try {
    const activeUser = await getActiveRequestUser(request);

    if (!activeUser) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    if (activeUser.role !== "STORE_OWNER") {
      return NextResponse.json(
        { message: "Only store owners can purchase subscriptions." },
        { status: 403 }
      );
    }

    let body: { planType?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 }
      );
    }

    const requestedPlan = body.planType;

    if (
      typeof requestedPlan !== "string" ||
      !Object.prototype.hasOwnProperty.call(
        PLAN_PRICES,
        requestedPlan
      )
    ) {
      return NextResponse.json(
        { message: "Choose a valid paid subscription plan." },
        { status: 400 }
      );
    }

    const plan = requestedPlan as PaidPlan;
    const amount = PLAN_PRICES[plan];

    const callbackUrl =
      process.env.CHAPA_SUBSCRIPTION_CALLBACK_URL;
    const returnUrl =
      process.env.CHAPA_SUBSCRIPTION_RETURN_URL;
    const secretKey = process.env.CHAPA_SECRET_KEY;

    if (!secretKey || !callbackUrl || !returnUrl) {
      console.error(
        "Subscription payment environment configuration is missing."
      );

      return NextResponse.json(
        {
          message:
            "Subscription payments are not configured yet.",
        },
        { status: 500 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { userId: activeUser.userId },
      select: {
        userId: true,
        email: true,
        fullName: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive || !user.email) {
      return NextResponse.json(
        {
          message:
            "Your active account and email are required.",
        },
        { status: 403 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { ownerId: user.userId },
      include: { subscription: true },
    });

    if (!store) {
      return NextResponse.json(
        {
          message:
            "Create your store before purchasing a subscription.",
        },
        { status: 404 }
      );
    }

    const subscription = store.subscription;

    if (!subscription) {
      return NextResponse.json(
        {
          message:
            "Your store subscription record was not found.",
        },
        { status: 409 }
      );
    }

    const now = new Date();

    const currentPaidPlanIsActive =
      subscription.planType !== "TRIAL" &&
      subscription.status === "ACTIVE" &&
      subscription.isActive &&
      subscription.endDate.getTime() > now.getTime();

    if (currentPaidPlanIsActive) {
      return NextResponse.json(
        {
          message:
            "Your paid subscription is still active. You can purchase another plan after it expires.",
        },
        { status: 409 }
      );
    }

    const pendingPayment =
      await prisma.subscriptionPayment.findFirst({
        where: {
          storeId: store.storeId,
          status: "PENDING",
          provider: "CHAPA",
        },
        select: {
          subscriptionPaymentId: true,
        },
      });

    if (pendingPayment) {
      return NextResponse.json(
        {
          message:
            "A subscription payment is already pending for this store. Complete it or contact support before starting another.",
        },
        { status: 409 }
      );
    }

 
const txRef = `BM-${randomUUID()}`;

// Save the server-calculated amount before requesting checkout.
let payment;

try {
  payment = await prisma.subscriptionPayment.create({
    data: {
      storeId: store.storeId,
      subscriptionId: subscription.subscriptionId,
      planType: plan,
      provider: "CHAPA",
      transactionReference: txRef,
      amount,
      currency: "ETB",
      status: "PENDING",
    },
  });
} catch (error: unknown) {
  const isUniqueConstraintError =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002";

  if (isUniqueConstraintError) {
    const existingPending =
      await prisma.subscriptionPayment.findFirst({
        where: {
          storeId: store.storeId,
          provider: "CHAPA",
          status: "PENDING",
        },
        select: {
          subscriptionPaymentId: true,
        },
      });

    if (existingPending) {
      return NextResponse.json(
        {
          message:
            "A subscription payment is already pending for this store. Complete it or contact support before starting another.",
        },
        { status: 409 }
      );
    }
  }

  throw error;
}


    try {
      const nameParts = user.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "Store";
      const lastName =
        nameParts.slice(1).join(" ") || "Owner";

      const chapaResponse = await fetch(
        "https://api.chapa.co/v1/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amount.toFixed(2),
            currency: "ETB",
            email: user.email,
            first_name: firstName,
            last_name: lastName,
            tx_ref: txRef,
            callback_url: callbackUrl,
            return_url: returnUrl,
            customization: {
              title: "BeautyMart",
              description:
                plan === "STARTER"
                  ? "BeautyMart six-month store subscription"
                  : "BeautyMart one-year store subscription",
            },
          }),
          cache: "no-store",
          signal: AbortSignal.timeout(30000),
        }
      );


         let chapaData: {
        status?: unknown;
        message?: unknown;
        data?: {
          checkout_url?: unknown;
          message?: unknown;
        };
      };

      const chapaResponseText = await chapaResponse.text();

      try {
        chapaData = JSON.parse(chapaResponseText);
      } catch {
        chapaData = {};
      }

      const checkoutUrl = chapaData.data?.checkout_url;

      if (
        !chapaResponse.ok ||
        chapaData.status !== "success" ||
        typeof checkoutUrl !== "string" ||
        !checkoutUrl.startsWith("https://")
      ) {
        // Log safe diagnostic details, never the secret key.
       
console.error("Chapa subscription initialization failed:", {
  httpStatus: chapaResponse.status,
  providerStatus:

            typeof chapaData.status === "string"
              ? chapaData.status
              : "missing",
          checkoutUrlReceived: typeof checkoutUrl === "string",
        });

        await prisma.subscriptionPayment.updateMany({
          where: {
            subscriptionPaymentId:
              payment.subscriptionPaymentId,
            status: "PENDING",
          },
          data: { status: "FAILED" },
        });

        return NextResponse.json(
          {
            message:
              "Unable to start the subscription payment. Please try again.",
          },
          { status: 502 }
        );
      }


    //   try {
    //     chapaData = await chapaResponse.json();
    //   } catch {
    //     chapaData = {};
    //   }

    //   const checkoutUrl = chapaData.data?.checkout_url;

    //   if (
    //     !chapaResponse.ok ||
    //     chapaData.status !== "success" ||
    //     typeof checkoutUrl !== "string" ||
    //     !checkoutUrl.startsWith("https://")
    //   ) {
    //     // Chapa explicitly rejected the initialization.
    //     await prisma.subscriptionPayment.updateMany({
    //       where: {
    //         subscriptionPaymentId:
    //           payment.subscriptionPaymentId,
    //         status: "PENDING",
    //       },
    //       data: { status: "FAILED" },
    //     });

    //     console.error(
    //       "Chapa subscription initialization was unsuccessful."
    //     );

    //     return NextResponse.json(
    //       {
    //         message:
    //           "Unable to start the subscription payment. Please try again.",
    //       },
    //       { status: 502 }
    //     );
    //   }

      return NextResponse.json({
        message: "Subscription payment initialized.",
        checkoutUrl,
      });
    } catch {
      // A timeout can happen after Chapa receives the request.
      // Keep the payment pending until its outcome is verified.
      console.error(
        "Subscription initialization outcome is uncertain."
      );

      return NextResponse.json(
        {
          message:
            "We could not confirm the checkout result. Do not start another payment; check your subscription page or contact support.",
        },
        { status: 502 }
      );
    }
  } catch {
    console.error(
      "Subscription payment initialization failed."
    );

    return NextResponse.json(
      {
        message:
          "Unable to initialize the subscription payment.",
      },
      { status: 500 }
    );
  }
}
