
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { PrismaClient } from "../../../generated/prisma/client";
import { handleSubscriptionReminderRequest } from "../../../../lib/subscription-reminder-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REMINDER_DAYS = {
  TRIAL: 5,
  STARTER: 10,
  STANDARD: 15,
} as const;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function ethiopianDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Addis_Ababa",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

function dateKeyToUtcDay(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

type SubscriptionReminderDependencies = {
  db?: PrismaClient;
  cronSecret?: string;
};

// Keeping the handler factory small makes it possible to test the real route
// behavior with an isolated database, without pointing tests at development.
function createSubscriptionReminderHandler({
  db = prisma,
  cronSecret = process.env.CRON_SECRET,
}: SubscriptionReminderDependencies = {}) {
  return async function GET(request: Request) {
  const secret = cronSecret;

  if (!secret) {
    console.error("CRON_SECRET is not configured.");
    return NextResponse.json(
      { error: "Scheduled job is not configured." },
      { status: 500 }
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }


  try {
    const now = new Date();
    const todayKey = ethiopianDateKey(now);
    const todayUtcDay = dateKeyToUtcDay(todayKey);

    // Expiry is a real state change, not only a notification. This keeps the
    // database, admin screens, and store-management access rules consistent.
    const expiredSubscriptions = await db.subscription.findMany({
      where: {
        status: "ACTIVE",
        isActive: true,
        endDate: { lt: now },
      },
      select: {
        subscriptionId: true,
        planType: true,
        store: { select: { storeName: true, ownerId: true } },
      },
    });

    if (expiredSubscriptions.length > 0) {
      await db.subscription.updateMany({
        where: {
          subscriptionId: { in: expiredSubscriptions.map((item) => item.subscriptionId) },
          status: "ACTIVE",
          isActive: true,
        },
        data: { status: "EXPIRED", isActive: false },
      });
    }

    const subscriptions = await db.subscription.findMany({
      where: {
        status: "ACTIVE",
        isActive: true,
        endDate: { gte: now },
        planType: { in: ["TRIAL", "STARTER", "STANDARD"] },
      },
      select: {
        subscriptionId: true,
        planType: true,
        endDate: true,
        store: {
          select: {
            storeName: true,
            ownerId: true,
          },
        },
      },
    });

    let notificationsCreated = 0;

    const admins = await db.user.findMany({
      where: {
        role: "SUPER_ADMIN",
        isActive: true,
      },
      select: {
        userId: true,
      },
    });


    for (const subscription of expiredSubscriptions) {
      const expiredResult = await db.notification.createMany({
        data: [
          {
            userId: subscription.store.ownerId,
            title: "Subscription expired",
            message: `The subscription for ${subscription.store.storeName} has expired. Renew or choose a paid plan to restore store management.`,
            notificationType: "SUBSCRIPTION",
            deduplicationKey: `subscription-expired:${subscription.subscriptionId}:${subscription.store.ownerId}`,
          },
          ...admins.map((admin) => ({
            userId: admin.userId,
            title: "Store subscription expired",
            message: `The ${subscription.planType} subscription for ${subscription.store.storeName} has expired.`,
            notificationType: "SUBSCRIPTION" as const,
            deduplicationKey: `admin-subscription-expired:${subscription.subscriptionId}:${admin.userId}`,
          })),
        ],
        skipDuplicates: true,
      });
      notificationsCreated += expiredResult.count;
    }

    for (const subscription of subscriptions) {
      const endDateKey = ethiopianDateKey(subscription.endDate);

      const daysRemaining = Math.round(
        (dateKeyToUtcDay(endDateKey) - todayUtcDay) / DAY_IN_MS
      );

      const reminderThreshold = REMINDER_DAYS[subscription.planType];

      if (daysRemaining > reminderThreshold) {
        continue;
      }

      const expiryDate = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Addis_Ababa",
        dateStyle: "long",
      }).format(subscription.endDate);

      const planLabel =
        subscription.planType === "TRIAL"
          ? "free trial"
          : `${subscription.planType} plan`;

      const countdown =
        daysRemaining === 0
          ? "expires today"
          : `expires in ${daysRemaining} ${
              daysRemaining === 1 ? "day" : "days"
            }`;

      const actionMessage =
        daysRemaining === 0
          ? "Renew or choose a paid plan now to avoid interruption to store management."
          : "Renew before it expires to keep managing your store.";

    
      const result = await db.notification.createMany({
        data: [
          {
            userId: subscription.store.ownerId,
            title:
              daysRemaining === 0
                ? "Subscription expires today"
                : "Subscription expiring soon",
            message: `Your ${planLabel} for ${subscription.store.storeName} ${countdown} (${expiryDate}). ${actionMessage}`,
            notificationType: "SUBSCRIPTION",
            deduplicationKey: `subscription-reminder:${subscription.subscriptionId}:${todayKey}`,
          },
          ...admins.map((admin) => ({
            userId: admin.userId,
            title:
              daysRemaining === 0
                ? "Store subscription expires today"
                : "Store subscription expiring soon",
            message: `The ${planLabel} for ${subscription.store.storeName} ${countdown} (${expiryDate}).`,
            notificationType: "SUBSCRIPTION" as const,
            deduplicationKey: `admin-subscription-reminder:${subscription.subscriptionId}:${todayKey}:${admin.userId}`,
          })),
        ],
        skipDuplicates: true,
      });


      notificationsCreated += result.count;
    }

    return NextResponse.json({
      success: true,
      subscriptionsChecked: subscriptions.length,
      notificationsCreated,
      date: todayKey,
    });
  } catch (error) {
    console.error("Subscription reminder job failed:", error);

    return NextResponse.json(
      { error: "Could not process subscription reminders." },
      { status: 500 }
    );
  }
  };
}

export async function GET(request: Request) {
  return handleSubscriptionReminderRequest(request, prisma, process.env.CRON_SECRET);
}
