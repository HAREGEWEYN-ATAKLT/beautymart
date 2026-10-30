import { NextRequest, NextResponse } from "next/server";
import { getActiveRequestUser } from "../../../../../lib/request-auth";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Check admin session
    const user = await getActiveRequestUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get order ID from URL
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: {
        orderId,
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

        store: {
          select: {
            storeId: true,
            storeName: true,
            description: true,
            email: true,
            phone: true,
            address: true,
            status: true,
          },
        },

        items: {
          orderBy: {
            orderItemId: "asc",
          },
          select: {
            orderItemId: true,
            quantity: true,
            unitPrice: true,
            discountAmount: true,
            totalPrice: true,

            product: {
              select: {
                productId: true,
                productName: true,
                description: true,
                price: true,
                isActive: true,

                category: {
                  select: {
                    categoryId: true,
                    categoryName: true,
                  },
                },

          images: {
  select: {
    productImageId: true,
    imageUrl: true,
  },
  orderBy: {
    productImageId: "asc",
  },
},
              },
            },
          },
        },

        payments: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            paymentId: true,
            provider: true,
            transactionReference: true,
            amount: true,
            status: true,
            paidAt: true,
            createdAt: true,
          },
        },
      },
    });

    // Order not found
    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Convert Prisma Decimal values to numbers
    const totalAmount = Number(order.totalAmount);
    const discountAmount = Number(order.discountAmount);
    const finalAmount = Number(order.finalAmount);

    const items = order.items.map((item) => ({
      orderItemId: item.orderItemId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      discountAmount: Number(item.discountAmount),
      totalPrice: Number(item.totalPrice),

      product: {
        productId: item.product.productId,
        productName: item.product.productName,
        description: item.product.description,
        price: Number(item.product.price),
        isActive: item.product.isActive,

        category: item.product.category
          ? {
              categoryId: item.product.category.categoryId,
              categoryName: item.product.category.categoryName,
            }
          : null,

     images: item.product.images.map((image) => ({
  imageId: image.productImageId,
  imageUrl: image.imageUrl,
})),
      },
    }));

    const payments = order.payments.map((payment) => ({
      paymentId: payment.paymentId,
      provider: payment.provider,
      transactionReference: payment.transactionReference,
      amount: Number(payment.amount),
      status: payment.status,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
    }));

    // Check for potentially inconsistent order/payment states.
    const hasPaymentStatusMismatch =
      order.orderStatus === "DELIVERED" &&
      order.paymentStatus !== "PAID";

    return NextResponse.json({
      order: {
        orderId: order.orderId,
        orderNumber: order.orderNumber,

        customer: {
          customerId: order.customer.customerId,
          fullName: order.customer.fullName,
          email: order.customer.email,
          phoneNumber: order.customer.phoneNumber,
        },

        store: {
          storeId: order.store.storeId,
          storeName: order.store.storeName,
          description: order.store.description,
          email: order.store.email,
          phone: order.store.phone,
          address: order.store.address,
          status: order.store.status,
        },

        totalAmount,
        discountAmount,
        finalAmount,

        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,

        createdAt: order.createdAt,
        
        itemCount: items.length,

        items,

        payments,

        hasPaymentStatusMismatch,
      },
    });
  } catch (error) {
    console.error("Admin order details error:", error);

    return NextResponse.json(
      { message: "Failed to load order details" },
      { status: 500 }
    );
  }
}
