import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getActiveRequestUser } from "../../../../lib/request-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getActiveRequestUser(request);

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    const { orderId } = await params;

    const customer = await prisma.customer.findUnique({
      where: {
        userId: user.userId,
      },
      select: {
        customerId: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer profile not found." },
        { status: 404 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        orderId,
        customerId: customer.customerId,
      },
      include: {
        store: {
          select: {
            storeId: true,
            storeName: true,
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
    console.error("Get customer order detail error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while loading the order.",
      },
      { status: 500 }
    );
  }
}
