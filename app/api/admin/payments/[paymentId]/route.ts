
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../auth";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { paymentId } = await params;

    const payment = await prisma.payment.findUnique({
      where: { paymentId },
      include: {
        order: {
          select: {
            orderId: true,
            orderNumber: true,
            orderStatus: true,
            paymentStatus: true,
            totalAmount: true,
            discountAmount: true,
            finalAmount: true,
            createdAt: true,
            customer: {
              select: {
                customerId: true,
                fullName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
        store: {
          select: {
            storeId: true,
            storeName: true,
            owner: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        storeId: payment.storeId,
        provider: payment.provider,
        transactionReference: payment.transactionReference,
        amount: Number(payment.amount),
        status: payment.status,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
        order: {
          ...payment.order,
          totalAmount: Number(payment.order.totalAmount),
          discountAmount: Number(payment.order.discountAmount),
          finalAmount: Number(payment.order.finalAmount),
        },
        store: payment.store,
      },
    });
  } catch (error) {
    console.error("Admin payment detail error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch payment details" },
      { status: 500 }
    );
  }
}