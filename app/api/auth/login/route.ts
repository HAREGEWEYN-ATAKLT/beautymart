import { prisma } from "../../../../lib/prisma";
import argon2 from "argon2";
import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail } from "../../../../lib/account-validation";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 400 });
    }
    const input = body as Record<string, unknown>;

    const email = normalizeEmail(input.email);
    const password = input.password;

    if (!isValidEmail(email) || typeof password !== "string" || password.length > 1024) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!user.isActive) return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });

    const passwordValid = await argon2.verify(
      user.passwordHash,
      password
    );

    if (!passwordValid) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: "Login successful.",
        user: {
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login failed.");

    return NextResponse.json(
      { message: "Something went wrong while logging in." },
      { status: 500 }
    );
  }
}
