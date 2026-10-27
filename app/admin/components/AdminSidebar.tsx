"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuSections = [
  {
    title: "MAIN",
    items: [
      { label: "Dashboard", href: "/admin", icon: "▦" },
    ],
  },
  {
    title: "MARKETPLACE",
    items: [
      { label: "Stores", href: "/admin/stores", icon: "⌂" },
      { label: "Store Owners", href: "/admin/store-owners", icon: "♙" },
      { label: "Customers", href: "/admin/customers", icon: "♙" },
      { label: "Products", href: "/admin/products", icon: "◇" },
      { label: "Categories", href: "/admin/categories", icon: "◈" },
    ],
  },
  {
    title: "COMMERCE",
    items: [
      { label: "Orders", href: "/admin/orders", icon: "□" },
      { label: "Payments", href: "/admin/payments", icon: "◇" },
    ],
  },
  {
    title: "BUSINESS",
    items: [
      { label: "Subscriptions", href: "/admin/subscriptions", icon: "◫" },
      { label: "Analytics", href: "/admin/analytics", icon: "↗" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Notifications", href: "/admin/notifications", icon: "♢" },
      { label: "Settings", href: "/admin/settings", icon: "⚙" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="admin-mobile-header">
        <button
          className="admin-menu-button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>

        <Link href="/admin" className="admin-mobile-logo">
          Beauty<span>Mart</span>
        </Link>

        <div className="admin-mobile-avatar">A</div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <button
          className="admin-sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside className={`admin-sidebar ${open ? "admin-sidebar-open" : ""}`}>
        <div className="admin-sidebar-brand">
          <Link href="/admin" onClick={() => setOpen(false)}>
            <div className="admin-brand-name">
              Beauty<span>Mart</span>
            </div>
            <div className="admin-brand-label">ADMINISTRATION</div>
          </Link>

          <button
            className="admin-close-button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className="admin-navigation">
          {menuSections.map((section) => (
            <div className="admin-menu-section" key={section.title}>
              <div className="admin-menu-title">{section.title}</div>

              {section.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`admin-menu-item ${
                      active ? "admin-menu-item-active" : ""
                    }`}
                  >
                    <span className="admin-menu-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="admin-user-avatar">A</div>

            <div className="admin-user-info">
              <strong>BeautyMart Admin</strong>
              <span>Super Administrator</span>
            </div>
          </div>

          <Link href="/" className="admin-back-marketplace">
            ← Back to marketplace
          </Link>
        </div>
      </aside>
    </>
  );
}