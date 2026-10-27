import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "../../../../lib/prisma";
import cloudinary  from "../../../../lib/cloudinary";
import type { UploadApiResponse } from "cloudinary";
export async function POST(request: NextRequest) {
  try {
    // 1. Check login
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: false,
    });

    if (!token?.id) {
      return NextResponse.json(
        { message: "You must be logged in." },
        { status: 401 }
      );
    }

    // 2. Check Store Owner role
    if (token.role !== "STORE_OWNER") {
      return NextResponse.json(
        {
          message: "Only Store Owners can upload product images.",
        },
        { status: 403 }
      );
    }

    // 3. Get product ID and image
    const formData = await request.formData();

    const productId = formData.get("productId");
    const image = formData.get("image");

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required." },
        { status: 400 }
      );
    }

    if (!(image instanceof File)) {
      return NextResponse.json(
        { message: "Please select an image." },
        { status: 400 }
      );
    }

    // 4. Check file type
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image files are allowed." },
        { status: 400 }
      );
    }

    // 5. Check file size
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Image must be smaller than 5MB." },
        { status: 400 }
      );
    }

    // 6. Find product and verify ownership
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

    if (product.store.ownerId !== String(token.id)) {
      return NextResponse.json(
        {
          message:
            "You do not have permission to upload an image for this product.",
        },
        { status: 403 }
      );
    }

    
    // Check the owning store's subscription before uploading
    const store = await prisma.store.findFirst({
      where: {
        storeId: product.storeId,
        ownerId: String(token.id),
      },
      include: {
        subscription: true,
      },
    });

    const subscription = store?.subscription;
    if (
      !subscription ||
      subscription.status !== "ACTIVE" ||
      !subscription.isActive ||
      subscription.endDate <= new Date()
    ) {
      return NextResponse.json(
        {
          message:
            "This store's subscription is inactive, suspended, or expired. Renew or restore access before uploading product images.",
        },
        { status: 403 }
      );
    }



    // 7. Convert image to buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 8. Upload to Cloudinary
// const uploadResult = await new Promise<UploadApiResponse>(
//   (resolve, reject) => {
//         const uploadStream = cloudinary.uploader.upload_stream(
//           {
//             folder: "beautymart/products",
//             resource_type: "image",
//           },
//           (error, result) => {
//             if (error) {
//               reject(error);
//             } else {
//               resolve(result);
//             }
//           }
//         );

//         uploadStream.end(buffer);
//       }
//     );

    // 8. Upload to Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "beautymart/products",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result) {
              reject(
                new Error("Cloudinary returned no upload result.")
              );
              return;
            }

            resolve(result);
          }
        );

        uploadStream.end(buffer);
      }
    );

    // 9. Remove old primary image
    await prisma.productImage.updateMany({
      where: {
        productId: product.productId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });

    // 10. Save new image URL in database
    const productImage = await prisma.productImage.create({
      data: {
        productId: product.productId,
        imageUrl: uploadResult.secure_url,
        isPrimary: true,
      },
    });

    return NextResponse.json(
      {
        message: "Product image uploaded successfully.",
        image: productImage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product image upload error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while uploading the product image.",
      },
      { status: 500 }
    );
  }
}