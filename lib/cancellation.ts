import { PrismaClient } from "../app/generated/prisma/client";
import { prisma } from "./prisma";
import { getStoreManagementBlockReason } from "./store-management-access";

export class CancellationError extends Error { constructor(message: string, readonly status = 409) { super(message); } }

export async function reviewCancellation(orderId: string, ownerId: string, decision: "APPROVED" | "REJECTED", db: PrismaClient = prisma) {
  return db.$transaction(async (tx) => {
    const request = await tx.cancellationRequest.findFirst({
      where: { orderId, status: "REQUESTED", order: { store: { ownerId } } },
      include: {
        order: {
          include: {
            items: true,
            store: { include: { subscription: true } },
          },
        },
      },
    });
    if (!request) throw new CancellationError("Cancellation request not found.", 404);
    const managementBlock = getStoreManagementBlockReason(request.order.store);
    if (managementBlock) throw new CancellationError(managementBlock, 403);
    const claimed = await tx.cancellationRequest.updateMany({ where: { cancellationRequestId: request.cancellationRequestId, status: "REQUESTED" }, data: { status: decision, reviewedAt: new Date(), reviewedByUserId: ownerId } });
    if (claimed.count !== 1) throw new CancellationError("This cancellation request has already been reviewed.");
    if (decision === "REJECTED") return tx.cancellationRequest.findUniqueOrThrow({ where: { cancellationRequestId: request.cancellationRequestId } });
    if (request.order.paymentStatus !== "FAILED" || request.order.orderStatus !== "PENDING") throw new CancellationError("Only an order with a confirmed FAILED payment can be cancelled and have stock restored.");
    for (const item of request.order.items) {
      const updated = await tx.inventory.updateMany({ where: { productId: item.productId }, data: { quantity: { increment: item.quantity } } });
      if (updated.count !== 1) throw new CancellationError("Inventory record is missing.", 500);
    }
    await tx.order.update({ where: { orderId }, data: { orderStatus: "CANCELLED" } });
    return tx.cancellationRequest.update({ where: { cancellationRequestId: request.cancellationRequestId }, data: { inventoryRestoredAt: new Date() } });
  });
}
