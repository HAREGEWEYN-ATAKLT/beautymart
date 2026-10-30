import { NextRequest, NextResponse } from "next/server";
import { getActiveRequestUser } from "../../../../../lib/request-auth";
import {prisma} from "../../../../../lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
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

    const { productId } = await params;

    const product = await prisma.product.findUnique({
      where: {
        productId,
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
        category: {
          select: {
            categoryId: true,
            categoryName: true,
            description: true,
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
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product: {
        productId: product.productId,
        productName: product.productName,
        description: product.description,
        price: Number(product.price),
        isActive: product.isActive,
        createdAt: product.createdAt,

        store: product.store
          ? {
              storeId: product.store.storeId,
              storeName: product.store.storeName,
              description: product.store.description,
              email: product.store.email,
              phone: product.store.phone,
              address: product.store.address,
              status: product.store.status,
            }
          : null,

        category: product.category
          ? {
              categoryId: product.category.categoryId,
              name: product.category.categoryName,
              description: product.category.description,
            }
          : null,

        quantity: product.inventory?.quantity ?? 0,

        images: product.images.map((image) => image.imageUrl),
      },
    });
  } catch (error) {
    console.error("Admin product details error:", error);

    return NextResponse.json(
      { message: "Failed to load product details" },
      { status: 500 }
    );
  }
}


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
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

    const { productId } = await params;

    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { message: "isActive must be true or false" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { productId },
      select: {
        productId: true,
        productName: true,
        isActive: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { productId },
      data: {
        isActive,
      },
      select: {
        productId: true,
        productName: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: isActive
        ? "Product activated successfully"
        : "Product deactivated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Admin product status update error:", error);

    return NextResponse.json(
      { message: "Failed to update product status" },
      { status: 500 }
    );
  }
}
