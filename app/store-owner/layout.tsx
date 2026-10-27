"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./store-owner.css";
import StoreOwnerNotifications from "./components/StoreOwnerNotifications";
type StoreInfo = {
  storeName: string;
};

const navigation = [
  { href: "/store-owner", label: "Dashboard", icon: "▦" },
  { href: "/store-owner/products", label: "Products", icon: "◇" },
  { href: "/store-owner/orders", label: "Orders", icon: "▤" },
  { href: "/store-owner/inventory", label: "Inventory", icon: "▥" },
  { href: "/store-owner/categories", label: "Categories", icon: "◈" },
  { href: "/store-owner/discounts", label: "Discounts", icon: "◇" },
  { href: "/store-owner/analytics", label: "Analytics", icon: "◫" },
];

const storeNavigation = [
  { href: "/store-owner/subscription", label: "Subscription", icon: "◷" },
  { href: "/store-owner/settings", label: "Settings", icon: "⚙" },
  { href: "/store-owner/help", label: "Help Center", icon: "?" },
];

export default function StoreOwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 const pathname = usePathname();
const [ownerName, setOwnerName] = useState("Store Owner");
const [store, setStore] = useState<StoreInfo | null>(null);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    let cancelled = false;

    async function loadOwnerInfo() {
      try {
        const [sessionResponse, storesResponse] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/stores"),
        ]);

        const sessionData = await sessionResponse.json();
        const storesData = await storesResponse.json();

        if (cancelled) return;

        if (sessionData?.user?.name) {
          setOwnerName(sessionData.user.name);
        }

        if (storesResponse.ok && storesData.stores?.length) {
          setStore(storesData.stores[0]);
        }
      } catch (error) {
        console.error("Failed to load store-owner layout information:", error);
      }
    }

    void loadOwnerInfo();

    return () => {
      cancelled = true;
    };
  }, []);

  // Dashboard already contains its original navbar and sidebar.
  // Leave it untouched to avoid duplicate navigation.
  if (pathname === "/store-owner") {
    return <>{children}</>;
  }

  const ownerInitials = ownerName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  function isActive(href: string) {
    if (href === "/store-owner") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function renderLinks(items: typeof navigation) {
    return items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
className={`sidebar-link${isActive(item.href) ? " active" : ""}`}
aria-current={isActive(item.href) ? "page" : undefined}
onClick={() => setMobileMenuOpen(false)}
      >
        <span className="sidebar-icon" aria-hidden="true">
          {item.icon}
        </span>
        {item.label}
      </Link>
    ));
  }

  return (
    <div className="store-dashboard">
      <header className="store-navbar">
        <div className="store-navbar-inner">
          <button
  type="button"
  className="mobile-menu-toggle"
  aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
  aria-expanded={mobileMenuOpen}
  aria-controls="store-owner-sidebar"
  onClick={() => setMobileMenuOpen((open) => !open)}
>
  <span />
  <span />
  <span />
</button>
          <Link
            href="/store-owner"
            className="brand-wrapper"
            aria-label="BeautyMart Store Dashboard"
          >
            <div className="brand-logo">B</div>
            <div>
              <h1 className="brand-name">BeautyMart</h1>
              <p className="brand-subtitle">Store Management</p>
            </div>
          </Link>

<div className="navbar-right">
  <StoreOwnerNotifications />

  <div className="owner-profile">
    <div className="owner-avatar">{ownerInitials || "SO"}</div>
    <div className="owner-info">
      <p className="owner-name">{ownerName}</p>
      <p className="owner-role">
        {store?.storeName || "Store Owner"}
      </p>
    </div>
  </div>
</div>

        </div>
      </header>

{mobileMenuOpen && (
  <button
    type="button"
    className="mobile-menu-overlay"
    aria-label="Close navigation menu"
    onClick={() => setMobileMenuOpen(false)}
  />
)}

<div className="dashboard-layout">
  <aside
    id="store-owner-sidebar"
    className={`dashboard-sidebar${mobileMenuOpen ? " mobile-open" : ""}`}
  >
          <div className="sidebar-inner">
            <p className="sidebar-label">Main Menu</p>
            <nav className="sidebar-nav" aria-label="Main menu">
              {renderLinks(navigation)}
            </nav>

            <div className="sidebar-divider" />

            <p className="sidebar-label">Store</p>
            <nav className="sidebar-nav" aria-label="Store settings">
              {renderLinks(storeNavigation)}
            </nav>

            <div className="sidebar-promo">
              <h3>Grow your beauty business</h3>
              <p>
                Manage your products, orders and customers from one place.
              </p>
              <Link href="/store-owner/analytics">View Analytics</Link>
            </div>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
