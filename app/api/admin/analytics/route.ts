
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    const period = request.nextUrl.searchParams.get("period") || "30d";

    const days =
      period === "7d" ? 7 :
      period === "90d" ? 90 :
      period === "12m" ? 365 : 30;

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const [
      totalStores,
      activeStores,
      totalOwners,
      totalCustomers,
      totalProducts,
      totalOrders,
      paidOrders,
      pendingOrders,
      cancelledOrders,
      orderRevenue,
      periodOrders,
      periodPaidOrders,
      periodRevenue,
      paidSubscriptionRevenue,
      subscriptionCounts,
      recentOrders,
      topStores,
      topProducts,
    ] = await Promise.all([
      prisma.store.count(),
      prisma.store.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "STORE_OWNER" } }),
      prisma.customer.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: "PAID" } }),
      prisma.order.count({ where: { orderStatus: "PENDING" } }),
      prisma.order.count({ where: { orderStatus: "CANCELLED" } }),

      prisma.order.aggregate({
        _sum: { finalAmount: true },
        where: { paymentStatus: "PAID" },
      }),

      prisma.order.count({
        where: { createdAt: { gte: startDate } },
      }),

      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
          paymentStatus: "PAID",
        },
      }),

      prisma.order.aggregate({
        _sum: { finalAmount: true },
        where: {
          createdAt: { gte: startDate },
          paymentStatus: "PAID",
        },
      }),

      prisma.subscriptionPayment.aggregate({
        _sum: { amount: true },
        where: { status: "PAID" },
      }),

      prisma.subscription.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),

      prisma.order.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          orderId: true,
          orderNumber: true,
          finalAmount: true,
          paymentStatus: true,
          orderStatus: true,
          createdAt: true,
          store: { select: { storeName: true } },
          customer: { select: { fullName: true } },
        },
      }),

      prisma.order.groupBy({
        by: ["storeId"],
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: startDate },
        },
        _sum: { finalAmount: true },
        _count: { _all: true },
        orderBy: { _sum: { finalAmount: "desc" } },
        take: 5,
      }),

      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            paymentStatus: "PAID",
            createdAt: { gte: startDate },
          },
        },
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

    const storeIds = topStores.map((item) => item.storeId);
    const productIds = topProducts.map((item) => item.productId);

    const [storeDetails, productDetails, dailyOrders] = await Promise.all([
      prisma.store.findMany({
        where: { storeId: { in: storeIds } },
        select: { storeId: true, storeName: true },
      }),
      prisma.product.findMany({
        where: { productId: { in: productIds } },
        select: {
          productId: true,
          productName: true,
          store: { select: { storeName: true } },
        },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
          finalAmount: true,
          paymentStatus: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const storeNameById = new Map(
      storeDetails.map((store) => [store.storeId, store.storeName])
    );

    const productById = new Map(
      productDetails.map((product) => [product.productId, product])
    );

    const chartMap = new Map<
      string,
      { date: string; orders: number; revenue: number }
    >();

    // Build a complete daily series, including days with no orders.
    for (let offset = days - 1; offset >= 0; offset--) {
      const date = new Date(now);
      date.setDate(date.getDate() - offset);
      const key = date.toISOString().slice(0, 10);

      chartMap.set(key, { date: key, orders: 0, revenue: 0 });
    }

    for (const order of dailyOrders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      const point = chartMap.get(key);

      if (point) {
        point.orders += 1;

        if (order.paymentStatus === "PAID") {
          point.revenue += Number(order.finalAmount);
        }
      }
    }

    return NextResponse.json({
      generatedAt: now.toISOString(),
      period: { key: period, days, startDate: startDate.toISOString() },
      overview: {
        totalStores,
        activeStores,
        totalOwners,
        totalCustomers,
        totalProducts,
        totalOrders,
        paidOrders,
        pendingOrders,
        cancelledOrders,
        totalRevenue: Number(orderRevenue._sum.finalAmount ?? 0),
        periodOrders,
        periodPaidOrders,
        periodRevenue: Number(periodRevenue._sum.finalAmount ?? 0),
        paidSubscriptionRevenue: Number(
          paidSubscriptionRevenue._sum.amount ?? 0
        ),
      },
      subscriptions: subscriptionCounts.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),
      salesTrend: Array.from(chartMap.values()),
      recentOrders: recentOrders.map((order) => ({
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        amount: Number(order.finalAmount),
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        storeName: order.store.storeName,
        customerName: order.customer.fullName,
      })),
      topStores: topStores.map((item) => ({
        storeId: item.storeId,
        storeName: storeNameById.get(item.storeId) ?? "Unknown store",
        revenue: Number(item._sum.finalAmount ?? 0),
        orders: item._count._all,
      })),
      topProducts: topProducts.map((item) => {
        const product = productById.get(item.productId);

        return {
          productId: item.productId,
          productName: product?.productName ?? "Unknown product",
          storeName: product?.store.storeName ?? "Unknown store",
          unitsSold: item._sum.quantity ?? 0,
          salesValue: Number(item._sum.totalPrice ?? 0),
        };
      }),
    });
  } catch (error) {
    console.error("Admin analytics error:", error);

    return NextResponse.json(
      { error: "Failed to load analytics data" },
      { status: 500 }
    );
  }
}