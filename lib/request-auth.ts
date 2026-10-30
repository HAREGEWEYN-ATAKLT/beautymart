import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { prisma } from "./prisma";

export type ActiveRequestUser = {
  userId: string;
  role: string;
};

// A JWT proves that a user signed in previously. This helper also checks the
// current database record, so disabled users and changed roles take effect on
// protected API requests without waiting for the old token to expire.
export async function getActiveRequestUser(
  request: NextRequest,
): Promise<ActiveRequestUser | null> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token?.id) return null;

  const user = await prisma.user.findUnique({
    where: { userId: String(token.id) },
    select: { userId: true, role: true, isActive: true },
  });

  if (!user?.isActive) return null;

  return { userId: user.userId, role: user.role };
}
