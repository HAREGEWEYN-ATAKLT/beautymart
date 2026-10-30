

import "./admin.css";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../auth";
import { prisma } from "../../lib/prisma";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Do not rely on the role stored in an old browser token. Read the current
  // account record so a deactivated account loses admin-page access straight
  // away, just as it loses access to admin APIs.
  const admin = await prisma.user.findFirst({
    where: {
      userId: session.user.id,
      role: "SUPER_ADMIN",
      isActive: true,
    },
    select: { userId: true },
  });

  if (!admin) {
    redirect("/");
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <div className="admin-main">
        <AdminHeader />

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
