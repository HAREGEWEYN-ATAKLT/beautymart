
import { prisma } from "../../../../lib/prisma";
import argon2 from "argon2";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");
    const accountType = body.accountType;

    // Require the user to choose a supported account type.
    if (!["CUSTOMER", "STORE_OWNER"].includes(accountType)) {
      return NextResponse.json(
        { message: "Please choose Customer or Business Owner." },
        { status: 400 }
      );
    }

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match." },
        { status: 400 }
      );
    }


const existingEmail = await prisma.user.findUnique({
  where: { email },
});

if (existingEmail) {
  return NextResponse.json(
    { message: "This email address is already registered. Please sign in instead." },
    { status: 409 }
  );
}

const existingPhone = await prisma.user.findFirst({
  where: { phoneNumber: phone },
});

if (existingPhone) {
  return NextResponse.json(
    { message: "This phone number is already registered. Please use another number." },
    { status: 409 }
  );
}

    const passwordHash = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber: phone,
        passwordHash,
        role: accountType,
        ...(accountType === "CUSTOMER"
          ? {
              customer: {
                create: {
                  fullName,
                  email,
                  phoneNumber: phone,
                },
              },
            }
          : {}),
      },
      select: {
        userId: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully. You can now sign in.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { message: "Something went wrong while creating the account." },
      { status: 500 }
    );
  }
}