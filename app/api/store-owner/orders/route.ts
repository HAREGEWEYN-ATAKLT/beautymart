import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getActiveRequestUser } from "../../../../lib/request-auth";

export async function GET(request: NextRequest) {
  try {
    // 1. Check logged-in user
    const user = await getActiveRequestUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    // 2. Only Store Owners can access this API
    if (user.role !== "STORE_OWNER") {
      return NextResponse.json(
        { message: "Only Store Owners can access orders." },
        { status: 403 }
      );
    }

    // 3. Find stores owned by the logged-in user
    const stores = await prisma.store.findMany({
      where: {
        ownerId: user.userId,
      },
      select: {
        storeId: true,
      },
    });

    const storeIds = stores.map((store) => store.storeId);

    // 4. Get orders belonging only to those stores
    const orders = await prisma.order.findMany({
      where: {
        storeId: {
          in: storeIds,
        },
      },
      include: {
      customer: {
  select: {
    customerId: true,
    fullName: true,
    email: true,
    phoneNumber: true,
  },
},
        address: true,
        items: {
          include: {
            product: {
              select: {
                productId: true,
                productName: true,
              },
            },
          },
        },
        payments: {
          select: {
            paymentId: true,
            provider: true,
            amount: true,
            status: true,
            transactionReference: true,
            paidAt: true,
          },
        },
        store: {
          select: {
            storeId: true,
            storeName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Store owner orders error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while loading orders.",
      },
      { status: 500 }
    );
  }
}
