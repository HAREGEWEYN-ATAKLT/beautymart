"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import "./account.css";
export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="account-page">
        <div className="account-container">
          <p>Loading your account...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="account-page">
        <div className="account-container">
          <h1>Please log in</h1>
          <p>You need to log in to view your account.</p>

          <Link href="/login" className="account-button">
            Go to Login →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="account-page">
      <div className="account-container">
        <p className="account-eyebrow">BEAUTYMART ACCOUNT</p>

        <h1>My Account</h1>

        <p className="account-intro">
          Manage your BeautyMart account and view your shopping activity.
        </p>

        <section className="account-card">
          <div className="account-avatar">
            {session.user.name?.charAt(0).toUpperCase() || "B"}
          </div>

          <div className="account-info">
            <h2>{session.user.name}</h2>
            <p>{session.user.email}</p>
            <span>{session.user.role}</span>
          </div>
        </section>
<div className="account-actions">
  <Link href="/orders" className="account-action-card">
    <strong>My Orders</strong>
    <span>View your orders and order status →</span>
  </Link>

  <Link href="/products" className="account-action-card">
    <strong>Continue Shopping</strong>
    <span>Browse beauty products →</span>
  </Link>

  {session.user.role === "STORE_OWNER" && (
    <Link href="/store-owner" className="account-action-card">
      <strong>Store Management</strong>
      <span>Manage your store, products, and orders →</span>
    </Link>
  )}
</div>
      </div>
    </main>
  );
}