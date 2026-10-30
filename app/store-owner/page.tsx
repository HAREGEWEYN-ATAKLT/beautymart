


"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./store-owner.css";
import StoreOwnerNotifications from "./components/StoreOwnerNotifications";
type Subscription = {
  planType: string;
  status: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type Store = {
  storeId: string;
  storeName: string;
  status: string;
  subscription: Subscription | null;
};

type Product = {
  productId: string;
  isActive: boolean;
  inventory: {
    quantity: number;
    minimumStock: number;
  } | null;
};

type Order = {
  orderId: string;
  orderNumber: string;
  finalAmount: string | number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
 customer: {
  customerId: string;
  fullName: string;
  email?: string;
  phoneNumber?: string | null;
};
};

export default function StoreOwnerDashboard() {
    // const chartHeights = [45, 65, 40, 80, 55, 90, 72];
const [ownerName, setOwnerName] = useState("Store Owner");
const [store, setStore] = useState<Store | null>(null);
const [products, setProducts] = useState<Product[]>([]);
const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);
const [loadError, setLoadError] = useState("");
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  /*
  |--------------------------------------------------------------------------
  | Get Store Owner Information
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setLoadError("");

        /*
        |--------------------------------------------------------------
        | Get logged-in user's session
        |--------------------------------------------------------------
        */

        const sessionResponse = await fetch(
          "/api/auth/session"
        );

        const sessionData = await sessionResponse.json();

        if (sessionData?.user?.name) {
          setOwnerName(sessionData.user.name);
        }

        /*
        |--------------------------------------------------------------
        | Get the owner's store
        |--------------------------------------------------------------
        */

        const storesResponse = await fetch("/api/stores");

        const storesData = await storesResponse.json();

        if (
          storesResponse.ok &&
          storesData.stores?.length > 0
        ) {
          const ownerStore = storesData.stores[0];

          setStore(ownerStore);

          /*
          |------------------------------------------------------------
          | Get products belonging to this store
          |------------------------------------------------------------
          */

          const productsResponse = await fetch(
            `/api/products?storeId=${encodeURIComponent(
              ownerStore.storeId
            )}`
          );

          const productsData =
            await productsResponse.json();

          if (
            productsResponse.ok &&
            productsData.products
          ) {
            setProducts(productsData.products);
          }
          /*
|--------------------------------------------------------------
| Get store owner orders
|--------------------------------------------------------------
*/

const ordersResponse = await fetch(
  "/api/store-owner/orders"
);

const ordersData = await ordersResponse.json();

if (
  ordersResponse.ok &&
  ordersData.orders
) {
  setOrders(ordersData.orders);
}
        }
      } catch (cause) {
        setLoadError(cause instanceof Error ? cause.message : "Your dashboard could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Dashboard Calculations
  |--------------------------------------------------------------------------
  */

  const totalProducts = products.length;
const totalOrders = orders.length;
const totalCustomers = new Set(
  orders.map((order) => order.customer.customerId)
).size;
const totalRevenue = orders.filter((order) => order.paymentStatus === "PAID").reduce(
  (total, order) =>
    total + Number(order.finalAmount),
  0
);
const pendingOrders = orders.filter(
  (order) => order.orderStatus === "PENDING"
).length;
  const activeProducts = products.filter(
    (product) => product.isActive
  ).length;
const salesByDay = Array(7).fill(0);

orders.filter((order) => order.paymentStatus === "PAID").forEach((order) => {
  const orderDate = new Date(order.createdAt);
  const today = new Date();

  const differenceInDays = Math.floor(
    (today.getTime() - orderDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (differenceInDays >= 0 && differenceInDays < 7) {
    salesByDay[6 - differenceInDays] += Number(
      order.finalAmount
    );
  }
});

const maxSales = Math.max(...salesByDay, 1);

const chartHeights = salesByDay.map(
  (amount) => (amount / maxSales) * 100
);
  const lowStockProducts = products.filter(
    (product) => {
      const quantity =
        product.inventory?.quantity ?? 0;

      const minimumStock =
        product.inventory?.minimumStock ?? 0;

      return (
        quantity > 0 &&
        quantity <= minimumStock
      );
    }
  ).length;

  /*
  |--------------------------------------------------------------------------
  | Owner Initials
  |--------------------------------------------------------------------------
  */

  const ownerInitials = ownerName
    .trim()
    .split(/\s+/)
    .map((name: string) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="store-dashboard">

      {/* =========================
          TOP NAVBAR
      ========================= */}

      <header className="store-navbar">
        <div className="store-navbar-inner">
<button
  type="button"
  className="mobile-menu-toggle"
  aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
  aria-expanded={mobileMenuOpen}
  aria-controls="store-owner-dashboard-sidebar"
  onClick={() => setMobileMenuOpen((open) => !open)}
>
  <span />
  <span />
  <span />
</button>
          <div className="brand-wrapper">

            <div className="brand-logo">
              B
            </div>

            <div>
              <h1 className="brand-name">
                BeautyMart
              </h1>

              <p className="brand-subtitle">
                Store Management
              </p>
            </div>

          </div>

          <div className="navbar-right">

           <StoreOwnerNotifications />

            <div className="nav-divider" />

            <div className="owner-profile">

              <div className="owner-avatar">
                {ownerInitials}
              </div>

              <div className="owner-info">

                <p className="owner-name">
                  {loading
                    ? "Loading..."
                    : ownerName}
                </p>

                <p className="owner-role">
                  {store?.storeName ||
                    "Store Owner"}
                </p>

              </div>

              <span className="owner-arrow">
                ▾
              </span>

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

  {/* SIDEBAR */}

  <aside
    id="store-owner-dashboard-sidebar"
    className={`dashboard-sidebar${mobileMenuOpen ? " mobile-open" : ""}`}
  >

          <div className="sidebar-inner">

            <p className="sidebar-label">
              Main Menu
            </p>

            <nav className="sidebar-nav">

              <Link
                href="/store-owner"
                className="sidebar-link active"
                 onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sidebar-icon">
                  ▦
                </span>

                Dashboard
              </Link>

              <Link
                href="/store-owner/products"
                className="sidebar-link"
                 onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sidebar-icon">
                  ◇
                </span>

                Products
              </Link>

              
<Link
  href="/store-owner/orders"
  className="sidebar-link"
   onClick={() => setMobileMenuOpen(false)}
>
  <span className="sidebar-icon">
    ▤
  </span>

  Orders
</Link>
             <Link
  href="/store-owner/inventory"
  className="sidebar-link"
   onClick={() => setMobileMenuOpen(false)}
>
  <span className="sidebar-icon">
    ▥
  </span>

  Inventory
</Link>

<Link
  href="/store-owner/categories"
  className="sidebar-link"
   onClick={() => setMobileMenuOpen(false)}
>
  <span className="sidebar-icon">◇</span>
  Categories
</Link>

              <Link
  href="/store-owner/discounts"
  className="sidebar-link"
   onClick={() => setMobileMenuOpen(false)}
>
  <span className="sidebar-icon">
    ◇
  </span>

  Discounts
</Link>

           <Link
  href="/store-owner/analytics"
  className="sidebar-link"
   onClick={() => setMobileMenuOpen(false)}
>
  <span className="sidebar-icon">
    ◫
  </span>

  Analytics
</Link>

            </nav>

            <div className="sidebar-divider" />

            <p className="sidebar-label">
              Store
            </p>

            <nav className="sidebar-nav">
<Link
  href="/store-owner/subscription"
  className="sidebar-link"
   onClick={() => setMobileMenuOpen(false)}
>
  <span className="sidebar-icon">◷</span>
  Subscription
</Link>
             <Link
  href="/store-owner/settings"
  className="sidebar-link"
   onClick={() => setMobileMenuOpen(false)}
>
  <span className="sidebar-icon">
    ⚙
  </span>

  Settings
</Link>

            <Link
  href="/store-owner/help"
  className="sidebar-link"
   onClick={() => setMobileMenuOpen(false)}
>
  <span className="sidebar-icon">
    ?
  </span>

  Help Center
</Link>

            </nav>

            <div className="sidebar-promo">

              <h3>
                Grow your beauty business
              </h3>

              <p>
                Manage your products, orders and
                customers from one place.
              </p>

              <button type="button">
                Learn More
              </button>

            </div>

          </div>

        </aside>

        {/* =========================
            MAIN CONTENT
        ========================= */}

        <main className="dashboard-main">

          <div className="dashboard-container">

            {/* PAGE HEADER */}

            <div className="page-header">

              <div>

                <p className="page-label">
                  {store?.storeName ||
                    "Store Dashboard"}
                </p>

                <h2 className="page-title">
                  Good evening,{" "}
                  {loading
                    ? "Store Owner"
                    : ownerName}{" "}
                  👋
                </h2>

                <p className="page-description">
                  Here&apos;s what&apos;s happening
                  with your{" "}
                  {store?.storeName ||
                    "beauty store"}{" "}
                  today.
                </p>

              </div>

              
{!loading && !store && (
  <Link
    href="/store-owner/create-store"
    className="primary-button"
  >
    + Create Your Store
  </Link>
)}


            </div>

            
            {/* STORE INFORMATION */}

            <section className="dashboard-card store-profile-card">
              <div className="store-profile-header">
                <div>
                  <p className="store-profile-eyebrow">BUSINESS PROFILE</p>
                  <h3 className="card-title">Your Store</h3>
                  <p className="card-description">
                    Your store information and current business status.
                  </p>
                </div>

                {store && (
                  <span
                    className={`store-profile-status store-status-${store.status.toLowerCase()}`}
                  >
                    <span className="store-status-dot" />
                    {store.status.replace(/_/g, " ")}
                  </span>
                )}
              </div>

              {store ? (
                <>
                  <div className="store-profile-identity">
                    <div className="store-profile-avatar">
                      <span>{store.storeName.trim().charAt(0).toUpperCase()}</span>
                    </div>

                    <div className="store-profile-name">
                      <h4>{store.storeName}</h4>
                      <p>BeautyMart store</p>
                    </div>
                  </div>

                  <div className="store-profile-details">
                    <div className="store-profile-detail">
                      <span className="store-profile-detail-icon">👤</span>
                      <div>
                        <span className="store-profile-detail-label">
                          Store owner
                        </span>
                        <p className="store-profile-detail-value">
                          {ownerName}
                        </p>
                      </div>
                    </div>

                    <div className="store-profile-detail">
                      <span className="store-profile-detail-icon">🏪</span>
                      <div>
                        <span className="store-profile-detail-label">
                          Store name
                        </span>
                        <p className="store-profile-detail-value">
                          {store.storeName}
                        </p>
                      </div>
                    </div>

                    <div className="store-profile-detail">
                      <span className="store-profile-detail-icon">✓</span>
                      <div>
                        <span className="store-profile-detail-label">
                          Store status
                        </span>
                        <p className="store-profile-detail-value">
                          {store.status.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="store-profile-footer">
                    <p>Your business information at a glance.</p>
                    <Link
                      href="/store-owner/settings"
                      className="store-profile-manage-link"
                    >
                      Manage store settings <span>→</span>
                    </Link>
                  </div>
                </>
              ) : loadError ? (
                <div className="store-profile-empty" role="alert">
                  <div className="store-profile-empty-icon">!</div>
                  <h4>Dashboard could not be loaded</h4>
                  <p>{loadError}</p>
                  <button type="button" className="primary-button" onClick={() => window.location.reload()}>
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="store-profile-empty">
                  <div className="store-profile-empty-icon">🏪</div>
                  <h4>{loading ? "Loading your store..." : "Let’s set up your store"}</h4>
                  <p>
                    {loading
                      ? "We’re retrieving your business information."
                      : "Create your BeautyMart store to start managing products, orders, and your subscription in one place."}
                  </p>

                  {!loading && (
                    <Link
                      href="/store-owner/create-store"
                      className="primary-button"
                    >
                      + Create Your Store
                    </Link>
                  )}
                </div>
              )}
            </section>


{/* SUBSCRIPTION CARD */}
{store && (
  <section className="dashboard-card subscription-card">
    <div className="subscription-card-header">
      <div className="subscription-heading">
        <div className="subscription-icon">◷</div>

        <div>
          <h3 className="card-title">Your Subscription</h3>
          <p className="card-description">
            Manage your store plan and renewal.
          </p>
        </div>
      </div>

      <span
        className={`subscription-status ${
          store.subscription?.status === "ACTIVE" &&
          store.subscription.isActive &&
          new Date(store.subscription.endDate) > new Date()
            ? "subscription-active"
            : "subscription-inactive"
        }`}
      >
        {store.subscription?.status === "ACTIVE" &&
        store.subscription.isActive &&
        new Date(store.subscription.endDate) > new Date()
          ? "ACTIVE"
          : store.subscription?.status ?? "NO SUBSCRIPTION"}
      </span>
    </div>

    {store.subscription ? (
      <>
        <div className="subscription-details">
          <div>
            <span className="subscription-label">Current plan</span>
            <h4>
              {store.subscription.planType === "TRIAL"
                ? "Free Trial"
                : store.subscription.planType === "STARTER"
                  ? "6-Month Plan"
                  : store.subscription.planType === "STANDARD"
                    ? "1-Year Plan"
                    : store.subscription.planType}
            </h4>
          </div>

          <div>
            <span className="subscription-label">Expires on</span>
            <h4>
              {new Date(
                store.subscription.endDate
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </h4>
          </div>
        </div>

        <div className="subscription-notice">
          <strong>
            {store.subscription.status === "SUSPENDED"
              ? "Your subscription is suspended"
              : store.subscription.status === "CANCELLED"
                ? "Your subscription is cancelled"
                : new Date(store.subscription.endDate) <= new Date()
                  ? "Your subscription has expired"
                  : store.subscription.status === "ACTIVE" &&
                      store.subscription.isActive
                    ? "Your trial is active"
                    : "Your subscription needs attention"}
          </strong>

          <p>
            Review your subscription details and available plans
            before your current subscription ends.
          </p>
        </div>

        <Link
          href="/store-owner/subscription"
          className="subscription-details-link"
        >
          View Subscription Details →
        </Link>
      </>
    ) : (
      <div className="subscription-notice">
        <strong>No subscription found</strong>
        <p>
          Your store does not have a subscription record yet.
          Please contact support.
        </p>
      </div>
    )}
  </section>
)}

            {/* =========================
                STAT CARDS
            ========================= */}

            <div className="stats-grid">

              <div className="stat-card">

                <div className="stat-card-content">

                  <div>

                    <p className="stat-label">
                      Total Orders
                    </p>

                   <h3 className="stat-value">
  {totalOrders}
</h3>

                    {/* <p className="stat-change positive">
                      ↑ 12.5% from last month
                    </p> */}
<p className="stat-change neutral">
  From your real orders
</p>
                  </div>

                  <div className="stat-icon orders">
                    ▤
                  </div>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-card-content">

                  <div>

                    <p className="stat-label">
                      Products
                    </p>

                    <h3 className="stat-value">
                      {totalProducts}
                    </h3>

                    <p className="stat-change neutral">
                      {activeProducts} active
                    </p>

                  </div>

                  <div className="stat-icon products">
                    ◇
                  </div>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-card-content">

                  <div>

                    <p className="stat-label">
                      Customers
                    </p>

                    <h3 className="stat-value">
                       {totalCustomers}
                    </h3>

                    {/* <p className="stat-change positive">
                      ↑ 8.2% this month
                    </p> */}
<p className="stat-change neutral">
  Unique customers
</p>
                  </div>

                  <div className="stat-icon customers">
                    ♡
                  </div>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-card-content">

                  <div>

                    <p className="stat-label">
                      Revenue
                    </p>

                    <h3 className="stat-value">
                      {totalRevenue.toLocaleString()} ETB
                    </h3>

                   <p className="stat-change neutral">
  From your real orders
</p>

                  </div>

                  <div className="stat-icon revenue">
                    ETB
                  </div>

                </div>

              </div>

            </div>

            {/* =========================
                SALES + STORE STATUS
            ========================= */}

            <div className="content-grid">

              {/* SALES OVERVIEW */}

              <div className="dashboard-card card-padding">

                <div className="card-header">

                  <div>

                    <h3 className="card-title">
                      Sales Overview
                    </h3>

                    <p className="card-description">
                      Your store performance over
                      the last 7 days.
                    </p>

                  </div>

                  <select
                    className="period-select"
                    defaultValue="7"
                  >
                    <option value="7">
                      Last 7 days
                    </option>

                    <option value="30">
                      Last 30 days
                    </option>

                    <option value="90">
                      Last 90 days
                    </option>
                  </select>

                </div>

                <div className="chart-wrapper">

                  <div className="chart">

                    {chartHeights.map(
                      (height, index) => (

                        <div
                          className="chart-column"
                          key={index}
                        >

                          <div
                            className="chart-bar"
                            style={{
                              height: `${height}%`,
                            }}
                          />

                        </div>

                      )
                    )}

                  </div>

             <div className="chart-labels">
  {Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));

    return (
      <span key={index}>
        {date.toLocaleDateString("en-US", {
          weekday: "short",
        })}
      </span>
    );
  })}
</div>

                </div>

              </div>

              {/* STORE STATUS */}

              <div className="dashboard-card card-padding">

                <h3 className="card-title">
                  Store Status
                </h3>

                <p className="card-description">
                  Your store overview.
                </p>

                <div className="status-box">

                  <div className="status-row">

                    <span className="status-label">
                      Store status
                    </span>

                    <span className="status-badge">
                      {store?.status ||
                        "Loading..."}
                    </span>

                  </div>

                </div>

                <div className="store-details">

                  <div className="store-detail">

                    <span className="store-detail-label">
                      Products
                    </span>

                    <span className="store-detail-value">
                      {totalProducts}
                    </span>

                  </div>

                  <div className="store-detail">

                    <span className="store-detail-label">
                      Low stock
                    </span>

                    <span className="store-detail-value warning-value">
                      {lowStockProducts}
                    </span>

                  </div>

                  <div className="store-detail">

                    <span className="store-detail-label">
                      Pending orders
                    </span>

                    <span className="store-detail-value accent-value">
                     {pendingOrders}
                    </span>

                  </div>

                </div>

                <Link
                  href="/store-owner/products"
                  className="outline-button"
                >
                  Manage Store
                </Link>

              </div>

            </div>

            {/* =========================
                RECENT ORDERS
            ========================= */}

            <div className="dashboard-card orders-card">

              <div className="orders-header">

                <div>

                  <h3 className="card-title">
                    Recent Orders
                  </h3>

                  <p className="card-description">
                    The latest orders from your
                    customers.
                  </p>

                </div>

                <Link
  href="/store-owner/orders"
  className="orders-link"
>
  View all orders →
</Link>

              </div>

              <div className="table-wrapper">

                <table className="orders-table">

                  <thead>

                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>
  {orders.length === 0 ? (
    <tr>
      <td colSpan={5} className="order-date">
        No orders found.
      </td>
    </tr>
  ) : (
    orders.slice(0, 5).map((order) => (
      <tr key={order.orderId}>
        <td className="order-number">
          #{order.orderNumber}
        </td>

        <td className="customer-name">
 {order.customer.fullName}
</td>

        <td className="order-date">
          {new Date(order.createdAt).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }
          )}
        </td>

        <td className="order-amount">
          {Number(order.finalAmount).toLocaleString()} ETB
        </td>

        <td>
          <span className="order-status">
            {order.orderStatus}
          </span>
        </td>
      </tr>
    ))
  )}
</tbody>

                </table>

              </div>

            </div>

            {/* =========================
                QUICK ACTIONS
            ========================= */}

            <div className="quick-actions">

              <Link
                href="/store-owner/products/add"
                className="quick-action"
              >

                <div className="quick-icon product">
                  +
                </div>

                <h4>
                  Add Product
                </h4>

                <p>
                  Add a new beauty product to
                  your store.
                </p>

              </Link>

       <Link
  href="/store-owner/discounts"
  className="quick-action"
>
  <div className="quick-icon discount">
    %
  </div>

  <h4>
    Create Discount
  </h4>

  <p>
    Create promotions for your customers.
  </p>
</Link>

            <Link
  href="/store-owner/analytics"
  className="quick-action"
>
  <div className="quick-icon analytics">
    ↗
  </div>

  <h4>
    View Analytics
  </h4>

  <p>
    Understand your store performance.
  </p>
</Link>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}
