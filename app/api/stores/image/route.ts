import { NextRequest, NextResponse } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import cloudinary from "../../../../lib/cloudinary";
import { prisma } from "../../../../lib/prisma";
import { validateProductImage } from "../../../../lib/product-image-validation";
import { getActiveRequestUser } from "../../../../lib/request-auth";
import { getStoreManagementBlockReason } from "../../../../lib/store-management-access";

export async function POST(request: NextRequest) {
  try {
    const user = await getActiveRequestUser(request);
    if (!user) return NextResponse.json({ message: "You must be logged in." }, { status: 401 });
    if (user.role !== "STORE_OWNER") return NextResponse.json({ message: "Only store owners can upload store images." }, { status: 403 });

    const formData = await request.formData();
    const storeId = typeof formData.get("storeId") === "string" ? String(formData.get("storeId")).trim() : "";
    const imageType = formData.get("imageType");
    const image = formData.get("image");
    if (!storeId || (imageType !== "logo" && imageType !== "banner") || !(image instanceof File)) {
      return NextResponse.json({ message: "Store, image type, and image file are required." }, { status: 400 });
    }

    const store = await prisma.store.findFirst({
      where: { storeId, ownerId: user.userId },
      include: { subscription: true },
    });
    if (!store) return NextResponse.json({ message: "Store not found or access denied." }, { status: 404 });
    const managementBlock = getStoreManagementBlockReason(store);
    if (managementBlock) return NextResponse.json({ message: managementBlock }, { status: 403 });

    const bytes = new Uint8Array(await image.arrayBuffer());
    const validationError = validateProductImage(image, bytes);
    if (validationError) return NextResponse.json({ message: validationError.replace("product images", "store images") }, { status: 400 });

    const upload = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `beautymart/stores/${store.storeId}`, resource_type: "image" },
        (error, result) => error || !result ? reject(error ?? new Error("Image upload returned no result.")) : resolve(result)
      );
      stream.end(Buffer.from(bytes));
    });

    const updatedStore = await prisma.store.update({
      where: { storeId: store.storeId },
      data: imageType === "logo" ? { logoUrl: upload.secure_url } : { bannerUrl: upload.secure_url },
      select: { storeId: true, logoUrl: true, bannerUrl: true },
    });
    return NextResponse.json({ message: `${imageType === "logo" ? "Logo" : "Banner"} uploaded successfully.`, store: updatedStore });
  } catch (error) {
    console.error("Store image upload error:", error);
    return NextResponse.json({ message: "Store image could not be uploaded. Please try again." }, { status: 500 });
  }
}
