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

    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        customerId: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        createdAt: true,

        user: {
          select: {
            userId: true,
            isActive: true,
            createdAt: true,
          },
        },

        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },

        orders: {
          select: {
            finalAmount: true,
            paymentStatus: true,
          },
        },
      },
    });

    const formattedCustomers = customers.map((customer) => {
      const totalSpent = customer.orders
        .filter((order) => order.paymentStatus === "PAID")
        .reduce(
          (total, order) => total + Number(order.finalAmount),
          0
        );

      return {
        customerId: customer.customerId,
        userId: customer.user.userId,
        fullName: customer.fullName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,

        isActive: customer.user.isActive,

        createdAt: customer.createdAt,

        statistics: {
          totalOrders: customer._count.orders,
          totalAddresses: customer._count.addresses,
          totalSpent,
        },
      };
    });

    const totalCustomers = formattedCustomers.length;

    const activeCustomers = formattedCustomers.filter(
      (customer) => customer.isActive
    ).length;

    const inactiveCustomers =
      totalCustomers - activeCustomers;

    const totalOrders = formattedCustomers.reduce(
      (total, customer) =>
        total + customer.statistics.totalOrders,
      0
    );

    const totalRevenue = formattedCustomers.reduce(
      (total, customer) =>
        total + customer.statistics.totalSpent,
      0
    );

    return NextResponse.json({
      statistics: {
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
        totalOrders,
        totalRevenue,
      },
      customers: formattedCustomers,
    });
  } catch (error) {
    console.error("Admin customers error:", error);

    return NextResponse.json(
      { error: "Failed to load customers" },
      { status: 500 }
    );
  }
}