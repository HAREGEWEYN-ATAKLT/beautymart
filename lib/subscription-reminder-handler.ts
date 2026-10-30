import { NextResponse } from "next/server";
import { PrismaClient } from "../app/generated/prisma/client";

const REMINDER_DAYS = { TRIAL: 5, STARTER: 10, STANDARD: 15 } as const;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

type SubscriptionNotification = {
  userId: string;
  title: string;
  message: string;
  notificationType: "SUBSCRIPTION";
  deduplicationKey: string;
};

// An administrator can be deactivated or removed while this background job
// is running. Re-check recipients once if PostgreSQL reports that race, so a
// stale administrator does not stop expiry processing for every store.
async function createSubscriptionNotifications(db: PrismaClient, data: SubscriptionNotification[]) {
  try {
    return await db.notification.createMany({ data, skipDuplicates: true });
  } catch (error: unknown) {
    if (!(typeof error === "object" && error !== null && "code" in error && error.code === "P2003")) {
      throw error;
    }
    const recipients = await db.user.findMany({
      where: { userId: { in: data.map((notification) => notification.userId) }, isActive: true },
      select: { userId: true },
    });
    const recipientIds = new Set(recipients.map((recipient) => recipient.userId));
    const currentData = data.filter((notification) => recipientIds.has(notification.userId));
    if (currentData.length === 0) return { count: 0 };
    return db.notification.createMany({ data: currentData, skipDuplicates: true });
  }
}

function ethiopianDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Addis_Ababa", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function dateKeyToUtcDay(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export async function handleSubscriptionReminderRequest(request: Request, db: PrismaClient, cronSecret: string | undefined) {
  if (!cronSecret) {
    console.error("CRON_SECRET is not configured.");
    return NextResponse.json({ error: "Scheduled job is not configured." }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const now = new Date();
    const todayKey = ethiopianDateKey(now);
    const todayUtcDay = dateKeyToUtcDay(todayKey);
    const expiredSubscriptions = await db.subscription.findMany({
      where: { status: "ACTIVE", isActive: true, endDate: { lt: now } },
      select: { subscriptionId: true, planType: true, store: { select: { storeName: true, ownerId: true } } },
    });
    if (expiredSubscriptions.length) {
      await db.subscription.updateMany({
        where: { subscriptionId: { in: expiredSubscriptions.map((item) => item.subscriptionId) }, status: "ACTIVE", isActive: true },
        data: { status: "EXPIRED", isActive: false },
      });
    }

    const subscriptions = await db.subscription.findMany({
      where: { status: "ACTIVE", isActive: true, endDate: { gte: now }, planType: { in: ["TRIAL", "STARTER", "STANDARD"] } },
      select: { subscriptionId: true, planType: true, endDate: true, store: { select: { storeName: true, ownerId: true } } },
    });
    const admins = await db.user.findMany({ where: { role: "SUPER_ADMIN", isActive: true }, select: { userId: true } });
    let notificationsCreated = 0;

    for (const subscription of expiredSubscriptions) {
      if (!subscription.store) continue;
      const result = await createSubscriptionNotifications(db, [
          { userId: subscription.store.ownerId, title: "Subscription expired", message: `The subscription for ${subscription.store.storeName} has expired. Renew or choose a paid plan to restore store management.`, notificationType: "SUBSCRIPTION", deduplicationKey: `subscription-expired:${subscription.subscriptionId}:${subscription.store.ownerId}` },
          ...admins.map((admin) => ({ userId: admin.userId, title: "Store subscription expired", message: `The ${subscription.planType} subscription for ${subscription.store.storeName} has expired.`, notificationType: "SUBSCRIPTION" as const, deduplicationKey: `admin-subscription-expired:${subscription.subscriptionId}:${admin.userId}` })),
      ]);
      notificationsCreated += result.count;
    }

    for (const subscription of subscriptions) {
      if (!subscription.store) continue;
      const endDateKey = ethiopianDateKey(subscription.endDate);
      const daysRemaining = Math.round((dateKeyToUtcDay(endDateKey) - todayUtcDay) / DAY_IN_MS);
      if (daysRemaining > REMINDER_DAYS[subscription.planType]) continue;
      const expiryDate = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Addis_Ababa", dateStyle: "long" }).format(subscription.endDate);
      const planLabel = subscription.planType === "TRIAL" ? "free trial" : `${subscription.planType} plan`;
      const countdown = daysRemaining === 0 ? "expires today" : `expires in ${daysRemaining} ${daysRemaining === 1 ? "day" : "days"}`;
      const actionMessage = daysRemaining === 0 ? "Renew or choose a paid plan now to avoid interruption to store management." : "Renew before it expires to keep managing your store.";
      const result = await createSubscriptionNotifications(db, [
          { userId: subscription.store.ownerId, title: daysRemaining === 0 ? "Subscription expires today" : "Subscription expiring soon", message: `Your ${planLabel} for ${subscription.store.storeName} ${countdown} (${expiryDate}). ${actionMessage}`, notificationType: "SUBSCRIPTION", deduplicationKey: `subscription-reminder:${subscription.subscriptionId}:${todayKey}` },
          ...admins.map((admin) => ({ userId: admin.userId, title: daysRemaining === 0 ? "Store subscription expires today" : "Store subscription expiring soon", message: `The ${planLabel} for ${subscription.store.storeName} ${countdown} (${expiryDate}).`, notificationType: "SUBSCRIPTION" as const, deduplicationKey: `admin-subscription-reminder:${subscription.subscriptionId}:${todayKey}:${admin.userId}` })),
      ]);
      notificationsCreated += result.count;
    }
    return NextResponse.json({ success: true, subscriptionsChecked: subscriptions.length, notificationsCreated, date: todayKey });
  } catch (error) {
    console.error("Subscription reminder job failed:", error);
    return NextResponse.json({ error: "Could not process subscription reminders." }, { status: 500 });
  }
}
