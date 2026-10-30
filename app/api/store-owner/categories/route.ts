
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getActiveRequestUser } from "../../../../lib/request-auth";
import { getStoreManagementBlockReason } from "../../../../lib/store-management-access";

async function getOwnedStore(request: NextRequest) {
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
        { message: "Only store owners can manage categories." },
        { status: 403 }
      ),
    };
  }

  const store = await prisma.store.findFirst({
    where: { ownerId: user.userId },
    include: { subscription: true },
  });

  if (!store) {
    return {
      error: NextResponse.json(
        { message: "Your store could not be found." },
        { status: 404 }
      ),
    };
  }

  return { store };
}

export async function GET(request: NextRequest) {
  try {
    const result = await getOwnedStore(request);

    if ("error" in result) return result.error;

    const categories = await prisma.category.findMany({
      where: { storeId: result.store.storeId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({
      categories: categories.map((category) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        description: category.description,
        createdAt: category.createdAt,
        productCount: category._count.products,
      })),
    });
  } catch (error) {
    console.error("Store-owner categories GET error:", error);

    return NextResponse.json(
      { message: "Failed to load categories." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await getOwnedStore(request);

    if ("error" in result) return result.error;

    const { store } = result;

    const managementBlock = getStoreManagementBlockReason(store);
    if (managementBlock) {
      return NextResponse.json(
        { message: managementBlock },
        { status: 403 }
      );
    }

    const body = await request.json();
    const categoryName =
      typeof body.categoryName === "string"
        ? body.categoryName.trim()
        : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (!categoryName) {
      return NextResponse.json(
        { message: "Category name is required." },
        { status: 400 }
      );
    }

    if (categoryName.length > 80) {
      return NextResponse.json(
        { message: "Category name must be 80 characters or fewer." },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findFirst({
      where: {
        storeId: store.storeId,
        categoryName: {
          equals: categoryName,
          mode: "insensitive",
        },
      },
      select: { categoryId: true },
    });

    if (existing) {
      return NextResponse.json(
        { message: "This category already exists in your store." },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        storeId: store.storeId,
        categoryName,
        description: description || null,
      },
    });

    return NextResponse.json(
      {
        message: "Category created successfully.",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Store-owner categories POST error:", error);

    return NextResponse.json(
      { message: "Failed to create category." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const result = await getOwnedStore(request);
    if ("error" in result) return result.error;
    const managementBlock = getStoreManagementBlockReason(result.store);
    if (managementBlock) return NextResponse.json({ message: managementBlock }, { status: 403 });
    const body = await request.json();
    const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
    const categoryName = typeof body.categoryName === "string" ? body.categoryName.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (!categoryId || !categoryName || categoryName.length > 80) return NextResponse.json({ message: "A category ID and a name of 80 characters or fewer are required." }, { status: 400 });
    const category = await prisma.category.findFirst({ where: { categoryId, storeId: result.store.storeId } });
    if (!category) return NextResponse.json({ message: "Category not found." }, { status: 404 });
    const duplicate = await prisma.category.findFirst({ where: { storeId: result.store.storeId, categoryName: { equals: categoryName, mode: "insensitive" }, categoryId: { not: categoryId } } });
    if (duplicate) return NextResponse.json({ message: "This category already exists in your store." }, { status: 409 });
    const updated = await prisma.category.update({ where: { categoryId }, data: { categoryName, description: description || null } });
    return NextResponse.json({ message: "Category updated successfully.", category: updated });
  } catch { return NextResponse.json({ message: "Failed to update category." }, { status: 500 }); }
}

export async function DELETE(request: NextRequest) {
  try {
    const result = await getOwnedStore(request);
    if ("error" in result) return result.error;
    const managementBlock = getStoreManagementBlockReason(result.store);
    if (managementBlock) return NextResponse.json({ message: managementBlock }, { status: 403 });
    const body = await request.json();
    const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
    const category = await prisma.category.findFirst({ where: { categoryId, storeId: result.store.storeId }, include: { _count: { select: { products: true } } } });
    if (!category) return NextResponse.json({ message: "Category not found." }, { status: 404 });
    if (category._count.products > 0) return NextResponse.json({ message: "This category still has products. Move or deactivate those products before deleting it." }, { status: 409 });
    await prisma.category.delete({ where: { categoryId } });
    return NextResponse.json({ message: "Category deleted successfully." });
  } catch { return NextResponse.json({ message: "Failed to delete category." }, { status: 500 }); }
}
