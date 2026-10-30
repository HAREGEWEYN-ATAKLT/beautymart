import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getActiveRequestUser } from "../../../../lib/request-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getActiveRequestUser(request);

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [recentOrders, recentStores] = await Promise.all([
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          orderId: true,
          orderNumber: true,
          finalAmount: true,
          paymentStatus: true,
          orderStatus: true,
          createdAt: true,
          store: {
            select: {
              storeName: true,
            },
          },
          customer: {
            select: {
              fullName: true,
            },
          },
        },
      }),

      prisma.store.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          storeId: true,
          storeName: true,
          address: true,
          status: true,
          createdAt: true,
          owner: {
            select: {
              fullName: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      recentOrders: recentOrders.map((order) => ({
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        finalAmount: Number(order.finalAmount),
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        storeName: order.store.storeName,
        customerName: order.customer.fullName,
      })),

      recentStores: recentStores.map((store) => ({
        storeId: store.storeId,
        storeName: store.storeName,
        address: store.address,
        status: store.status,
        createdAt: store.createdAt,
        ownerName: store.owner.fullName,
      })),
    });
  } catch (error) {
    console.error("Admin recent activity error:", error);

    return NextResponse.json(
      { error: "Failed to load recent activity" },
      { status: 500 }
    );
  }
}
