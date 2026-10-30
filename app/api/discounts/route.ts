import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getActiveRequestUser } from "../../../lib/request-auth";
import { getStoreManagementBlockReason } from "../../../lib/store-management-access";

export async function GET(request: NextRequest) {
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
        { message: "Only Store Owners can access discounts." },
        { status: 403 }
      );
    }

    const stores = await prisma.store.findMany({
      where: {
        ownerId: user.userId,
      },
      select: {
        storeId: true,
      },
    });

    const storeIds = stores.map((store) => store.storeId);

    const discounts = await prisma.discount.findMany({
      where: {
        storeId: {
          in: storeIds,
        },
      },
      include: {
        productDiscounts: {
          include: {
            product: {
              select: {
                productId: true,
                productName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ discounts });
  } catch (error) {
    console.error("Get discounts error:", error);

    return NextResponse.json(
      { message: "Something went wrong while getting discounts." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
        { message: "Only Store Owners can create discounts." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      storeId,
      name,
      discountType,
      discountValue,
      startDate,
      endDate,
      productIds,
    } = body;

    if (
      !storeId ||
      !name ||
      !discountType ||
      discountValue === undefined ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        { message: "All discount fields are required." },
        { status: 400 }
      );
    }

    if (
      discountType !== "PERCENTAGE" &&
      discountType !== "FIXED_AMOUNT"
    ) {
      return NextResponse.json(
        { message: "Invalid discount type." },
        { status: 400 }
      );
    }

    const value = Number(discountValue);

    if (!Number.isFinite(value) || value <= 0) {
      return NextResponse.json(
        { message: "Discount value must be greater than 0." },
        { status: 400 }
      );
    }

    if (discountType === "PERCENTAGE" && value > 100) {
      return NextResponse.json(
        { message: "Percentage discount cannot exceed 100%." },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return NextResponse.json(
        { message: "Invalid discount dates." },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { message: "End date must be after start date." },
        { status: 400 }
      );
    }

   const store = await prisma.store.findFirst({
  where: {
    storeId: String(storeId),
    ownerId: user.userId,
  },
  select: {
    storeId: true,
    status: true,
    subscription: {
      select: {
        status: true,
        isActive: true,
        endDate: true,
      },
    },
  },
});

    if (!store) {
      return NextResponse.json(
        { message: "Store not found or you do not own this store." },
        { status: 403 }
      );
    }
    const managementBlock = getStoreManagementBlockReason(store);
    if (managementBlock) {
  return NextResponse.json(
    { message: managementBlock },
    { status: 403 }
  );
}

    const ids = Array.isArray(productIds)
      ? productIds.map(String)
      : [];

    if (ids.length > 0) {
      const products = await prisma.product.findMany({
        where: {
          productId: {
            in: ids,
          },
          storeId: store.storeId,
        },
        select: {
          productId: true,
        },
      });

      if (products.length !== ids.length) {
        return NextResponse.json(
          { message: "One or more products do not belong to this store." },
          { status: 400 }
        );
      }
    }

    const discount = await prisma.discount.create({
      data: {
        storeId: store.storeId,
        name: String(name).trim(),
        discountType,
        discountValue: value,
        startDate: start,
        endDate: end,
        isActive: true,
        productDiscounts:
          ids.length > 0
            ? {
                create: ids.map((productId) => ({
                  productId,
                })),
              }
            : undefined,
      },
      include: {
        productDiscounts: {
          include: {
            product: {
              select: {
                productId: true,
                productName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Discount created successfully.",
        discount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create discount error:", error);

    return NextResponse.json(
      { message: "Something went wrong while creating the discount." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getActiveRequestUser(request);
    if (!user) {
      return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
    }
    if (user.role !== "STORE_OWNER") {
      return NextResponse.json({ message: "Only store owners can manage discounts." }, { status: 403 });
    }

    const body = await request.json();
    if (typeof body.discountId !== "string" || typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { message: "A discount ID and active status are required." },
        { status: 400 }
      );
    }

    const discount = await prisma.discount.findFirst({
      where: { discountId: body.discountId, store: { ownerId: user.userId } },
      include: { store: { include: { subscription: true } } },
    });
    if (!discount) {
      // Do not reveal whether another store owns this discount.
      return NextResponse.json({ message: "Discount not found." }, { status: 404 });
    }

    const managementBlock = getStoreManagementBlockReason(discount.store);
    if (managementBlock) {
      return NextResponse.json({ message: managementBlock }, { status: 403 });
    }

    const updated = await prisma.discount.update({
      where: { discountId: discount.discountId },
      data: { isActive: body.isActive },
    });
    return NextResponse.json({
      message: body.isActive ? "Discount activated." : "Discount deactivated.",
      discount: updated,
    });
  } catch (error) {
    console.error("Update discount error:", error);
    return NextResponse.json({ message: "Failed to update discount." }, { status: 500 });
  }
}
