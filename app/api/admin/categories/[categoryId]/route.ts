import { NextRequest, NextResponse } from "next/server";
import { getActiveRequestUser } from "../../../../../lib/request-auth";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const user = await getActiveRequestUser(req);

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { categoryId } = await params;

    const category = await prisma.category.findUnique({
      where: {
        categoryId,
      },

      include: {
        store: {
          select: {
            storeId: true,
            storeName: true,
            description: true,
            email: true,
            phone: true,
            address: true,
            status: true,
          },
        },

        products: {
          orderBy: {
            createdAt: "desc",
          },

          select: {
            productId: true,
            productName: true,
            description: true,
            price: true,
            isActive: true,
            createdAt: true,

            inventory: {
              select: {
                quantity: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category: {
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        description: category.description,
        createdAt: category.createdAt,

        store: category.store
          ? {
              storeId: category.store.storeId,
              storeName: category.store.storeName,
              description: category.store.description,
              email: category.store.email,
              phone: category.store.phone,
              address: category.store.address,
              status: category.store.status,
            }
          : null,

        productCount: category.products.length,

        products: category.products.map((product) => ({
          productId: product.productId,
          productName: product.productName,
          description: product.description,
          price: Number(product.price),
          isActive: product.isActive,
          createdAt: product.createdAt,
          quantity: product.inventory?.quantity ?? 0,
        })),
      },
    });
  } catch (error) {
    console.error("Admin category details error:", error);

    return NextResponse.json(
      { message: "Failed to load category details" },
      { status: 500 }
    );
  }
}
