import { NextResponse } from "next/server";
import cloudinary from "../../../../lib/cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "No image file was provided." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{
      secure_url: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
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
              reject(new Error("Cloudinary upload failed."));
              return;
            }

            resolve({
              secure_url: result.secure_url,
            });
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      message: "Image uploaded successfully.",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Image upload error:", error);

    return NextResponse.json(
      { message: "Failed to upload image." },
      { status: 500 }
    );
  }
}