import { prisma } from "./prisma";
import { PrismaClient } from "../app/generated/prisma/client";

export const PAID_SUBSCRIPTION_PLANS = {
  STARTER: { amount: 3000, months: 6 },
  STANDARD: { amount: 5000, months: 12 },
} as const;

function addCalendarMonths(date: Date, months: number) {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  result.setDate(Math.min(day, new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()));
  return result;
}

export async function activateVerifiedSubscriptionPayment(
  paymentId: string,
  transactionReference: string,
  db: PrismaClient = prisma,
) {
  return db.$transaction(async (tx) => {
    const payment = await tx.subscriptionPayment.findUnique({
      where: { subscriptionPaymentId: paymentId },
      select: { subscriptionPaymentId: true, transactionReference: true, subscriptionId: true, storeId: true, planType: true, amount: true, currency: true, status: true, provider: true },
    });
    if (!payment || payment.provider !== "CHAPA" || payment.transactionReference !== transactionReference) {
      throw new Error("Subscription payment reference does not match.");
    }
    const plan = payment.planType === "STARTER" || payment.planType === "STANDARD"
      ? PAID_SUBSCRIPTION_PLANS[payment.planType]
      : null;
    if (!plan || payment.currency !== "ETB" || Number(payment.amount) !== plan.amount) {
      throw new Error("Subscription payment does not match a valid paid plan.");
    }
    const claimed = await tx.subscriptionPayment.updateMany({
      where: { subscriptionPaymentId: paymentId, transactionReference, provider: "CHAPA", status: "PENDING" },
      data: { status: "PAID", paidAt: new Date() },
    });
    if (claimed.count === 0) {
      const latestPayment = await tx.subscriptionPayment.findUnique({
        where: { subscriptionPaymentId: paymentId },
        select: { status: true },
      });
      if (latestPayment?.status === "PAID") {
        return { activated: false as const, endDate: null };
      }
      throw new Error("Subscription payment could not be claimed safely.");
    }
    const subscription = await tx.subscription.findUnique({ where: { subscriptionId: payment.subscriptionId }, select: { subscriptionId: true, storeId: true } });
    if (!subscription || subscription.storeId !== payment.storeId) throw new Error("Subscription payment and store do not match.");
    const startDate = new Date();
    const endDate = addCalendarMonths(startDate, plan.months);
    await tx.subscription.update({ where: { subscriptionId: subscription.subscriptionId }, data: { planType: payment.planType, status: "ACTIVE", isActive: true, startDate, endDate } });
    return { activated: true as const, endDate };
  });
}
