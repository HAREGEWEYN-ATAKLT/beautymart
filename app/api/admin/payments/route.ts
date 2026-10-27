
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

const paymentStatuses = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

const paymentProviders = [
  "TELEBIRR",
  "CHAPA",
  "SANTIMPAY",
  "BANK",
] as const;

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() ?? "";
    const status = searchParams.get("status") ?? "";
    const provider = searchParams.get("provider") ?? "";

    if (
      status &&
      !paymentStatuses.includes(
        status as (typeof paymentStatuses)[number]
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid payment status." },
        { status: 400 }
      );
    }

    if (
      provider &&
      !paymentProviders.includes(
        provider as (typeof paymentProviders)[number]
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid payment provider." },
        { status: 400 }
      );
    }

    const where = {
      ...(status ? { status: status as (typeof paymentStatuses)[number] } : {}),
      ...(provider
        ? { provider: provider as (typeof paymentProviders)[number] }
        : {}),
      ...(search
        ? {
            OR: [
              {
                transactionReference: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                order: {
                  is: {
                    orderNumber: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
              {
                order: {
                  is: {
                    customer: {
                      is: {
                        fullName: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                    },
                  },
                },
              },
              {
                order: {
                  is: {
                    customer: {
                      is: {
                        email: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                    },
                  },
                },
              },
              {
                store: {
                  is: {
                    storeName: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [
      payments,
      totalPayments,
      paidPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      paidAmount,
    ] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
            select: {
              orderId: true,
              orderNumber: true,
              orderStatus: true,
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
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.payment.count(),
      prisma.payment.count({ where: { status: "PAID" } }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.count({ where: { status: "FAILED" } }),
      prisma.payment.count({ where: { status: "REFUNDED" } }),
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
    ]);

    const formattedPayments = payments.map((payment) => ({
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      orderNumber: payment.order.orderNumber,
      orderStatus: payment.order.orderStatus,
      customer: payment.order.customer,
      store: payment.store,
      provider: payment.provider,
      transactionReference: payment.transactionReference,
      amount: Number(payment.amount),
      status: payment.status,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
    }));

    return NextResponse.json({
      success: true,
      statistics: {
        totalPayments,
        paidPayments,
        pendingPayments,
        failedPayments,
        refundedPayments,
        totalPaidAmount: Number(paidAmount._sum.amount ?? 0),
      },
      payments: formattedPayments,
    });
  } catch (error) {
    console.error("Admin payments API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load payment records.",
      },
      { status: 500 }
    );
  }
}