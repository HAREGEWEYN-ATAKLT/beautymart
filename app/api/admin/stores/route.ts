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

    const stores = await prisma.store.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        storeId: true,
        storeName: true,
        description: true,
        email: true,
        phone: true,
        address: true,
        status: true,
        createdAt: true,

        owner: {
          select: {
            userId: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },

        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    return NextResponse.json({
      stores: stores.map((store) => ({
        storeId: store.storeId,
        storeName: store.storeName,
        description: store.description,
        email: store.email,
        phone: store.phone,
        address: store.address,
        status: store.status,
        createdAt: store.createdAt,

        owner: {
          userId: store.owner.userId,
          fullName: store.owner.fullName,
          email: store.owner.email,
          phoneNumber: store.owner.phoneNumber,
        },

        productCount: store._count.products,
        orderCount: store._count.orders,
      })),
    });
  } catch (error) {
    console.error("Admin stores error:", error);

    return NextResponse.json(
      { error: "Failed to load stores" },
      { status: 500 }
    );
  }
}
