import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getActiveRequestUser } from "../../../../../lib/request-auth";

const allowedStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;

type StoreStatus = (typeof allowedStatuses)[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const user = await getActiveRequestUser(request);

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { storeId } = await params;

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const status = body.status as StoreStatus;

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Use ACTIVE, INACTIVE, or SUSPENDED.",
        },
        { status: 400 }
      );
    }

const existingStore = await prisma.store.findUnique({
  where: {
    storeId,
  },
  select: {
    storeId: true,
    storeName: true,
    status: true,
    ownerId: true,
  },
});

    if (!existingStore) {
    
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    const updatedStore = await prisma.store.update({
      where: {
        storeId,
      },
      data: {
        status,
      },
      select: {
        storeId: true,
        storeName: true,
        status: true,
        updatedAt: true,
      },
    });
if (existingStore.status !== updatedStore.status) {
  const statusMessages = {
    ACTIVE: {
      title: "Store access restored",
      message: `Your store ${updatedStore.storeName} has been reactivated by the BeautyMart administrator.`,
    },
    INACTIVE: {
      title: "Store deactivated",
      message: `Your store ${updatedStore.storeName} has been deactivated by the BeautyMart administrator.`,
    },
    SUSPENDED: {
      title: "Store suspended",
      message: `Your store ${updatedStore.storeName} has been suspended by the BeautyMart administrator. Contact BeautyMart support for assistance.`,
    },
  } as const;

  try {
    const notification = statusMessages[updatedStore.status];

    await prisma.notification.create({
      data: {
        userId: existingStore.ownerId,
        title: notification.title,
        message: notification.message,
        notificationType: "SYSTEM",
      },
    });
  } catch (notificationError) {
    console.error(
      "Store status was updated, but owner notification failed:",
      notificationError
    );
  }
}
    return NextResponse.json({
      message: "Store status updated successfully",
      store: updatedStore,
    });
  } catch (error) {
    console.error("Admin store status update error:", error);

    return NextResponse.json(
      { error: "Failed to update store status" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const user = await getActiveRequestUser(request);

    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { storeId } = await params;

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: {
        storeId,
      },
      include: {
        owner: {
          select: {
            userId: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            isActive: true,
            createdAt: true,
          },
        },

        subscription: true,

        products: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            productId: true,
            productName: true,
            price: true,
            isActive: true,
            createdAt: true,

            category: {
              select: {
                categoryName: true,
              },
            },

            inventory: {
              select: {
                quantity: true,
                minimumStock: true,
              },
            },
          },
        },

        orders: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
          select: {
            orderId: true,
            orderNumber: true,
            totalAmount: true,
            discountAmount: true,
            finalAmount: true,
            paymentStatus: true,
            orderStatus: true,
            createdAt: true,

            customer: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },

        _count: {
          select: {
            products: true,
            orders: true,
            categories: true,
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    const paidOrders = await prisma.order.findMany({
      where: {
        storeId,
        paymentStatus: "PAID",
      },
      select: {
        finalAmount: true,
      },
    });

    const totalRevenue = paidOrders.reduce(
      (total, order) => total + Number(order.finalAmount),
      0
    );

    return NextResponse.json({
      store: {
        storeId: store.storeId,
        storeName: store.storeName,
        description: store.description,
        logoUrl: store.logoUrl,
        bannerUrl: store.bannerUrl,
        email: store.email,
        phone: store.phone,
        address: store.address,
        status: store.status,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,

        owner: store.owner,

        subscription: store.subscription,

        statistics: {
          products: store._count.products,
          orders: store._count.orders,
          categories: store._count.categories,
          totalRevenue,
        },

        products: store.products.map((product) => ({
          ...product,
          price: Number(product.price),
        })),

        orders: store.orders.map((order) => ({
          ...order,
          totalAmount: Number(order.totalAmount),
          discountAmount: Number(order.discountAmount),
          finalAmount: Number(order.finalAmount),
        })),
      },
    });
  } catch (error) {
    console.error("Admin store details error:", error);

    return NextResponse.json(
      { error: "Failed to load store details" },
      { status: 500 }
    );
  }
}
