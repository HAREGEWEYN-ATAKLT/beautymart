import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
    
where: {
  productId: id,
  isActive: true,
  store: {
    status: "ACTIVE",
    subscription: {
      is: {
        status: "ACTIVE",
        isActive: true,
        endDate: {
          gt: new Date(),
        },
      },
    },
  },
},

      include: {
        category: true,
        store: {
          select: {
            storeId: true,
            storeName: true,
          },
        },
        inventory: {
          select: {
            quantity: true,
          },
        },
        images: {
          where: {
            isPrimary: true,
          },
          select: {
            productImageId: true,
            imageUrl: true,
            isPrimary: true,
          },
          take: 1,
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product,
    });
  } catch (error) {
    console.error("Marketplace product detail error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while loading the product.",
      },
      { status: 500 }
    );
  }
}