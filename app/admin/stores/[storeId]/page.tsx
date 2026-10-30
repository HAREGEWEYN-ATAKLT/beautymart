"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import "../../admin.css";

type StoreDetails = {
  storeId: string;
  storeName: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;

  owner: {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    isActive: boolean;
    createdAt: string;
  };

  subscription: {
    subscriptionId: string;
    planType: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  } | null;

  statistics: {
    products: number;
    orders: number;
    categories: number;
    totalRevenue: number;
  };

  products: {
    productId: string;
    productName: string;
    price: number;
    isActive: boolean;
    createdAt: string;
    category: {
      categoryName: string;
    } | null;
    inventory: {
      quantity: number;
      minimumStock: number;
    } | null;
  }[];

  orders: {
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
    customer: {
      fullName: string;
      email: string;
    };
  }[];
};

export default function AdminStoreDetailsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [store, setStore] = useState<StoreDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStore() {
      try {
        const response = await fetch(
          `/api/admin/stores/${storeId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load store"
          );
        }

        setStore(data.store);
      } catch (error) {
        console.error("Store details loading error:", error);
        setError("Unable to load store details.");
      } finally {
        setLoading(false);
      }
    }

    if (storeId) {
      loadStore();
    }
  }, [storeId]);

  if (loading) {
    return (
      <section className="admin-dashboard-content">
        <div className="admin-store-loading">Loading store details...</div>
      </section>
    );
  }

  if (error || !store) {
    return (
      <section className="admin-dashboard-content">
        <div className="admin-error">{error || "Store not found."}</div>

        <Link href="/admin/stores" className="admin-secondary-button">
          ← Back to Stores
        </Link>
      </section>
    );
  }

  return (
    <section className="admin-dashboard-content">
          {/* Back */}
          <Link
            href="/admin/stores"
            className="admin-back-link"
          >
            ← Back to Stores
          </Link>

          {/* Store Header */}
          <div className="admin-store-details-header">
            <div className="admin-store-details-main">
              <div className="admin-store-details-avatar">
                {store.storeName.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="admin-store-details-eyebrow">
                  STORE PROFILE
                </div>

                <h2>{store.storeName}</h2>

                <p>
                  {store.description ||
                    "No store description provided."}
                </p>

                <div className="admin-store-details-meta">
                  <span>
                    📍 {store.address || "Location not provided"}
                  </span>

                  <span>
                    ✉ {store.email || "No email"}
                  </span>

                  <span>
                    ☎ {store.phone || "No phone"}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-store-details-status">
              <span
                className={`admin-status ${store.status.toLowerCase()}`}
              >
                {store.status}
              </span>

              <small>
                Joined{" "}
                {new Date(
                  store.createdAt
                ).toLocaleDateString()}
              </small>
            </div>
          </div>

          {/* Statistics */}
          <div className="admin-store-details-stat-grid">
            <div className="admin-store-details-stat-card">
              <span>Products</span>
              <strong>{store.statistics.products}</strong>
              <small>Products listed</small>
            </div>

            <div className="admin-store-details-stat-card">
              <span>Orders</span>
              <strong>{store.statistics.orders}</strong>
              <small>Total orders</small>
            </div>

            <div className="admin-store-details-stat-card">
              <span>Categories</span>
              <strong>{store.statistics.categories}</strong>
              <small>Store categories</small>
            </div>

            <div className="admin-store-details-stat-card">
              <span>Revenue</span>
              <strong>
                {store.statistics.totalRevenue.toLocaleString()} ETB
              </strong>
              <small>Paid orders</small>
            </div>
          </div>

          {/* Owner + Subscription */}
          <div className="admin-store-details-two-column">
            <div className="admin-details-card">
              <div className="admin-details-card-header">
                <div>
                  <p>BUSINESS ACCOUNT</p>
                  <h3>Store Owner</h3>
                </div>
              </div>

              <div className="admin-owner-profile">
                <div className="admin-owner-avatar">
                  {store.owner.fullName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>{store.owner.fullName}</strong>
                  <span>{store.owner.email}</span>

                  {store.owner.phoneNumber && (
                    <span>
                      {store.owner.phoneNumber}
                    </span>
                  )}
                </div>
              </div>

              <div className="admin-details-info-list">
                <div>
                  <span>Account Status</span>

                  <strong>
                    {store.owner.isActive
                      ? "Active"
                      : "Inactive"}
                  </strong>
                </div>

                <div>
                  <span>Joined</span>

                  <strong>
                    {new Date(
                      store.owner.createdAt
                    ).toLocaleDateString()}
                  </strong>
                </div>
              </div>
            </div>

            <div className="admin-details-card">
              <div className="admin-details-card-header">
                <div>
                  <p>BUSINESS PLAN</p>
                  <h3>Subscription</h3>
                </div>
              </div>

              {store.subscription ? (
                <div className="admin-subscription-box">
                  <div>
                    <span>Current Plan</span>
                    <strong>
                      {store.subscription.planType}
                    </strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>
                      {store.subscription.isActive
                        ? "Active"
                        : "Inactive"}
                    </strong>
                  </div>

                  <div>
                    <span>Start Date</span>
                    <strong>
                      {new Date(
                        store.subscription.startDate
                      ).toLocaleDateString()}
                    </strong>
                  </div>

                  <div>
                    <span>End Date</span>
                    <strong>
                      {new Date(
                        store.subscription.endDate
                      ).toLocaleDateString()}
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="admin-details-empty">
                  <strong>No subscription</strong>
                  <span>
                    This store does not currently have
                    a subscription.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Products */}
          <div className="admin-details-card admin-details-section-card">
            <div className="admin-details-card-header">
              <div>
                <p>CATALOG</p>
                <h3>Products</h3>
              </div>

              <span>
                {store.products.length}{" "}
                {store.products.length === 1
                  ? "product"
                  : "products"}
              </span>
            </div>

            {store.products.length === 0 ? (
              <div className="admin-details-empty">
                <strong>No products</strong>
                <span>
                  This store has not added any products yet.
                </span>
              </div>
            ) : (
              <div className="admin-products-table-wrapper">
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>CATEGORY</th>
                      <th>PRICE</th>
                      <th>STOCK</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {store.products.map((product) => {
                      const stock =
                        product.inventory?.quantity ?? 0;

                      return (
                        <tr key={product.productId}>
                          <td>
                            <strong>
                              {product.productName}
                            </strong>
                          </td>

                          <td>
                            {product.category
                              ?.categoryName ||
                              "Uncategorized"}
                          </td>

                          <td>
                            {product.price.toLocaleString()} ETB
                          </td>

                          <td>
                            <strong>
                              {stock}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`admin-status ${
                                product.isActive
                                  ? "active"
                                  : "inactive"
                              }`}
                            >
                              {product.isActive
                                ? "ACTIVE"
                                : "INACTIVE"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Orders */}
          <div className="admin-details-card admin-details-section-card">
            <div className="admin-details-card-header">
              <div>
                <p>COMMERCE</p>
                <h3>Recent Orders</h3>
              </div>

              <span>
                Showing latest {store.orders.length}
              </span>
            </div>

            {store.orders.length === 0 ? (
              <div className="admin-details-empty">
                <strong>No orders yet</strong>
                <span>
                  This store has not received any orders.
                </span>
              </div>
            ) : (
              <div className="admin-products-table-wrapper">
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>ORDER</th>
                      <th>CUSTOMER</th>
                      <th>AMOUNT</th>
                      <th>PAYMENT</th>
                      <th>ORDER STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {store.orders.map((order) => (
                      <tr key={order.orderId}>
                        <td>
                          <strong>
                            {order.orderNumber}
                          </strong>

                          <span className="admin-table-subtext">
                            {new Date(
                              order.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {order.customer.fullName}
                          </strong>

                          <span className="admin-table-subtext">
                            {order.customer.email}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {order.finalAmount.toLocaleString()} ETB
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`admin-status ${order.paymentStatus.toLowerCase()}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`admin-status ${order.orderStatus.toLowerCase()}`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
    </section>
  );
}
