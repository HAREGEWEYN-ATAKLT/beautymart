

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getActiveRequestUser } from "../../../lib/request-auth";
import { getStoreManagementBlockReason } from "../../../lib/store-management-access";

async function checkStoreSubscription(
  storeId: string,
  ownerId: string
): Promise<NextResponse | null> {
  const store = await prisma.store.findFirst({
    where: {
      storeId,
      ownerId,
    },
    include: {
      subscription: true,
    },
  });

  if (!store) {
    return NextResponse.json(
      { message: "Store not found or access denied." },
      { status: 403 }
    );
  }

  const reason = getStoreManagementBlockReason(store);
  if (reason) return NextResponse.json({ message: reason }, { status: 403 });

  return null;
}
/*
|--------------------------------------------------------------------------
| GET /api/products
|--------------------------------------------------------------------------
| Get the products belonging to the logged-in Store Owner's selected store.
|--------------------------------------------------------------------------
*/

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
        { message: "Only Store Owners can manage products." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { message: "Store ID is required." },
        { status: 400 }
      );
    }

    /*
     * IMPORTANT:
     * We don't simply trust the storeId from the browser.
     * We check that this store belongs to the logged-in owner.
     */
    const store = await prisma.store.findFirst({
      where: {
        storeId,
        ownerId: user.userId,
      },
    });

    if (!store) {
      return NextResponse.json(
        { message: "You do not have access to this store." },
        { status: 403 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        storeId: store.storeId,
      },
      include: {
        category: true,
        inventory: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return NextResponse.json(
      { message: "Something went wrong while getting products." },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/products
|--------------------------------------------------------------------------
| Create a product for a specific store.
|--------------------------------------------------------------------------
*/

export async function POST(request: NextRequest) {
  try {
    // ------------------------------------------------------------
    // 1. Get logged-in user
    // ------------------------------------------------------------

    const user = await getActiveRequestUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    // ------------------------------------------------------------
    // 2. Only Store Owners can create products
    // ------------------------------------------------------------

    if (user.role !== "STORE_OWNER") {
      return NextResponse.json(
        {
          message: "Only Store Owners can create products.",
        },
        { status: 403 }
      );
    }

    // ------------------------------------------------------------
    // 3. Read request body
    // ------------------------------------------------------------

    const body = await request.json();

    const {
      storeId,
      productName,
      categoryName,
      description,
      price,
      quantity,
      imageUrl,
    } = body;

    // ------------------------------------------------------------
    // 4. Validate required fields
    // ------------------------------------------------------------

    if (!storeId) {
      return NextResponse.json(
        { message: "Store ID is required." },
        { status: 400 }
      );
    }

    if (!productName?.trim()) {
      return NextResponse.json(
        { message: "Product name is required." },
        { status: 400 }
      );
    }

    if (!categoryName?.trim()) {
      return NextResponse.json(
        { message: "Category is required." },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || price === "") {
      return NextResponse.json(
        { message: "Product price is required." },
        { status: 400 }
      );
    }

    if (quantity === undefined || quantity === null || quantity === "") {
      return NextResponse.json(
        { message: "Initial stock is required." },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // 5. Convert and validate price
    // ------------------------------------------------------------

    const productPrice = Number(price);

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      return NextResponse.json(
        { message: "Please enter a valid product price." },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // 6. Convert and validate quantity
    // ------------------------------------------------------------

    const productQuantity = Number(quantity);

    if (
      !Number.isInteger(productQuantity) ||
      productQuantity < 0
    ) {
      return NextResponse.json(
        { message: "Please enter a valid stock quantity." },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // 7. Verify Store Ownership
    // ------------------------------------------------------------
    //
    // The browser sends storeId.
    //
    // But we NEVER assume the browser is telling the truth.
    //
    // We check:
    //
    //      storeId
    //          +
    //      logged-in user's ID
    //
    // If the store doesn't belong to the user -> reject.
    // ------------------------------------------------------------

    const store = await prisma.store.findFirst({
      where: {
        storeId: String(storeId),
        ownerId: user.userId,
      },
    });

    if (!store) {
      return NextResponse.json(
        {
          message:
            "You do not have permission to add products to this store.",
        },
        { status: 403 }
      );
    }
const subscriptionError = await checkStoreSubscription(
  store.storeId,
  user.userId
);

if (subscriptionError) {
  return subscriptionError;
}
    // ------------------------------------------------------------
    // 8. Find or create category for THIS store
    // ------------------------------------------------------------

    const category = await prisma.category.upsert({
      where: {
        storeId_categoryName: {
          storeId: store.storeId,
          categoryName: String(categoryName).trim(),
        },
      },

      update: {},

      create: {
        storeId: store.storeId,
        categoryName: String(categoryName).trim(),
      },
    });

    // ------------------------------------------------------------
    // 9. Create Product + Inventory + Image
    // ------------------------------------------------------------

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          storeId: store.storeId,

          categoryId: category.categoryId,

          productName: String(productName).trim(),

          description: description
            ? String(description).trim()
            : null,

          price: productPrice,

          isActive: true,

          // Create inventory automatically
          inventory: {
            create: {
              quantity: productQuantity,
              minimumStock: 0,
            },
          },

          // Create image only when imageUrl exists
          ...(imageUrl
            ? {
                images: {
                  create: {
                    imageUrl: String(imageUrl),
                    isPrimary: true,
                  },
                },
              }
            : {}),
        },

        include: {
          category: true,
          inventory: true,
          images: true,
          store: true,
        },
      });

      return newProduct;
    });

    // ------------------------------------------------------------
    // 10. Success
    // ------------------------------------------------------------

    return NextResponse.json(
      {
        message: "Product created successfully.",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product creation error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while creating the product.",
      },
      { status: 500 }
    );
  }
}
/*
|--------------------------------------------------------------------------
| PUT /api/products
|--------------------------------------------------------------------------
| Update an existing product belonging to the logged-in Store Owner.
|--------------------------------------------------------------------------
*/

export async function PUT(request: NextRequest) {
  try {
    // ------------------------------------------------------------
    // 1. Get logged-in user
    // ------------------------------------------------------------

    const user = await getActiveRequestUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    // ------------------------------------------------------------
    // 2. Only Store Owners can edit products
    // ------------------------------------------------------------

    if (user.role !== "STORE_OWNER") {
      return NextResponse.json(
        {
          message: "Only Store Owners can edit products.",
        },
        { status: 403 }
      );
    }

    // ------------------------------------------------------------
    // 3. Read request body
    // ------------------------------------------------------------

    const body = await request.json();

    const {
      productId,
      productName,
      categoryName,
      description,
      price,
      quantity,
      inventoryUpdatedAt,
    } = body;

    // ------------------------------------------------------------
    // 4. Validate product ID
    // ------------------------------------------------------------

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required." },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // 5. Validate product name
    // ------------------------------------------------------------

    if (!productName?.trim()) {
      return NextResponse.json(
        { message: "Product name is required." },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // 6. Validate category
    // ------------------------------------------------------------

    if (!categoryName?.trim()) {
      return NextResponse.json(
        { message: "Category is required." },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // 7. Validate price
    // ------------------------------------------------------------

    if (price === undefined || price === null || price === "") {
      return NextResponse.json(
        { message: "Product price is required." },
        { status: 400 }
      );
    }

    const productPrice = Number(price);

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      return NextResponse.json(
        { message: "Please enter a valid product price." },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // 8. Validate quantity
    // ------------------------------------------------------------

    if (quantity === undefined || quantity === null || quantity === "") {
      return NextResponse.json(
        { message: "Stock quantity is required." },
        { status: 400 }
      );
    }

    const productQuantity = Number(quantity);

    if (
      !Number.isInteger(productQuantity) ||
      productQuantity < 0
    ) {
      return NextResponse.json(
        { message: "Please enter a valid stock quantity." },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------
    // 9. Find the product
    // ------------------------------------------------------------

    const existingProduct = await prisma.product.findUnique({
      where: {
        productId: String(productId),
      },
      include: {
        store: true,
        inventory: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    // ------------------------------------------------------------
    // 10. IMPORTANT: Verify ownership
    // ------------------------------------------------------------

    if (existingProduct.store.ownerId !== user.userId) {
      return NextResponse.json(
        {
          message:
            "You do not have permission to edit this product.",
        },
        { status: 403 }
      );
    }
const subscriptionError = await checkStoreSubscription(
  existingProduct.storeId,
  user.userId
);

if (subscriptionError) {
  return subscriptionError;
}
    // ------------------------------------------------------------
    // 11. Find or create category inside the same store
    // ------------------------------------------------------------

    const category = await prisma.category.upsert({
      where: {
        storeId_categoryName: {
          storeId: existingProduct.storeId,
          categoryName: String(categoryName).trim(),
        },
      },

      update: {},

      create: {
        storeId: existingProduct.storeId,
        categoryName: String(categoryName).trim(),
      },
    });

    // ------------------------------------------------------------
    // 12. Update Product + Inventory
    // ------------------------------------------------------------

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: {
          productId: existingProduct.productId,
        },

        data: {
          productName: String(productName).trim(),

          categoryId: category.categoryId,

          description: description
            ? String(description).trim()
            : null,

          price: productPrice,
        },

        include: {
          category: true,
          inventory: true,
          images: true,
          store: true,
        },
      });

      // ----------------------------------------------------------
      // Update existing inventory
      // ----------------------------------------------------------

      if (existingProduct.inventory) {
        if (typeof inventoryUpdatedAt !== "string" || Number.isNaN(new Date(inventoryUpdatedAt).getTime())) {
          throw new Error("INVENTORY_VERSION_REQUIRED");
        }
        const inventoryUpdate = await tx.inventory.updateMany({
          where: { productId: existingProduct.productId, updatedAt: new Date(inventoryUpdatedAt) },
          data: {
            quantity: productQuantity,
          },
        });
        if (inventoryUpdate.count !== 1) throw new Error("INVENTORY_CHANGED");
      } else {
        // Safety fallback:
        // If somehow the product has no inventory record,
        // create one.
        await tx.inventory.create({
          data: {
            productId: existingProduct.productId,
            quantity: productQuantity,
            minimumStock: 0,
          },
        });
      }

      // Get the product again with the updated inventory
      return await tx.product.findUnique({
        where: {
          productId: existingProduct.productId,
        },
        include: {
          category: true,
          inventory: true,
          images: true,
          store: true,
        },
      });
    });

    // ------------------------------------------------------------
    // 13. Success
    // ------------------------------------------------------------

    return NextResponse.json(
      {
        message: "Product updated successfully.",
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "INVENTORY_CHANGED") {
      return NextResponse.json({ message: "Stock changed while you were editing. Refresh the product and enter the quantity again." }, { status: 409 });
    }
    if (error instanceof Error && error.message === "INVENTORY_VERSION_REQUIRED") {
      return NextResponse.json({ message: "Reload the product before saving stock changes." }, { status: 409 });
    }
    console.error("Product update error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while updating the product.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
        {
          message: "Only Store Owners can delete products.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        productId: String(productId),
      },
      include: {
        store: true,
        _count: { select: { orderItems: true } },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    if (product.store.ownerId !== user.userId) {
      return NextResponse.json(
        {
          message:
            "You do not have permission to delete this product.",
        },
        { status: 403 }
      );
    }
const subscriptionError = await checkStoreSubscription(
  product.storeId,
  user.userId
);

if (subscriptionError) {
  return subscriptionError;
}
    if (product._count.orderItems > 0) {
      await prisma.product.update({ where: { productId: product.productId }, data: { isActive: false } });
      return NextResponse.json({ message: "Product removed from sale and preserved for order history.", deactivated: true }, { status: 200 });
    }

    await prisma.product.delete({ where: { productId: product.productId } });

    return NextResponse.json(
      {
        message: "Product deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product deletion error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while deleting the product.",
      },
      { status: 500 }
    );
  }
}
export async function PATCH(request: NextRequest) {
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
        {
          message:
            "Only Store Owners can change product status.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { productId, isActive } = body;

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required." },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { message: "Product status must be true or false." },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        productId: String(productId),
      },
      include: {
        store: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    if (product.store.ownerId !== user.userId) {
      return NextResponse.json(
        {
          message:
            "You do not have permission to change this product.",
        },
        { status: 403 }
      );
    }
const subscriptionError = await checkStoreSubscription(
  product.storeId,
  user.userId
);

if (subscriptionError) {
  return subscriptionError;
}
    const updatedProduct = await prisma.product.update({
      where: {
        productId: product.productId,
      },
      data: {
        isActive,
      },
    });

    return NextResponse.json(
      {
        message: isActive
          ? "Product activated successfully."
          : "Product deactivated successfully.",
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product status update error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong while changing the product status.",
      },
      { status: 500 }
    );
  }
}
