import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { CheckoutError, createOrRecoverCheckout } from "../../../lib/checkout";
import { getActiveRequestUser } from "../../../lib/request-auth";

// The checkout mutation is implemented below through the shared,
// transactional checkout service in lib/checkout.ts.
export async function POST(request: NextRequest) {
  try {
    const user = await getActiveRequestUser(request);

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "You must be logged in as a customer to place an order." },
        { status: 401 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: user.userId },
      select: { customerId: true },
    });
    if (!customer) {
      return NextResponse.json({ message: "Customer profile not found." }, { status: 404 });
    }

    const result = await createOrRecoverCheckout(
      customer.customerId,
      await request.json(),
      request.headers.get("idempotency-key")?.trim() ?? ""
    );

    return NextResponse.json(
      {
        message: result.created
          ? "Orders created. Complete payment for each store order separately."
          : "Existing checkout recovered. No duplicate orders were created.",
        checkout: result.checkout,
      },
      { status: result.created ? 201 : 200 }
    );
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("Checkout creation error:", error);
    return NextResponse.json({ message: "Unable to create checkout." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getActiveRequestUser(request);

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

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

    const orders = await prisma.order.findMany({
      where: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Get customer orders error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while loading your orders.",
      },
      { status: 500 }
    );
  }
}
