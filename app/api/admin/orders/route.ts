// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../../../auth";
// import { prisma } from "../../../../lib/prisma";

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);

//     // Only Super Admin can view all marketplace orders
//     if (!session?.user || session.user.role !== "SUPER_ADMIN") {
//       return NextResponse.json(
//         { message: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const orders = await prisma.order.findMany({
//       orderBy: {
//         createdAt: "desc",
//       },
//       include: {
//         store: {
//           select: {
//             storeId: true,
//             storeName: true,
//             status: true,
//           },
//         },

//         items: {
//           select: {
//             orderItemId: true,
//             quantity: true,
//             unitPrice: true,
//             discountAmount: true,
//             totalPrice: true,
//             product: {
//               select: {
//                 productId: true,
//                 productName: true,
//               },
//             },
//           },
//         },

//         payments: {
//           select: {
//             paymentId: true,
//             provider: true,
//             transactionReference: true,
//             amount: true,
//             status: true,
//             paidAt: true,
//             createdAt: true,
//           },
//           orderBy: {
//             createdAt: "desc",
//           },
//         },
//       },
//     });

//     const totalOrders = orders.length;

//     const pendingOrders = orders.filter(
//       (order) => order.orderStatus === "PENDING"
//     ).length;

//     const confirmedOrders = orders.filter(
//       (order) => order.orderStatus === "CONFIRMED"
//     ).length;

//     const processingOrders = orders.filter(
//       (order) => order.orderStatus === "PROCESSING"
//     ).length;

//     const shippedOrders = orders.filter(
//       (order) => order.orderStatus === "SHIPPED"
//     ).length;

//     const deliveredOrders = orders.filter(
//       (order) => order.orderStatus === "DELIVERED"
//     ).length;

//     const cancelledOrders = orders.filter(
//       (order) => order.orderStatus === "CANCELLED"
//     ).length;

//     const paidOrders = orders.filter(
//       (order) => order.paymentStatus === "PAID"
//     ).length;

//     const pendingPayments = orders.filter(
//       (order) => order.paymentStatus === "PENDING"
//     ).length;

//     const totalRevenue = orders
//       .filter((order) => order.paymentStatus === "PAID")
//       .reduce((total, order) => total + Number(order.finalAmount), 0);

//     return NextResponse.json({
//       statistics: {
//         totalOrders,
//         pendingOrders,
//         confirmedOrders,
//         processingOrders,
//         shippedOrders,
//         deliveredOrders,
//         cancelledOrders,
//         paidOrders,
//         pendingPayments,
//         totalRevenue,
//       },

//       orders: orders.map((order) => ({
//         orderId: order.orderId,
//         orderNumber: order.orderNumber,

//         customerId: order.customerId,

//         store: {
//           storeId: order.store.storeId,
//           storeName: order.store.storeName,
//           status: order.store.status,
//         },

//         totalAmount: Number(order.totalAmount),
//         discountAmount: Number(order.discountAmount),
//         finalAmount: Number(order.finalAmount),

//         paymentStatus: order.paymentStatus,
//         orderStatus: order.orderStatus,

//         createdAt: order.createdAt,

//         itemCount: order.items.reduce(
//           (total, item) => total + item.quantity,
//           0
//         ),

//         items: order.items.map((item) => ({
//           orderItemId: item.orderItemId,
//           quantity: item.quantity,
//           unitPrice: Number(item.unitPrice),
//           discountAmount: Number(item.discountAmount),
//           totalPrice: Number(item.totalPrice),

//           product: {
//             productId: item.product.productId,
//             productName: item.product.productName,
//           },
//         })),

//         payments: order.payments.map((payment) => ({
//           paymentId: payment.paymentId,
//           provider: payment.provider,
//           transactionReference: payment.transactionReference,
//           amount: Number(payment.amount),
//           status: payment.status,
//           paidAt: payment.paidAt,
//           createdAt: payment.createdAt,
//         })),
//       })),
//     });
//   } catch (error) {
//     console.error("Admin orders error:", error);

//     return NextResponse.json(
//       { message: "Failed to load orders" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getActiveRequestUser } from "../../../../lib/request-auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
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

    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        customer: {
          select: {
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },

        store: {
          select: {
            storeId: true,
            storeName: true,
            status: true,
          },
        },

        items: {
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
              },
            },
          },
        },

        payments: {
          select: {
            paymentId: true,
            provider: true,
            transactionReference: true,
            amount: true,
            status: true,
            paidAt: true,
            createdAt: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) => order.orderStatus === "PENDING"
    ).length;

    const confirmedOrders = orders.filter(
      (order) => order.orderStatus === "CONFIRMED"
    ).length;

    const processingOrders = orders.filter(
      (order) => order.orderStatus === "PROCESSING"
    ).length;

    const shippedOrders = orders.filter(
      (order) => order.orderStatus === "SHIPPED"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.orderStatus === "DELIVERED"
    ).length;

    const cancelledOrders = orders.filter(
      (order) => order.orderStatus === "CANCELLED"
    ).length;

    const paidOrders = orders.filter(
      (order) => order.paymentStatus === "PAID"
    ).length;

    const pendingPayments = orders.filter(
      (order) => order.paymentStatus === "PENDING"
    ).length;

    const totalRevenue = orders
      .filter((order) => order.paymentStatus === "PAID")
      .reduce(
        (total, order) => total + Number(order.finalAmount),
        0
      );

    return NextResponse.json({
      statistics: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        paidOrders,
        pendingPayments,
        totalRevenue,
      },

      orders: orders.map((order) => ({
        orderId: order.orderId,
        orderNumber: order.orderNumber,

        customer: {
          fullName: order.customer.fullName,
          email: order.customer.email,
          phoneNumber: order.customer.phoneNumber,
        },

        store: {
          storeId: order.store.storeId,
          storeName: order.store.storeName,
          status: order.store.status,
        },

        totalAmount: Number(order.totalAmount),
        discountAmount: Number(order.discountAmount),
        finalAmount: Number(order.finalAmount),

        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,

        createdAt: order.createdAt,

        itemCount: order.items.reduce(
          (total, item) => total + item.quantity,
          0
        ),

        items: order.items.map((item) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          discountAmount: Number(item.discountAmount),
          totalPrice: Number(item.totalPrice),

          product: {
            productId: item.product.productId,
            productName: item.product.productName,
          },
        })),

        payments: order.payments.map((payment) => ({
          paymentId: payment.paymentId,
          provider: payment.provider,
          transactionReference:
            payment.transactionReference,
          amount: Number(payment.amount),
          status: payment.status,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
        })),
      })),
    });
  } catch (error) {
    console.error("Admin orders error:", error);

    return NextResponse.json(
      { message: "Failed to load orders" },
      { status: 500 }
    );
  }
}
