import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { activateVerifiedSubscriptionPayment } from "./subscription-activation";

const url = process.env.TEST_DATABASE_URL;
const safe = Boolean(url && url.split("?", 1)[0].toLowerCase().includes("test") && url !== process.env.DATABASE_URL);
const db = safe ? new PrismaClient({ adapter: new PrismaPg({ connectionString: url! }) }) : null;

async function fixture(planType: "STARTER" | "STANDARD", status: "PENDING" | "FAILED" = "PENDING") {
  if (!db) throw new Error("Safe test database required.");
  const suffix = randomUUID();
  const owner = await db.user.create({ data: { fullName: `Subscription test ${suffix}`, email: `subscription-${suffix}@example.test`, passwordHash: "test", role: "STORE_OWNER" } });
  const store = await db.store.create({ data: { ownerId: owner.userId, storeName: `Subscription test store ${suffix}`, subscription: { create: { planType: "TRIAL", status: "ACTIVE", isActive: true, startDate: new Date(Date.now() - 86400000), endDate: new Date(Date.now() + 86400000) } } }, include: { subscription: true } });
  const ref = `sub-test-${suffix}`;
  const payment = await db.subscriptionPayment.create({ data: { storeId: store.storeId, subscriptionId: store.subscription!.subscriptionId, planType, provider: "CHAPA", transactionReference: ref, amount: planType === "STARTER" ? 3000 : 5000, currency: "ETB", status } });
  return { ownerId: owner.userId, storeId: store.storeId, subscriptionId: store.subscription!.subscriptionId, paymentId: payment.subscriptionPaymentId, ref };
}

async function cleanup(data: Awaited<ReturnType<typeof fixture>>) {
  if (!db) return;
  await db.subscriptionPayment.deleteMany({ where: { storeId: data.storeId } });
  await db.store.delete({ where: { storeId: data.storeId } });
  await db.user.delete({ where: { userId: data.ownerId } });
}

test("subscription integration tests require beautymart_test", { skip: safe ? false : "Set TEST_DATABASE_URL to beautymart_test." }, () => assert.ok(db));

for (const plan of ["STARTER", "STANDARD"] as const) {
  test(`${plan} activates once and replaces the trial`, { skip: safe ? false : "TEST_DATABASE_URL missing." }, async () => {
    const data = await fixture(plan);
    try {
      const [first, second] = await Promise.all([
        activateVerifiedSubscriptionPayment(data.paymentId, data.ref, db!),
        activateVerifiedSubscriptionPayment(data.paymentId, data.ref, db!),
      ]);
      assert.equal(Number(first.activated) + Number(second.activated), 1);
      const subscription = await db!.subscription.findUnique({ where: { subscriptionId: data.subscriptionId } });
      const payment = await db!.subscriptionPayment.findUnique({ where: { subscriptionPaymentId: data.paymentId } });
      assert.equal(payment?.status, "PAID");
      assert.equal(subscription?.planType, plan);
      assert.equal(subscription?.status, "ACTIVE");
      assert.equal(subscription?.isActive, true);
      const expectedMonths = plan === "STARTER" ? 6 : 12;
      assert.equal((subscription!.endDate.getFullYear() - subscription!.startDate.getFullYear()) * 12 + subscription!.endDate.getMonth() - subscription!.startDate.getMonth(), expectedMonths);
    } finally { await cleanup(data); }
  });
}

test("a failed subscription payment cannot activate a trial", { skip: safe ? false : "TEST_DATABASE_URL missing." }, async () => {
  const data = await fixture("STARTER", "FAILED");
  try {
    await assert.rejects(activateVerifiedSubscriptionPayment(data.paymentId, data.ref, db!));
    const subscription = await db!.subscription.findUnique({ where: { subscriptionId: data.subscriptionId } });
    assert.equal(subscription?.planType, "TRIAL");
  } finally { await cleanup(data); }
});

test.after(async () => { await db?.$disconnect(); });
