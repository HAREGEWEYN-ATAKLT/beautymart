import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getActiveRequestUser } from "../../../../../../lib/request-auth";
import { CancellationError, reviewCancellation } from "../../../../../../lib/cancellation";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const user = await getActiveRequestUser(request);
  if (!user) return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
  if (user.role !== "STORE_OWNER") return NextResponse.json({ message: "Only store owners can review cancellation requests." }, { status: 403 });
  const { orderId } = await params;
  const body = await request.json().catch(() => null);
  const decision = body?.decision === "APPROVED" || body?.decision === "REJECTED" ? body.decision : null;
  if (!decision) return NextResponse.json({ message: "Decision must be APPROVED or REJECTED." }, { status: 400 });
  try {
    const result = await reviewCancellation(orderId, user.userId, decision);
    const order = await prisma.order.findUnique({ where: { orderId }, select: { orderNumber: true, store: { select: { storeName: true } }, customer: { select: { userId: true } } } });
    if (order) await prisma.notification.createMany({
      data: [{
        userId: order.customer.userId,
        title: result.status === "APPROVED" ? "Cancellation approved" : "Cancellation request rejected",
        message: result.status === "APPROVED" ? `Your cancellation for order ${order.orderNumber} at ${order.store.storeName} was approved.` : `Your cancellation request for order ${order.orderNumber} at ${order.store.storeName} was rejected.`,
        notificationType: "ORDER",
        deduplicationKey: `customer-cancellation-review:${result.cancellationRequestId}:${result.status}`,
      }], skipDuplicates: true,
    }).catch(() => undefined);
    return NextResponse.json({ message: result.status === "APPROVED" ? "Cancellation approved and inventory restored." : "Cancellation request rejected.", cancellationRequest: result });
  } catch (error) {
    if (error instanceof CancellationError) return NextResponse.json({ message: error.message }, { status: error.status });
    throw error;
  }
}
