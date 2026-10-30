import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getActiveRequestUser } from "../../../../lib/request-auth";

export async function GET(request: NextRequest) {
  try {
    // Check the logged-in user
    const user = await getActiveRequestUser(request);

    // Only Super Admin can access this API
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get platform-wide statistics
    const [
      totalStores,
      activeStores,
      totalStoreOwners,
      totalCustomers,
      totalProducts,
      totalOrders,
      paidOrders,
      pendingOrders,
    ] = await Promise.all([
      prisma.store.count(),

      prisma.store.count({ where: { status: "ACTIVE" } }),

      prisma.user.count({
        where: {
          role: "STORE_OWNER",
        },
      }),

      prisma.customer.count(),

      prisma.product.count(),

      prisma.order.count(),

      prisma.order.count({
        where: {
          paymentStatus: "PAID",
        },
      }),

      prisma.order.count({
        where: {
          orderStatus: "PENDING",
        },
      }),
    ]);

    // Calculate total revenue from paid orders
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        finalAmount: true,
      },
      where: {
        paymentStatus: "PAID",
      },
    });

    const totalRevenue = revenueResult._sum.finalAmount ?? 0;

    return NextResponse.json({
      totalStores,
      activeStores,
      totalStoreOwners,
      totalCustomers,
      totalProducts,
      totalOrders,
      paidOrders,
      pendingOrders,
      totalRevenue: Number(totalRevenue),
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return NextResponse.json(
      { error: "Failed to load dashboard statistics" },
      { status: 500 }
    );
  }
}
