import { prisma } from "../lib/prisma";
import argon2 from "argon2";

async function createAdmin() {
  const email = "admin@beautymart.et";
  const password = "Admin@12345";
  const fullName = "BeautyMart Admin";

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("An account with this email already exists.");
    return;
  }

  const passwordHash = await argon2.hash(password);

  const admin = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log("Super Admin created successfully!");
  console.log("Email:", admin.email);
  console.log("Role:", admin.role);
}

createAdmin()
  .catch((error) => {
    console.error("Failed to create Super Admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });