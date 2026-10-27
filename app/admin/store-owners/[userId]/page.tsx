"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import "../../admin.css";
type Store = {
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
  };
};

type Owner = {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  statistics: {
    totalStores: number;
    totalProducts: number;
    totalOrders: number;
    totalCategories: number;
  };
  stores: Store[];
};

export default function StoreOwnerDetailsPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    const loadOwner = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/store-owners/${userId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load store owner"
          );
        }

        setOwner(data.owner);
      } catch (error) {
        console.error("Store owner details error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load store owner"
        );
      } finally {
        setLoading(false);
      }
    };

    loadOwner();
  }, [userId]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          Loading store owner...
        </div>
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="admin-page">
        <Link
          href="/admin/store-owners"
          className="admin-back-link"
        >
          ← Back to Store Owners
        </Link>

        <div className="admin-details-empty">
          <h2>Unable to load store owner</h2>
          <p>{error || "Store owner not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Back */}
      <Link
        href="/admin/store-owners"
        className="admin-back-link"
      >
        ← Back to Store Owners
      </Link>

      {/* Owner Header */}
      <section className="admin-owner-details-header">
        <div className="admin-owner-details-avatar">
          {owner.fullName.charAt(0).toUpperCase()}
        </div>

        <div className="admin-owner-details-main">
          <div className="admin-store-details-eyebrow">
            STORE OWNER
          </div>

          <h1>{owner.fullName}</h1>

          <div className="admin-store-details-meta">
            <span>{owner.email}</span>

            {owner.phoneNumber && (
              <span>{owner.phoneNumber}</span>
            )}

            <span>
              Joined {new Date(owner.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div
          className={`admin-owner-account-status ${
            owner.isActive ? "active" : "inactive"
          }`}
        >
          <span className="admin-status-dot-icon">●</span>
          {owner.isActive ? "ACTIVE ACCOUNT" : "INACTIVE ACCOUNT"}
        </div>
      </section>

      {/* Statistics */}
      <section className="admin-owner-detail-stat-grid">
        <div className="admin-owner-detail-stat-card">
          <span>STORES</span>
          <strong>{owner.statistics.totalStores}</strong>
          <small>Businesses owned</small>
        </div>

        <div className="admin-owner-detail-stat-card">
          <span>PRODUCTS</span>
          <strong>{owner.statistics.totalProducts}</strong>
          <small>Across all stores</small>
        </div>

        <div className="admin-owner-detail-stat-card">
          <span>ORDERS</span>
          <strong>{owner.statistics.totalOrders}</strong>
          <small>Across all stores</small>
        </div>

        <div className="admin-owner-detail-stat-card">
          <span>CATEGORIES</span>
          <strong>{owner.statistics.totalCategories}</strong>
          <small>Across all stores</small>
        </div>
      </section>

      {/* Owner Information */}
      <section className="admin-details-card">
        <div className="admin-details-card-header">
          <div>
            <span className="admin-store-details-eyebrow">
              ACCOUNT
            </span>
            <h2>Owner Information</h2>
          </div>
        </div>

        <div className="admin-owner-info-grid">
          <div>
            <span>Full Name</span>
            <strong>{owner.fullName}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{owner.email}</strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>
              {owner.phoneNumber || "Not provided"}
            </strong>
          </div>

          <div>
            <span>Account Status</span>
            <strong>
              {owner.isActive ? "Active" : "Inactive"}
            </strong>
          </div>

          <div>
            <span>Registered</span>
            <strong>
              {new Date(owner.createdAt).toLocaleDateString()}
            </strong>
          </div>

          <div>
            <span>Last Updated</span>
            <strong>
              {new Date(owner.updatedAt).toLocaleDateString()}
            </strong>
          </div>
        </div>
      </section>

      {/* Stores */}
      <section className="admin-details-section-card">
        <div className="admin-details-card-header">
          <div>
            <span className="admin-store-details-eyebrow">
              BUSINESS PORTFOLIO
            </span>

            <h2>Stores Owned</h2>
          </div>

          <span className="admin-details-count">
            {owner.stores.length}{" "}
            {owner.stores.length === 1 ? "store" : "stores"}
          </span>
        </div>

        {owner.stores.length === 0 ? (
          <div className="admin-details-empty">
            <h3>No stores yet</h3>
            <p>
              This store owner has not created a store yet.
            </p>
          </div>
        ) : (
          <div className="admin-owner-store-list">
            {owner.stores.map((store) => (
              <div
                key={store.storeId}
                className="admin-owner-store-card"
              >
                <div className="admin-owner-store-card-top">
                  <div className="admin-owner-store-card-title">
                    <div className="admin-owner-store-icon">
                      {store.storeName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <Link
                        href={`/admin/stores/${store.storeId}`}
                        className="admin-owner-detail-store-link"
                      >
                        {store.storeName}
                      </Link>

                      <p>
                        {store.description ||
                          "No description provided"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`admin-owner-store-status ${store.status.toLowerCase()}`}
                  >
                    {store.status}
                  </span>
                </div>

                <div className="admin-owner-store-info">
                  <div>
                    <span>Location</span>
                    <strong>
                      {store.address || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {store.email || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Phone</span>
                    <strong>
                      {store.phone || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Joined</span>
                    <strong>
                      {new Date(
                        store.createdAt
                      ).toLocaleDateString()}
                    </strong>
                  </div>
                </div>

                <div className="admin-owner-store-stats">
                  <div>
                    <strong>
                      {store.statistics.products}
                    </strong>
                    <span>Products</span>
                  </div>

                  <div>
                    <strong>
                      {store.statistics.orders}
                    </strong>
                    <span>Orders</span>
                  </div>

                  <div>
                    <strong>
                      {store.statistics.categories}
                    </strong>
                    <span>Categories</span>
                  </div>

                  <div>
                    <strong>
                      {store.subscription
                        ? store.subscription.planType
                        : "None"}
                    </strong>
                    <span>Subscription</span>
                  </div>
                </div>

                <div className="admin-owner-store-card-footer">
                  <span>
                    Created{" "}
                    {new Date(
                      store.createdAt
                    ).toLocaleDateString()}
                  </span>

                  <Link
                    href={`/admin/stores/${store.storeId}`}
                    className="admin-view-store-link"
                  >
                    View Store Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}