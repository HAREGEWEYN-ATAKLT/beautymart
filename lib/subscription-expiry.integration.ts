import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { handleSubscriptionReminderRequest } from "./subscription-reminder-handler";

const url = process.env.TEST_DATABASE_URL;
const safe = Boolean(
  url &&
    url.split("?", 1)[0].toLowerCase().includes("test") &&
    url !== process.env.DATABASE_URL,
);
const db = safe
  ? new PrismaClient({ adapter: new PrismaPg({ connectionString: url! }) })
  : null;

test(
  "subscription expiry route tests require beautymart_test",
  { skip: safe ? false : "Set TEST_DATABASE_URL to a separate test database." },
  () => assert.ok(db),
);

test(
  "the protected expiry route expires once and creates one notification per recipient",
  { skip: safe ? false : "TEST_DATABASE_URL missing." },
  async () => {
    const suffix = randomUUID();
    const owner = await db!.user.create({
      data: {
        fullName: `Expiry owner ${suffix}`,
        email: `expiry-owner-${suffix}@example.test`,
        passwordHash: "test",
        role: "STORE_OWNER",
      },
    });
    const admin = await db!.user.create({
      data: {
        fullName: `Expiry admin ${suffix}`,
        email: `expiry-admin-${suffix}@example.test`,
        passwordHash: "test",
        role: "SUPER_ADMIN",
      },
    });
    const store = await db!.store.create({
      data: {
        ownerId: owner.userId,
        storeName: `Expiry store ${suffix}`,
        subscription: {
          create: {
            planType: "TRIAL",
            status: "ACTIVE",
            isActive: true,
            startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      },
      include: { subscription: true },
    });

    try {
      const unauthorized = await handleSubscriptionReminderRequest(
        new Request("http://localhost/api/cron/subscription-reminders"),
        db!,
        "test-cron-secret",
      );
      assert.equal(unauthorized.status, 401);

      const request = new Request(
        "http://localhost/api/cron/subscription-reminders",
        { headers: { authorization: "Bearer test-cron-secret" } },
      );
      assert.equal((await handleSubscriptionReminderRequest(request, db!, "test-cron-secret")).status, 200);
      assert.equal((await handleSubscriptionReminderRequest(request, db!, "test-cron-secret")).status, 200);

      const subscription = await db!.subscription.findUnique({
        where: { subscriptionId: store.subscription!.subscriptionId },
      });
      assert.equal(subscription?.status, "EXPIRED");
      assert.equal(subscription?.isActive, false);

      const notifications = await db!.notification.findMany({
        where: {
          deduplicationKey: {
            in: [
              `subscription-expired:${subscription!.subscriptionId}:${owner.userId}`,
              `admin-subscription-expired:${subscription!.subscriptionId}:${admin.userId}`,
            ],
          },
        },
      });
      assert.equal(notifications.length, 2);
    } finally {
      await db!.store.delete({ where: { storeId: store.storeId } });
      await db!.user.deleteMany({ where: { userId: { in: [owner.userId, admin.userId] } } });
    }
  },
);

test.after(async () => {
  await db?.$disconnect();
});
