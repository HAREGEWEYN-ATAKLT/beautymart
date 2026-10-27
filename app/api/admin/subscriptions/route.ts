
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Only Super Admin can access subscription monitoring
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const subscriptions = await prisma.subscription.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        store: {
          select: {
            storeId: true,
            storeName: true,
            status: true,
            owner: {
              select: {
                userId: true,
                fullName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    const now = new Date();

    const formattedSubscriptions = subscriptions.map((subscription) => {
      // If an ACTIVE subscription has passed its end date,
      // display it as EXPIRED.
   const isExpired =
  subscription.status === "ACTIVE" &&
  subscription.endDate.getTime() <= now.getTime();

      const effectiveStatus = isExpired
        ? "EXPIRED"
        : subscription.status;

      return {
        subscriptionId: subscription.subscriptionId,
        storeId: subscription.storeId,
        planType: subscription.planType,

        status: effectiveStatus,

        startDate: subscription.startDate,
        endDate: subscription.endDate,

        // Keep this field for compatibility with existing frontend code.
        isActive: effectiveStatus === "ACTIVE",

        isExpired: effectiveStatus === "EXPIRED",

        createdAt: subscription.createdAt,

        store: {
          storeId: subscription.store.storeId,
          storeName: subscription.store.storeName,
          status: subscription.store.status,
        },

        owner: {
          userId: subscription.store.owner.userId,
          fullName: subscription.store.owner.fullName,
          email: subscription.store.owner.email,
          phoneNumber: subscription.store.owner.phoneNumber,
        },
      };
    });

    const statistics = {
      totalSubscriptions: formattedSubscriptions.length,

      activeSubscriptions: formattedSubscriptions.filter(
        (subscription) => subscription.status === "ACTIVE"
      ).length,

      expiredSubscriptions: formattedSubscriptions.filter(
        (subscription) => subscription.status === "EXPIRED"
      ).length,

      suspendedSubscriptions: formattedSubscriptions.filter(
        (subscription) => subscription.status === "SUSPENDED"
      ).length,

      cancelledSubscriptions: formattedSubscriptions.filter(
        (subscription) => subscription.status === "CANCELLED"
      ).length,

      trialSubscriptions: formattedSubscriptions.filter(
        (subscription) => subscription.planType === "TRIAL"
      ).length,

      starterSubscriptions: formattedSubscriptions.filter(
        (subscription) => subscription.planType === "STARTER"
      ).length,

      standardSubscriptions: formattedSubscriptions.filter(
        (subscription) => subscription.planType === "STANDARD"
      ).length,
    };

    return NextResponse.json({
      success: true,
      statistics,
      subscriptions: formattedSubscriptions,
    });
  } catch (error) {
    console.error("Admin subscriptions GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load subscriptions.",
      },
      { status: 500 }
    );
  }
}