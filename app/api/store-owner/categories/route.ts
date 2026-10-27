
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "../../../../lib/prisma";

async function getOwnedStore(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: false,
  });

  if (!token?.id) {
    return {
      error: NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      ),
    };
  }

  if (token.role !== "STORE_OWNER") {
    return {
      error: NextResponse.json(
        { message: "Only store owners can manage categories." },
        { status: 403 }
      ),
    };
  }

  const store = await prisma.store.findFirst({
    where: { ownerId: String(token.id) },
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

    if (!store.subscription) {
      return NextResponse.json(
        { message: "Your store has no subscription." },
        { status: 403 }
      );
    }

    if (
      store.subscription.status !== "ACTIVE" ||
      !store.subscription.isActive ||
      store.subscription.endDate <= new Date()
    ) {
      return NextResponse.json(
        {
          message:
            "Your subscription is inactive or expired. Renew it before managing categories.",
        },
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
