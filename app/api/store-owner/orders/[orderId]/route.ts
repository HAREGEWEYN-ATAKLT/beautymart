import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getActiveRequestUser } from "../../../../../lib/request-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getActiveRequestUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    if (user.role !== "STORE_OWNER") {
      return NextResponse.json(
        { message: "Only Store Owners can access orders." },
        { status: 403 }
      );
    }

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        orderId,
        store: {
          ownerId: user.userId,
        },
      },
      include: {
        cancellationRequest: true,
        customer: {
          select: {
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
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Store owner order details error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while loading the order.",
      },
      { status: 500 }
    );
  }
}
