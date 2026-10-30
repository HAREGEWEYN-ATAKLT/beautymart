import { NextRequest, NextResponse } from "next/server";
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
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const products = await prisma.product.findMany({
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
        category: {
          select: {
            categoryId: true,
            categoryName: true,
          },
        },
        inventory: {
          select: {
            quantity: true,
          },
        },
        images: {
          select: {
            imageUrl: true,
          },
          take: 1,
        },
      },
    });

    const formattedProducts = products.map((product) => {
      const quantity = product.inventory?.quantity ?? 0;

      return {
        productId: product.productId,
        productName: product.productName,
        description: product.description,
        price: Number(product.price),
        isActive: product.isActive,
        createdAt: product.createdAt,

        store: {
          storeId: product.store.storeId,
          storeName: product.store.storeName,
          status: product.store.status,
        },

        category: product.category
          ? {
              categoryId: product.category.categoryId,
              name: product.category.categoryName,
            }
          : null,

        quantity,

        imageUrl: product.images[0]?.imageUrl ?? null,
      };
    });

    const statistics = {
      totalProducts: formattedProducts.length,

      activeProducts: formattedProducts.filter(
        (product) => product.isActive
      ).length,

      inactiveProducts: formattedProducts.filter(
        (product) => !product.isActive
      ).length,

      lowStockProducts: formattedProducts.filter(
        (product) =>
          product.quantity > 0 && product.quantity <= 5
      ).length,

      outOfStockProducts: formattedProducts.filter(
        (product) => product.quantity === 0
      ).length,
    };

    return NextResponse.json({
      statistics,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Admin products GET error:", error);

    return NextResponse.json(
      { message: "Failed to load products" },
      { status: 500 }
    );
  }
}
