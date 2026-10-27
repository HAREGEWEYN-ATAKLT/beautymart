import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
     
where: {
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
        productDiscounts: {
  include: {
    discount: true,
  },
},
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error("Marketplace products error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while loading products.",
      },
      { status: 500 }
    );
  }
}