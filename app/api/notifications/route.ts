
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getActiveRequestUser } from "../../../lib/request-auth";

// GET: Return only the signed-in user's notifications.
export async function GET(request: NextRequest) {
  try {
    const user = await getActiveRequestUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          notificationId: true,
          title: true,
          message: true,
          notificationType: true,
          deduplicationKey: true,
          isRead: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({
        where: {
          userId: user.userId,
          isRead: false,
        },
      }),
    ]);

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Failed to load notifications:", error);

    return NextResponse.json(
      { error: "Unable to load notifications." },
      { status: 500 }
    );
  }
}

// PATCH: Mark one notification or all of the user's notifications as read.
export async function PATCH(request: NextRequest) {
  try {
    const user = await getActiveRequestUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    let body: { notificationId?: unknown; markAllRead?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    if (body.markAllRead === true) {
      const result = await prisma.notification.updateMany({
        where: {
          userId: user.userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      return NextResponse.json({
        success: true,
        updatedCount: result.count,
      });
    }

    if (
      typeof body.notificationId !== "string" ||
      !body.notificationId.trim()
    ) {
      return NextResponse.json(
        { error: "A valid notificationId is required." },
        { status: 400 }
      );
    }

    const result = await prisma.notification.updateMany({
      where: {
        notificationId: body.notificationId,
        userId: user.userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    if (result.count === 0) {
      const existing = await prisma.notification.findFirst({
        where: {
          notificationId: body.notificationId,
          userId: user.userId,
        },
        select: { notificationId: true },
      });

      if (!existing) {
        return NextResponse.json(
          { error: "Notification not found." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update notifications:", error);

    return NextResponse.json(
      { error: "Unable to update notifications." },
      { status: 500 }
    );
  }
}
