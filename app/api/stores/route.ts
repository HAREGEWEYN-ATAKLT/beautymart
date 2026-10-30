
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getActiveRequestUser } from "../../../lib/request-auth";
import { getStoreManagementBlockReason } from "../../../lib/store-management-access";

async function getAuthenticatedStoreOwner(request: NextRequest) {
  const user = await getActiveRequestUser(request);

  if (!user) {
    return {
      error: NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "STORE_OWNER") {
    return {
      error: NextResponse.json(
        { message: "Only Store Owners can manage stores." },
        { status: 403 }
      ),
    };
  }

  return { ownerId: user.userId };
}

/*
|--------------------------------------------------------------------------
| POST /api/stores
|--------------------------------------------------------------------------
| Create one store for the authenticated Store Owner.
| Every new store receives a one-month free trial.
|--------------------------------------------------------------------------
*/

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedStoreOwner(request);

    if ("error" in auth) {
      return auth.error;
    }

    const ownerId = auth.ownerId;
    const body = await request.json();

    const storeName =
      typeof body.storeName === "string" ? body.storeName.trim() : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const phone =
      typeof body.phone === "string" ? body.phone.trim() : "";
    const address =
      typeof body.address === "string" ? body.address.trim() : "";

    if (!storeName || !email || !phone || !address) {
      return NextResponse.json(
        {
          message:
            "Store name, email, phone, and address are required.",
        },
        { status: 400 }
      );
    }

    // A user account can own only one store.
    const existingOwnerStore = await prisma.store.findFirst({
      where: { ownerId },
      select: { storeName: true },
    });

    if (existingOwnerStore) {
      return NextResponse.json(
        {
          message: `You already own "${existingOwnerStore.storeName}". One account can own only one store.`,
        },
        { status: 409 }
      );
    }

    // Store contact email and phone must not belong to another store.
    const duplicateStoreContact = await prisma.store.findFirst({
      where: {
        OR: [{ email: { equals: email, mode: "insensitive" } }, { phone }],
      },
      select: { storeName: true },
    });

    if (duplicateStoreContact) {
      return NextResponse.json(
        {
          message:
            "This store email or phone number is already registered to another store. Please use different contact details.",
        },
        { status: 409 }
      );
    }

    // Do not use another user's registered email or phone number.
    // The authenticated owner's own account details are allowed.
    const duplicateUserContact = await prisma.user.findFirst({
      where: {
        userId: { not: ownerId },
        OR: [
          { email: { equals: email, mode: "insensitive" } },
          { phoneNumber: phone },
        ],
      },
      select: { userId: true },
    });

    if (duplicateUserContact) {
      return NextResponse.json(
        {
          message:
            "This email or phone number is already registered to another user.",
        },
        { status: 409 }
      );
    }

    const now = new Date();
    const trialEndDate = new Date(now);
    trialEndDate.setMonth(trialEndDate.getMonth() + 1);

    const store = await prisma.store.create({
      data: {
        ownerId,
        storeName,
        description: description || null,
        email,
        phone,
        address,
        status: "ACTIVE",
        subscription: {
          create: {
            planType: "TRIAL",
            status: "ACTIVE",
            startDate: now,
            endDate: trialEndDate,
            isActive: true,
          },
        },
      },
      include: {
        subscription: true,
      },
    });

  
      // Notify active Super Admins after the store and trial are created.
      // Notification failures must not interrupt store registration.
      try {
        const admins = await prisma.user.findMany({
          where: {
            role: "SUPER_ADMIN",
            isActive: true,
          },
          select: {
            userId: true,
          },
        });

        if (admins.length > 0) {
          await prisma.notification.createMany({
            data: admins.map((admin) => ({
              userId: admin.userId,
              title: "New store registered",
              message: `${store.storeName} has registered and received a one-month free trial.`,
              notificationType: "SUBSCRIPTION" as const,
              deduplicationKey: `admin-store-registered:${store.storeId}:${admin.userId}`,
            })),
            skipDuplicates: true,
          });
        }
      } catch (notificationError) {
        console.error(
          "Store was created, but admin notifications failed:",
          notificationError
        );
      }

      return NextResponse.json(
        {
          message: "Store created successfully with a one-month free trial.",
          store,
        },
        { status: 201 }
      );

  } catch (error) {
    console.error("Store creation error:", error);

    return NextResponse.json(
      { message: "Something went wrong while creating the store." },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| GET /api/stores
|--------------------------------------------------------------------------
| Owners can view their own stores, including suspended or expired stores.
|--------------------------------------------------------------------------
*/

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedStoreOwner(request);

    if ("error" in auth) {
      return auth.error;
    }


    const stores = await prisma.store.findMany({
      where: { ownerId: auth.ownerId },
      select: {
        storeId: true,
        storeName: true,
        description: true,
        logoUrl: true,
        bannerUrl: true,
        email: true,
        phone: true,
        address: true,
        status: true,
        createdAt: true,
       
subscription: {
  select: {
    subscriptionId: true,
    status: true,
    startDate: true,
    endDate: true,
    isActive: true,
    planType: true,
  },
},

      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error("Get stores error:", error);

    return NextResponse.json(
      { message: "Something went wrong while getting stores." },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT /api/stores
|--------------------------------------------------------------------------
| Update store details only when that store has an eligible subscription.
|--------------------------------------------------------------------------
*/

export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthenticatedStoreOwner(request);

    if ("error" in auth) {
      return auth.error;
    }

    const ownerId = auth.ownerId;
    const body = await request.json();

    const storeId =
      typeof body.storeId === "string" ? body.storeId.trim() : "";
    const storeName =
      typeof body.storeName === "string" ? body.storeName.trim() : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const phone =
      typeof body.phone === "string" ? body.phone.trim() : "";
    const address =
      typeof body.address === "string" ? body.address.trim() : "";

    if (!storeId) {
      return NextResponse.json(
        { message: "Store ID is required." },
        { status: 400 }
      );
    }

    if (!storeName || !email || !phone || !address) {
      return NextResponse.json(
        {
          message:
            "Store name, email, phone, and address are required.",
        },
        { status: 400 }
      );
    }

    const existingStore = await prisma.store.findFirst({
      where: {
        storeId,
        ownerId,
      },
      include: {
        subscription: true,
      },
    });

    if (!existingStore) {
      return NextResponse.json(
        {
          message:
            "Store not found or you do not have permission to update it.",
        },
        { status: 404 }
      );
    }

    const managementBlock = getStoreManagementBlockReason(existingStore);
    if (managementBlock) return NextResponse.json({ message: managementBlock }, { status: 403 });

    // Reject contact details already used by another store.
    const duplicateStoreContact = await prisma.store.findFirst({
      where: {
        storeId: { not: storeId },
        OR: [{ email: { equals: email, mode: "insensitive" } }, { phone }],
      },
      select: { storeName: true },
    });

    if (duplicateStoreContact) {
      return NextResponse.json(
        {
          message:
            "This email or phone number is already registered to another store.",
        },
        { status: 409 }
      );
    }

    // Only check contact values that are actually changing. Historical store
    // data can legitimately match an older user account; that must not stop
    // the owner from saving an unrelated change such as branding or address.
    const changedContactChecks = [];
    if (email.toLowerCase() !== (existingStore.email || "").toLowerCase()) {
      changedContactChecks.push({ email: { equals: email, mode: "insensitive" as const } });
    }
    if (phone !== (existingStore.phone || "")) {
      changedContactChecks.push({ phoneNumber: phone });
    }

    if (changedContactChecks.length > 0) {
      const duplicateUserContact = await prisma.user.findFirst({
        where: { userId: { not: ownerId }, OR: changedContactChecks },
        select: { userId: true },
      });
      if (duplicateUserContact) {
        return NextResponse.json(
          { message: "This email or phone number is already registered to another user." },
          { status: 409 }
        );
      }
    }

    const updatedStore = await prisma.store.update({
      where: { storeId },
      data: {
        storeName,
        description: description || null,
        email,
        phone,
        address,
      },
    });

    return NextResponse.json({
      message: "Store updated successfully.",
      store: updatedStore,
    });
  } catch (error) {
    console.error("Update store error:", error);

    return NextResponse.json(
      { message: "Something went wrong while updating the store." },
      { status: 500 }
    );
  }
}
