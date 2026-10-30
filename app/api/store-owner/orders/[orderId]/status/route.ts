// import { NextRequest, NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { prisma } from "../../../../../../lib/prisma";

// const allowedStatuses = [
//   "CONFIRMED",
//   "PROCESSING",
//   "SHIPPED",
//   "DELIVERED",
// ] as const;

// export async function PATCH(
//   request: NextRequest,
//   { params }: { params: Promise<{ orderId: string }> }
// ) {
//   try {
//     const token = await getToken({
//       req: request,
//       secret: process.env.NEXTAUTH_SECRET,
//       secureCookie: false,
//     });

//     if (!token?.id) {
//       return NextResponse.json(
//         { message: "You must be logged in." },
//         { status: 401 }
//       );
//     }

//     if (token.role !== "STORE_OWNER") {
//       return NextResponse.json(
//         { message: "Only Store Owners can update orders." },
//         { status: 403 }
//       );
//     }

//     const { orderId } = await params;

//     if (!orderId) {
//       return NextResponse.json(
//         { message: "Order ID is required." },
//         { status: 400 }
//       );
//     }

//     const body = await request.json();
//     const status = String(body.status || "").toUpperCase();

//     if (!allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
//       return NextResponse.json(
//         { message: "Invalid order status." },
//         { status: 400 }
//       );
//     }

//     const existingOrder = await prisma.order.findFirst({
//       where: {
//         orderId,
//         store: {
//           ownerId: String(token.id),
//         },
//       },
//    select: {
//   orderId: true,
//   orderNumber: true,
//   orderStatus: true,
//   customerId: true,
//   store: {
//     select: {
//       storeName: true,
//       subscription: {
//         select: {
//           status: true,
//           isActive: true,
//           endDate: true,
//         },
//       },
//     },
//   },
// },
//     });

//     if (!existingOrder) {
//       return NextResponse.json(
//         { message: "Order not found." },
//         { status: 404 }
//       );
//     }
// const subscription = existingOrder.store.subscription;

// if (
//   !subscription ||
//   subscription.status !== "ACTIVE" ||
//   !subscription.isActive ||
//   subscription.endDate <= new Date()
// ) {
//   return NextResponse.json(
//     {
//       message:
//         "Your store subscription is inactive or expired. Renew or restore your subscription to manage orders.",
//     },
//     { status: 403 }
//   );
// }
//     const updatedOrder = await prisma.order.update({
//       where: {
//         orderId,
//       },
//       data: {
//   orderStatus: status as
//     | "CONFIRMED"
//     | "PROCESSING"
//     | "SHIPPED"
//     | "DELIVERED",
// },
//       select: {
//         orderId: true,
//         orderNumber: true,
//         orderStatus: true,
//         paymentStatus: true,
//       },
//     });

//     return NextResponse.json({
//       message: "Order status updated successfully.",
//       order: updatedOrder,
//     });
//   } catch (error) {
//     console.error("Update order status error:", error);

//     return NextResponse.json(
//       {
//         message: "Something went wrong while updating the order.",
//       },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getActiveRequestUser } from "../../../../../../lib/request-auth";
import { getStoreManagementBlockReason } from "../../../../../../lib/store-management-access";

const allowedStatuses = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

export async function PATCH(
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
        { message: "Only Store Owners can update orders." },
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

    const body = await request.json();
    const status = String(body.status || "").toUpperCase();

    if (!allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
      return NextResponse.json(
        { message: "Invalid order status." },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        orderId,
        store: {
          ownerId: user.userId,
        },
      },
      select: {
        orderId: true,
        orderNumber: true,
        orderStatus: true,
        customerId: true,
        paymentStatus: true,
        customer: { select: { userId: true } },
        store: {
          select: {
            storeName: true,
            status: true,
            subscription: {
              select: {
                status: true,
                isActive: true,
                endDate: true,
              },
            },
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 }
      );
    }

    const managementBlock = getStoreManagementBlockReason(existingOrder.store);
    if (managementBlock) {
      return NextResponse.json(
        { message: managementBlock },
        { status: 403 }
      );
    }

    if (existingOrder.paymentStatus !== "PAID") {
      return NextResponse.json(
        { message: "An order cannot be fulfilled until its payment is verified." },
        { status: 409 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: {
        orderId,
      },
      data: {
        orderStatus: status as
          | "CONFIRMED"
          | "PROCESSING"
          | "SHIPPED"
          | "DELIVERED",
      },
      select: {
        orderId: true,
        orderNumber: true,
        orderStatus: true,
        paymentStatus: true,
      },
    });

    // Notify the customer when the order status changes.
    if (existingOrder.orderStatus !== updatedOrder.orderStatus) {
      try {
        const statusMessages: Record<string, string> = {
          CONFIRMED: `Your order ${updatedOrder.orderNumber} has been confirmed by ${existingOrder.store.storeName}.`,
          PROCESSING: `Your order ${updatedOrder.orderNumber} is being processed by ${existingOrder.store.storeName}.`,
          SHIPPED: `Your order ${updatedOrder.orderNumber} has been shipped by ${existingOrder.store.storeName}.`,
          DELIVERED: `Your order ${updatedOrder.orderNumber} has been delivered.`,
        };

        const notifications = [
          {
            userId: existingOrder.customer.userId,
            title: `Order ${updatedOrder.orderStatus.toLowerCase()}`,
            message: statusMessages[updatedOrder.orderStatus],
            notificationType: "ORDER" as const,
            deduplicationKey: `order-status:${updatedOrder.orderId}:${updatedOrder.orderStatus}:${existingOrder.customerId}`,
          },
        ];

        // Notify Super Admin only when an order is delivered.
        if (updatedOrder.orderStatus === "DELIVERED") {
          const admins = await prisma.user.findMany({
            where: {
              role: "SUPER_ADMIN",
            },
            select: {
              userId: true,
            },
          });

          for (const admin of admins) {
            notifications.push({
              userId: admin.userId,
              title: "Order delivered",
              message: `Order ${updatedOrder.orderNumber} from ${existingOrder.store.storeName} has been delivered.`,
              notificationType: "ORDER" as const,
              deduplicationKey: `admin-order-delivered:${updatedOrder.orderId}:${admin.userId}`,
            });
          }
        }

        await prisma.notification.createMany({
          data: notifications,
          skipDuplicates: true,
        });
      } catch (notificationError) {
        // Notification failures must not undo a successful order update.
        console.error(
          "Order status notification error:",
          notificationError
        );
      }
    }

    return NextResponse.json({
      message: "Order status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while updating the order.",
      },
      { status: 500 }
    );
  }
}
