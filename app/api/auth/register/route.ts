
import { prisma } from "../../../../lib/prisma";
import argon2 from "argon2";
import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, isValidFullName, isValidPassword, isValidPhone, normalizeEmail } from "../../../../lib/account-validation";
import { clientIp, enforceRateLimit, rateLimitResponse } from "../../../../lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limit = await enforceRateLimit("registration", `ip:${clientIp(request)}`);
    if (!limit.allowed) {
      if (limit.unavailable) return NextResponse.json({ message: "Registration is temporarily unavailable. Please try again later." }, { status: 503 });
      return rateLimitResponse(limit.reset ?? Date.now() + 60_000);
    }
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid registration data." }, { status: 400 });
    }
    const input = body as Record<string, unknown>;

    const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
    const email = normalizeEmail(input.email);
    const phone = typeof input.phone === "string" ? input.phone.trim() : "";
    const password = typeof input.password === "string" ? input.password : "";
    const confirmPassword = typeof input.confirmPassword === "string" ? input.confirmPassword : "";
    const accountType =
      input.accountType === "CUSTOMER" || input.accountType === "STORE_OWNER"
        ? input.accountType
        : null;

    // Require the user to choose a supported account type.
    if (!accountType) {
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

    if (!isValidFullName(fullName)) {
      return NextResponse.json({ message: "Please enter a name between 2 and 100 characters." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ message: "Please enter a valid phone number." }, { status: 400 });
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { message: "Password must be between 8 and 128 characters long." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match." },
        { status: 400 }
      );
    }


    const [existingEmail, existingPhone] = await Promise.all([
      prisma.user.findUnique({ where: { email }, select: { userId: true } }),
      prisma.user.findFirst({ where: { phoneNumber: phone }, select: { userId: true } }),
    ]);

    if (existingEmail || existingPhone) {
      return NextResponse.json(
        { message: "An account already uses this email address or phone number. Please sign in or use different details." },
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
    // The database still enforces uniqueness if two requests arrive together.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { message: "An account already uses this email address or phone number. Please sign in or use different details." },
        { status: 409 }
      );
    }
    console.error("Registration failed.");

    return NextResponse.json(
      { message: "Something went wrong while creating the account." },
      { status: 500 }
    );
  }
}
