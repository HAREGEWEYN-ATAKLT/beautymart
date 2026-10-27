import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        store: {
          select: {
            storeId: true,
            storeName: true,
            status: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const totalCategories = categories.length;

    const totalProducts = categories.reduce(
      (total, category) => total + category._count.products,
      0
    );

    const activeStores = new Set(
      categories
        .filter((category) => category.store.status === "ACTIVE")
        .map((category) => category.store.storeId)
    ).size;

    return NextResponse.json({
      statistics: {
        totalCategories,
        totalProducts,
        activeStores,
      },

      categories: categories.map((category) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        description: category.description,
        createdAt: category.createdAt,

        store: {
          storeId: category.store.storeId,
          storeName: category.store.storeName,
          status: category.store.status,
        },

        productCount: category._count.products,
      })),
    });
  } catch (error) {
    console.error("Admin categories error:", error);

    return NextResponse.json(
      { message: "Failed to load categories" },
      { status: 500 }
    );
  }
}