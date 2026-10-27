

"use client";

import { useEffect, useState } from "react";
// import AdminSidebar from "./components/AdminSidebar";
// import AdminHeader from "./components/AdminHeader";
import "./admin.css";

type DashboardStats = {
  totalStores: number;
  totalStoreOwners: number;
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalRevenue: number;
};

type RecentOrder = {
  orderId: string;
  orderNumber: string;
  finalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  storeName: string;
  customerName: string;
};

type RecentStore = {
  storeId: string;
  storeName: string;
  address: string | null;
  status: string;
  createdAt: string;
  ownerName: string;
};

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
const [recentStores, setRecentStores] = useState<RecentStore[]>([]);
const [loading, setLoading] = useState(true);
const [activityLoading, setActivityLoading] = useState(true);
const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/admin/dashboard");

        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }

        const data = await response.json();
        setStats(data);
        const activityResponse = await fetch("/api/admin/recent-activity");

if (!activityResponse.ok) {
  throw new Error("Failed to load recent activity");
}

const activityData = await activityResponse.json();

setRecentOrders(activityData.recentOrders);
setRecentStores(activityData.recentStores);
      } catch (error) {
        console.error("Dashboard loading error:", error);
        setError("Unable to load dashboard statistics.");
      } finally {
  setLoading(false);
  setActivityLoading(false);
}
    }

    loadDashboard();
  }, []);

  // return (
  //   <div className="admin-layout">
  //     <AdminSidebar />

  //     <main className="admin-main">
  //       <AdminHeader />

  //       <section className="admin-dashboard-content">
  return (
  <section className="admin-dashboard-content">
          <div className="admin-welcome">
            <div>
              <p className="admin-eyebrow">PLATFORM OVERVIEW</p>

              <h2>Welcome to BeautyMart Admin.</h2>

              <p>
                Manage your marketplace, businesses, customers, orders,
                payments, and platform activity from one place.
              </p>
            </div>

            <div className="admin-welcome-badge">
              <span>●</span>
              Platform Online
            </div>
          </div>

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <span>Total Stores</span>

              <strong>
                {loading ? "—" : stats?.totalStores ?? 0}
              </strong>

              <small>Marketplace businesses</small>
            </div>

            <div className="admin-stat-card">
              <span>Customers</span>

              <strong>
                {loading ? "—" : stats?.totalCustomers ?? 0}
              </strong>

              <small>Registered customers</small>
            </div>

            <div className="admin-stat-card">
              <span>Products</span>

              <strong>
                {loading ? "—" : stats?.totalProducts ?? 0}
              </strong>

              <small>Products listed</small>
            </div>

            <div className="admin-stat-card">
              <span>Orders</span>

              <strong>
                {loading ? "—" : stats?.totalOrders ?? 0}
              </strong>

              <small>Total marketplace orders</small>
            </div>
          </div>

          <div className="admin-overview-grid">
            <div className="admin-overview-card">
              <div className="admin-card-heading">
                <div>
                  <p>ORDERS</p>
                  <h3>Order Overview</h3>
                </div>
              </div>

              <div className="admin-order-list">
                <div>
                  <span>Paid Orders</span>
                  <strong>
                    {loading ? "—" : stats?.paidOrders ?? 0}
                  </strong>
                </div>

                <div>
                  <span>Pending Orders</span>
                  <strong>
                    {loading ? "—" : stats?.pendingOrders ?? 0}
                  </strong>
                </div>

                <div>
                  <span>Total Orders</span>
                  <strong>
                    {loading ? "—" : stats?.totalOrders ?? 0}
                  </strong>
                </div>
              </div>
            </div>

            <div className="admin-overview-card admin-revenue-card">
              <p>PAID REVENUE</p>

              <h3>
                {loading
                  ? "—"
                  : `${(stats?.totalRevenue ?? 0).toLocaleString()} ETB`}
              </h3>

              <span>
                Revenue from successfully paid orders
              </span>
            </div>
          </div>

          <div className="admin-platform-summary">
            <div>
              <p>STORE OWNERS</p>
              <strong>
                {loading ? "—" : stats?.totalStoreOwners ?? 0}
              </strong>
              <span>Businesses managing stores</span>
            </div>

            <div>
              <p>ACTIVE MARKETPLACE</p>
              <strong>
                {loading ? "—" : stats?.totalStores ?? 0}
              </strong>
              <span>Stores currently registered</span>
            </div>

            <div>
              <p>PRODUCT CATALOG</p>
              <strong>
                {loading ? "—" : stats?.totalProducts ?? 0}
              </strong>
              <span>Products across all stores</span>
            </div>
          </div>
          <div className="admin-recent-grid">
  <div className="admin-recent-card">
    <div className="admin-card-heading">
      <div>
        <p>RECENT ACTIVITY</p>
        <h3>Recent Orders</h3>
      </div>
    </div>

    <div className="admin-recent-list">
      {activityLoading ? (
        <div className="admin-empty-state">Loading recent orders...</div>
      ) : recentOrders.length === 0 ? (
        <div className="admin-empty-state">No orders yet.</div>
      ) : (
        recentOrders.map((order) => (
          <div className="admin-recent-order" key={order.orderId}>
            <div className="admin-recent-order-main">
              <strong>#{order.orderNumber}</strong>
              <span>{order.customerName}</span>
            </div>

            <div className="admin-recent-order-middle">
              <strong>{order.finalAmount.toLocaleString()} ETB</strong>
              <span>{order.storeName}</span>
            </div>

            <div className="admin-recent-order-status">
              <span className={`admin-status ${order.paymentStatus.toLowerCase()}`}>
                {order.paymentStatus}
              </span>
              <small>{order.orderStatus}</small>
            </div>
          </div>
        ))
      )}
    </div>
  </div>

  <div className="admin-recent-card">
    <div className="admin-card-heading">
      <div>
        <p>MARKETPLACE</p>
        <h3>Recent Stores</h3>
      </div>
    </div>

    <div className="admin-recent-list">
      {activityLoading ? (
        <div className="admin-empty-state">Loading recent stores...</div>
      ) : recentStores.length === 0 ? (
        <div className="admin-empty-state">No stores yet.</div>
      ) : (
        recentStores.map((store) => (
          <div className="admin-recent-store" key={store.storeId}>
            <div className="admin-store-avatar">
              {store.storeName.charAt(0).toUpperCase()}
            </div>

            <div className="admin-recent-store-info">
              <strong>{store.storeName}</strong>
              <span>{store.address || "Location not provided"}</span>
              <small>Owner: {store.ownerName}</small>
            </div>

            <span className={`admin-status ${store.status.toLowerCase()}`}>
              {store.status}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
</div>
   </section>
  );
}