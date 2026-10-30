import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getActiveRequestUser } from "../../../../../lib/request-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const user = await getActiveRequestUser(request);
  if (!user || user.role !== "CUSTOMER") return NextResponse.json({ message: "You must be logged in as a customer." }, { status: 401 });
  const { orderId } = await params;
  const customer = await prisma.customer.findUnique({ where: { userId: user.userId }, select: { customerId: true } });
  if (!customer) return NextResponse.json({ message: "Customer profile not found." }, { status: 404 });
  const order = await prisma.order.findFirst({
    where: { orderId, customerId: customer.customerId },
    select: { orderId: true, orderNumber: true, orderStatus: true, paymentStatus: true, store: { select: { ownerId: true, storeName: true } } },
  });
  if (!order) return NextResponse.json({ message: "Order not found." }, { status: 404 });
  if (order.orderStatus !== "PENDING") return NextResponse.json({ message: "This order can no longer be cancelled through this feature." }, { status: 409 });
  let reason: string | undefined;
  try {
    const body = await request.json();
    if (typeof body?.reason === "string") reason = body.reason.trim().slice(0, 1000) || undefined;
  } catch { /* Reason is optional. */ }
  try {
    const requestRecord = await prisma.cancellationRequest.create({
      data: { orderId: order.orderId, customerId: customer.customerId, reason },
      select: { cancellationRequestId: true, status: true, requestedAt: true },
    });
    const admins = await prisma.user.findMany({ where: { role: "SUPER_ADMIN", isActive: true }, select: { userId: true } });
    await prisma.notification.createMany({
      data: [
        { userId: order.store.ownerId, title: "Cancellation request", message: `Customer requested cancellation for order ${order.orderNumber} at ${order.store.storeName}.`, notificationType: "ORDER", deduplicationKey: `store-cancellation-request:${order.orderId}:${order.store.ownerId}` },
        ...admins.map((admin) => ({ userId: admin.userId, title: "Customer cancellation request", message: `Cancellation was requested for order ${order.orderNumber} at ${order.store.storeName}.`, notificationType: "ORDER" as const, deduplicationKey: `admin-cancellation-request:${requestRecord.cancellationRequestId}:${admin.userId}` })),
      ], skipDuplicates: true,
    }).catch(() => undefined);
    return NextResponse.json({ message: order.paymentStatus === "PAID" ? "Cancellation review request received. No refund has been issued." : "Cancellation request received. Payment and inventory remain unchanged until it is safely reviewed.", cancellationRequest: requestRecord }, { status: 201 });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      const existing = await prisma.cancellationRequest.findFirst({ where: { orderId: order.orderId, customerId: customer.customerId }, select: { cancellationRequestId: true, status: true, requestedAt: true } });
      return NextResponse.json({ message: "A cancellation request already exists for this order.", cancellationRequest: existing }, { status: 200 });
    }
    console.error("Cancellation request failed.");
    return NextResponse.json({ message: "Unable to create the cancellation request." }, { status: 500 });
  }
}
