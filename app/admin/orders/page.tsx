"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

type Order = {
  orderId: string;
  orderNumber: string;
 customer: {
  fullName: string;
  email: string;
  phoneNumber: string;
};

  store: {
    storeId: string;
    storeName: string;
    status: string;
  };

  totalAmount: number;
  discountAmount: number;
  finalAmount: number;

  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;

  createdAt: string;
  itemCount: number;
};

type Statistics = {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  paidOrders: number;
  pendingPayments: number;
  totalRevenue: number;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function getOrderStatusClass(status: OrderStatus) {
  switch (status) {
    case "DELIVERED":
      return "status-success";

    case "PENDING":
      return "status-warning";

    case "CANCELLED":
      return "status-danger";

    case "CONFIRMED":
    case "PROCESSING":
    case "SHIPPED":
      return "status-info";

    default:
      return "";
  }
}

function getPaymentStatusClass(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "status-success";

    case "PENDING":
      return "status-warning";

    case "FAILED":
    case "REFUNDED":
      return "status-danger";

    default:
      return "";
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [storeFilter, setStoreFilter] = useState("ALL");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/orders");

        if (!response.ok) {
          throw new Error("Failed to load orders");
        }

        const data = await response.json();

        setOrders(data.orders || []);
        setStatistics(data.statistics || null);
      } catch (err) {
        console.error(err);
        setError("Unable to load orders.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  const stores = useMemo(() => {
    return Array.from(
      new Set(orders.map((order) => order.store.storeName))
    ).sort();
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesSearch =
        !searchValue ||
        order.orderNumber.toLowerCase().includes(searchValue) ||
        order.customer.fullName.toLowerCase().includes(searchValue) ||
order.customer.email.toLowerCase().includes(searchValue) ||
order.customer.phoneNumber.toLowerCase().includes(searchValue) ||
        order.store.storeName.toLowerCase().includes(searchValue);

      const matchesOrderStatus =
        orderStatusFilter === "ALL" ||
        order.orderStatus === orderStatusFilter;

      const matchesPaymentStatus =
        paymentStatusFilter === "ALL" ||
        order.paymentStatus === paymentStatusFilter;

      const matchesStore =
        storeFilter === "ALL" ||
        order.store.storeName === storeFilter;

      return (
        matchesSearch &&
        matchesOrderStatus &&
        matchesPaymentStatus &&
        matchesStore
      );
    });
  }, [
    orders,
    search,
    orderStatusFilter,
    paymentStatusFilter,
    storeFilter,
  ]);

  const clearFilters = () => {
    setSearch("");
    setOrderStatusFilter("ALL");
    setPaymentStatusFilter("ALL");
    setStoreFilter("ALL");
  };

  const hasFilters =
    search !== "" ||
    orderStatusFilter !== "ALL" ||
    paymentStatusFilter !== "ALL" ||
    storeFilter !== "ALL";

  return (
    <div className="admin-page">
      {/* PAGE HEADER */}
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">COMMERCE</div>

        

          <p>
            Monitor customer orders and fulfillment activity across
            BeautyMart stores.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="admin-alert admin-alert-danger">
          {error}
        </div>
      )}

      {/* STATISTICS */}
      <div className="admin-stats-grid admin-orders-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Orders</div>
          <div className="admin-stat-value">
            {loading ? "—" : statistics?.totalOrders ?? 0}
          </div>
          <div className="admin-stat-meta">
            All marketplace orders
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">Pending Orders</div>
          <div className="admin-stat-value">
            {loading ? "—" : statistics?.pendingOrders ?? 0}
          </div>
          <div className="admin-stat-meta">
            Waiting for store action
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">Delivered</div>
          <div className="admin-stat-value">
            {loading ? "—" : statistics?.deliveredOrders ?? 0}
          </div>
          <div className="admin-stat-meta">
            Successfully completed
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">Paid Orders</div>
          <div className="admin-stat-value">
            {loading ? "—" : statistics?.paidOrders ?? 0}
          </div>
          <div className="admin-stat-meta">
            Payments completed
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">Pending Payments</div>
          <div className="admin-stat-value">
            {loading ? "—" : statistics?.pendingPayments ?? 0}
          </div>
          <div className="admin-stat-meta">
            Awaiting payment
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">Revenue</div>
          <div className="admin-stat-value">
            {loading
              ? "—"
              : `${formatCurrency(statistics?.totalRevenue ?? 0)} ETB`}
          </div>
          <div className="admin-stat-meta">
            From paid orders
          </div>
        </div>
      </div>

      {/* ORDERS DIRECTORY */}
      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2>Order Directory</h2>

            <p>
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"} shown
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="admin-orders-filters">
          <div className="admin-orders-search">
            <span>⌕</span>

            <input
              type="text"
placeholder="Search order, customer name, email or store..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="admin-orders-filter-select"
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
          >
            <option value="ALL">All Order Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            className="admin-orders-filter-select"
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
          >
            <option value="ALL">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <select
            className="admin-orders-filter-select"
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
          >
            <option value="ALL">All Stores</option>

            {stores.map((store) => (
              <option key={store} value={store}>
                {store}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <div className="admin-orders-filter-summary">
            <span>
              Showing {filteredOrders.length} of {orders.length} orders
            </span>

            <button onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}

        {/* TABLE */}
        <div className="admin-table-card">
          {loading ? (
            <div className="admin-empty-state">
              <div className="admin-loading-spinner"></div>
              <h3>Loading orders...</h3>
              <p>Please wait while we load the marketplace orders.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">◌</div>

              <h3>No orders found</h3>

              <p>
                Try changing your search or filters.
              </p>

              {hasFilters && (
                <button
                  className="admin-secondary-button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="admin-table-wrapper">
<table className="admin-table admin-orders-table">
  <thead>
    <tr>
      <th>Order</th>
      <th>Customer</th>
      <th>Store</th>
      <th>Items</th>
      <th>Amount</th>
      <th>Payment</th>
      <th>Order Status</th>
      <th>Created</th>
    </tr>
  </thead>

  <tbody>
    {filteredOrders.map((order) => (
      <tr key={order.orderId}>
  {/* ORDER */}
<td>
  <Link
    href={`/admin/orders/${order.orderId}`}
    className="admin-order-link"
  >
    <div className="admin-order-number">
      {order.orderNumber}
    </div>

    <div className="admin-order-id">
      ID: {order.orderId.slice(0, 8)}...
    </div>
  </Link>
</td>

        {/* CUSTOMER */}
        <td>
          <div className="admin-customer-name">
            {order.customer.fullName}
          </div>

          <div className="admin-customer-email">
            {order.customer.email}
          </div>

          <div className="admin-customer-phone">
            {order.customer.phoneNumber}
          </div>
        </td>

        {/* STORE */}
        <td>
          <div className="admin-store-name">
            {order.store.storeName}
          </div>

          <div className="admin-store-status">
            <span
              className={`admin-store-dot ${
                order.store.status === "ACTIVE"
                  ? "active"
                  : order.store.status === "INACTIVE"
                  ? "inactive"
                  : "suspended"
              }`}
            ></span>

            {order.store.status}
          </div>
        </td>

        {/* ITEMS */}
        <td>
          <span className="admin-item-count">
            {order.itemCount}
          </span>
        </td>

        {/* AMOUNT */}
        <td>
          <div className="admin-order-amount">
            {formatCurrency(order.finalAmount)} ETB
          </div>

          {order.discountAmount > 0 && (
            <div className="admin-order-discount">
              Discount: {formatCurrency(order.discountAmount)} ETB
            </div>
          )}
        </td>

        {/* PAYMENT */}
        <td>
          <span
            className={`admin-status-badge ${getPaymentStatusClass(
              order.paymentStatus
            )}`}
          >
            <span className="admin-status-dot"></span>
            {order.paymentStatus}
          </span>
        </td>

        {/* ORDER STATUS */}
        <td>
          <span
            className={`admin-status-badge ${getOrderStatusClass(
              order.orderStatus
            )}`}
          >
            <span className="admin-status-dot"></span>
            {order.orderStatus}
          </span>
        </td>

        {/* CREATED */}
        <td>
          <div className="admin-date">
            {formatDate(order.createdAt)}
          </div>
        </td>

        {/* ACTION
        <td>
          <Link
            href={`/admin/orders/${order.orderId}`}
            className="admin-view-link"
          >
            View →
          </Link>
        </td> */}
      </tr>
    ))}
  </tbody>
</table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}