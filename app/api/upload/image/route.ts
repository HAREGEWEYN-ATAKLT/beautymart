import { NextResponse } from "next/server";

// This legacy generic uploader had no authentication, ownership checks, or
// upload limits. Product images must use /api/products/image instead, which
// verifies the store owner and validates the file before using Cloudinary.
export async function POST() {
  return NextResponse.json(
    { message: "Use the authenticated product image upload endpoint." },
    { status: 410 }
  );
}
