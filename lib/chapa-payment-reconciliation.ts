import { prisma } from "./prisma";
import { PrismaClient } from "../app/generated/prisma/client";
import { completeCheckoutAttemptIfPaid } from "./checkout";
import { isRejectedLegacyChapaReference } from "./payment-recovery";
import { isFinalUnsuccessfulChapaStatus } from "./chapa-status";

const CHAPA_VERIFY_URL = "https://api.chapa.co/v1/transaction/verify/";

export type ReconciliationDecision = "PAID" | "FAILED" | "RELEASE_LEGACY_REFERENCE" | "PENDING" | "UNKNOWN";

export function classifyChapaVerification(
  httpStatus: number,
  body: unknown,
  transactionReference: string,
  expectedAmount: number
): ReconciliationDecision {
  if (isRejectedLegacyChapaReference(transactionReference, httpStatus)) return "RELEASE_LEGACY_REFERENCE";
  if (httpStatus !== 200 || !body || typeof body !== "object") return "UNKNOWN";
  const response = body as { status?: unknown; data?: Record<string, unknown> };
  const transaction = response.data;
  if (response.status !== "success" || !transaction) return "UNKNOWN";
  if (
    transaction.tx_ref !== transactionReference ||
    String(transaction.currency ?? "").toUpperCase() !== "ETB" ||
    !Number.isFinite(Number(transaction.amount)) ||
    Math.abs(Number(transaction.amount) - expectedAmount) > 0.001
  ) return "UNKNOWN";

  const providerStatus = String(transaction.status ?? "").toLowerCase();
  if (providerStatus === "success") return "PAID";
  if (isFinalUnsuccessfulChapaStatus(providerStatus)) return "FAILED";
  return "PENDING";
}

type FetchLike = typeof fetch;

export async function reconcilePendingChapaPayments({
  db = prisma,
  fetchFn = fetch,
  chapaSecret,
  limit = 25,
}: {
  db?: PrismaClient;
  fetchFn?: FetchLike;
  chapaSecret: string;
  limit?: number;
}) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const [payments, admins] = await Promise.all([
    db.payment.findMany({
      where: { provider: "CHAPA", status: "PENDING", transactionReference: { not: null } },
      orderBy: { createdAt: "asc" },
      take: safeLimit,
      include: {
        order: { select: { orderId: true, orderNumber: true, checkoutAttemptId: true, customer: { select: { userId: true } } } },
        store: { select: { ownerId: true, storeName: true } },
      },
    }),
    db.user.findMany({ where: { role: "SUPER_ADMIN", isActive: true }, select: { userId: true } }),
  ]);

  const result = { checked: payments.length, paid: 0, failedAttemptsReleased: 0, stillPending: 0, unknown: 0 };

  for (const payment of payments) {
    const reference = payment.transactionReference;
    if (!reference) continue;
    let response: Response;
    let body: unknown = null;
    try {
      response = await fetchFn(`${CHAPA_VERIFY_URL}${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${chapaSecret}` },
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      });
      body = await response.json().catch(() => null);
    } catch {
      result.unknown += 1;
      continue;
    }

    const decision = classifyChapaVerification(response.status, body, reference, Number(payment.amount));
    if (decision === "PENDING") { result.stillPending += 1; continue; }
    if (decision === "UNKNOWN") { result.unknown += 1; continue; }

    if (decision === "PAID") {
      const claimed = await db.$transaction(async (tx) => {
        const updated = await tx.payment.updateMany({
          where: { paymentId: payment.paymentId, provider: "CHAPA", status: "PENDING", transactionReference: reference },
          data: { status: "PAID", paidAt: new Date() },
        });
        if (updated.count !== 1) return false;
        await tx.order.updateMany({ where: { orderId: payment.orderId, paymentStatus: { not: "PAID" } }, data: { paymentStatus: "PAID" } });
        return true;
      });
      if (!claimed) { result.unknown += 1; continue; }
      if (payment.order.checkoutAttemptId) await completeCheckoutAttemptIfPaid(payment.order.checkoutAttemptId, db);
      await db.notification.createMany({
        data: [
          { userId: payment.order.customer.userId, title: "Payment verified", message: `Your payment for order ${payment.order.orderNumber} at ${payment.store.storeName} has been verified successfully.`, notificationType: "PAYMENT", deduplicationKey: `customer-order-payment:${payment.paymentId}:${payment.order.orderId}:${payment.order.customer.userId}` },
          { userId: payment.store.ownerId, title: "Payment received", message: `Payment for order ${payment.order.orderNumber} at ${payment.store.storeName} has been confirmed.`, notificationType: "PAYMENT", deduplicationKey: `store-order-payment:${payment.paymentId}:${payment.store.ownerId}` },
          ...admins.map((admin) => ({ userId: admin.userId, title: "Marketplace payment received", message: `Payment for order ${payment.order.orderNumber} at ${payment.store.storeName} has been verified successfully.`, notificationType: "PAYMENT" as const, deduplicationKey: `admin-order-payment:${payment.paymentId}:${admin.userId}` })),
        ],
        skipDuplicates: true,
      }).catch(() => undefined);
      result.paid += 1;
      continue;
    }

    const released = await db.payment.updateMany({
      where: { paymentId: payment.paymentId, provider: "CHAPA", status: "PENDING", transactionReference: reference },
      data: { transactionReference: null },
    });
    if (released.count !== 1) { result.unknown += 1; continue; }
    await db.notification.createMany({
      data: [{ userId: payment.order.customer.userId, title: "Payment attempt was unsuccessful", message: `Chapa confirmed that the payment attempt for order ${payment.order.orderNumber} did not succeed. No payment was verified; you can try payment again from your order.`, notificationType: "PAYMENT", deduplicationKey: `customer-payment-attempt-failed:${payment.paymentId}:${reference}` }],
      skipDuplicates: true,
    }).catch(() => undefined);
    result.failedAttemptsReleased += 1;
  }

  return result;
}
