
import { NextRequest, NextResponse } from "next/server";
import { getActiveRequestUser } from "../../../../../lib/request-auth";
import { prisma } from "../../../../../lib/prisma";

type RouteContext = {
  params: Promise<{ subscriptionId: string }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await getActiveRequestUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const { subscriptionId } = await params;
    const body = await request.json();
    const action = body.action;

    if (!["suspend", "activate"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Choose a valid action: suspend or activate.",
        },
        { status: 400 }
      );
    }

  const subscription = await prisma.subscription.findUnique({
  where: { subscriptionId },
  include: {
    store: {
      select: {
        storeId: true,
        storeName: true,
        ownerId: true,
      },
    },
  },
});

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: "Subscription not found." },
        { status: 404 }
      );
    }

    const now = new Date();
    const isPastEndDate = subscription.endDate <= now;

    if (action === "suspend") {
      if (subscription.status !== "ACTIVE" || isPastEndDate) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Only an unexpired active subscription can be suspended.",
          },
          { status: 409 }
        );
      }

      const updated = await prisma.subscription.update({
        where: { subscriptionId },
        data: {
          status: "SUSPENDED",
          isActive: false,
        },
      });
      try {
  await prisma.notification.create({
    data: {
      userId: subscription.store.ownerId,
      title: "Subscription suspended",
      message: `The subscription for ${subscription.store.storeName} has been suspended by the BeautyMart administrator. Store management is unavailable until it is reactivated.`,
      notificationType: "SUBSCRIPTION",
    },
  });
} catch (notificationError) {
  console.error(
    "Subscription was suspended, but owner notification failed:",
    notificationError
  );
}

      return NextResponse.json({
        success: true,
        message: "Subscription suspended successfully.",
        subscription: {
          subscriptionId: updated.subscriptionId,
          status: updated.status,
          isActive: updated.isActive,
          endDate: updated.endDate,
        },
      });
    }

    // Activation is only for suspended subscriptions that
    // have not reached their end date.
    if (subscription.status !== "SUSPENDED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only suspended subscriptions can be activated. Expired subscriptions need renewal or an approved extension.",
        },
        { status: 409 }
      );
    }

    if (isPastEndDate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This subscription has expired. Extend or renew it before activation.",
        },
        { status: 409 }
      );
    }

    const updated = await prisma.subscription.update({
      where: { subscriptionId },
      data: {
        status: "ACTIVE",
        isActive: true,
      },
    });
try {
  await prisma.notification.create({
    data: {
      userId: subscription.store.ownerId,
      title: "Subscription reactivated",
      message: `The subscription for ${subscription.store.storeName} has been reactivated. You can manage your store again.`,
      notificationType: "SUBSCRIPTION",
    },
  });
} catch (notificationError) {
  console.error(
    "Subscription was reactivated, but owner notification failed:",
    notificationError
  );
}
    return NextResponse.json({
      success: true,
      message: "Subscription activated successfully.",
      subscription: {
        subscriptionId: updated.subscriptionId,
        status: updated.status,
        isActive: updated.isActive,
        endDate: updated.endDate,
      },
    });
  } catch (error) {
    console.error("Admin subscription PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update subscription.",
      },
      { status: 500 }
    );
  }
}
