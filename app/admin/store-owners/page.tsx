"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
// import AdminSidebar from "../components/AdminSidebar";
// import AdminHeader from "../components/AdminHeader";
import "../admin.css";

type StoreOwner = {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt: string;
  storeCount: number;
  productCount: number;
  orderCount: number;
  stores: {
    storeId: string;
    storeName: string;
    status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    productCount: number;
    orderCount: number;
  }[];
};

export default function AdminStoreOwnersPage() {
  const [owners, setOwners] = useState<StoreOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadOwners() {
      try {
        const response = await fetch(
          "/api/admin/store-owners"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load store owners"
          );
        }

        setOwners(data.owners || []);
      } catch (error) {
        console.error(
          "Store owners loading error:",
          error
        );

        setError("Unable to load store owners.");
      } finally {
        setLoading(false);
      }
    }

    loadOwners();
  }, []);

  const filteredOwners = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return owners.filter((owner) => {
      const matchesSearch =
        !searchValue ||
        owner.fullName
          .toLowerCase()
          .includes(searchValue) ||
        owner.email
          .toLowerCase()
          .includes(searchValue) ||
        (owner.phoneNumber || "")
          .toLowerCase()
          .includes(searchValue) ||
        owner.stores.some((store) =>
          store.storeName
            .toLowerCase()
            .includes(searchValue)
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && owner.isActive) ||
        (statusFilter === "INACTIVE" && !owner.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [owners, search, statusFilter]);

  const totalOwners = owners.length;

  const activeOwners = owners.filter(
    (owner) => owner.isActive
  ).length;

  const inactiveOwners = owners.filter(
    (owner) => !owner.isActive
  ).length;

  const totalStores = owners.reduce(
    (total, owner) => total + owner.storeCount,
    0
  );

 return (
  <section className="admin-dashboard-content">
          <div className="admin-page-intro">
            <div>
    <p className="admin-eyebrow">
  MARKETPLACE MANAGEMENT
</p>

<p>
  Manage businesses and accounts registered
  as BeautyMart store owners.
</p>
            </div>

            <Link
              href="/admin"
              className="admin-secondary-button"
            >
              ← Dashboard
            </Link>
          </div>

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          {/* Statistics */}
          <div className="admin-owner-stat-grid">
            <div className="admin-owner-stat-card">
              <span>Total Owners</span>

              <strong>
                {loading ? "—" : totalOwners}
              </strong>

              <small>Registered business owners</small>
            </div>

            <div className="admin-owner-stat-card">
              <span>Active</span>

              <strong>
                {loading ? "—" : activeOwners}
              </strong>

              <small>Active accounts</small>
            </div>

            <div className="admin-owner-stat-card">
              <span>Inactive</span>

              <strong>
                {loading ? "—" : inactiveOwners}
              </strong>

              <small>Inactive accounts</small>
            </div>

            <div className="admin-owner-stat-card">
              <span>Total Stores</span>

              <strong>
                {loading ? "—" : totalStores}
              </strong>

              <small>Owned marketplace stores</small>
            </div>
          </div>

          {/* Toolbar */}
          <div className="admin-store-toolbar">
            <div className="admin-search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search owners, email, phone, store..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="ALL">
                All accounts
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>
            </select>
          </div>

          {/* Owners Table */}
          <div className="admin-store-table-card">
            <div className="admin-store-table-header">
              <div>
                <p>BUSINESS ACCOUNTS</p>

                <h3>All Store Owners</h3>
              </div>

              <span>
                {loading
                  ? "Loading..."
                  : `${filteredOwners.length} ${
                      filteredOwners.length === 1
                        ? "owner"
                        : "owners"
                    }`}
              </span>
            </div>

            {loading ? (
              <div className="admin-store-loading">
                Loading store owners...
              </div>
            ) : filteredOwners.length === 0 ? (
              <div className="admin-store-empty">
                <strong>
                  No store owners found
                </strong>

                <span>
                  Try changing your search or account
                  status filter.
                </span>
              </div>
            ) : (
              <div className="admin-store-table-wrapper">
                <table className="admin-store-table">
                  <thead>
                    <tr>
                      <th>OWNER</th>
                      <th>STORES</th>
                      <th>PRODUCTS</th>
                      <th>ORDERS</th>
                      <th>JOINED</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOwners.map((owner) => (
                      <tr key={owner.userId}>
                        {/* Owner */}
                        <td>
                          <div className="admin-store-name-cell">
                            <div className="admin-store-large-avatar">
                              {owner.fullName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                            <Link
  href={`/admin/store-owners/${owner.userId}`}
  className="admin-owner-name-link"
>
  {owner.fullName}
</Link>

                              <span>
                                {owner.email}
                              </span>

                              {owner.phoneNumber && (
                                <span>
                                  {owner.phoneNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Stores */}
                        <td>
                          <div className="admin-owner-stores">
                            {owner.stores.map(
                              (store) => (
                                <Link
                                  key={store.storeId}
                                  href={`/admin/stores/${store.storeId}`}
                                  className="admin-owner-store-link"
                                >
                                  <span>
                                    {store.storeName}
                                  </span>

                                  <small
                                    className={`admin-status-dot ${store.status.toLowerCase()}`}
                                  >
                                    {store.status}
                                  </small>
                                </Link>
                              )
                            )}
                          </div>
                        </td>

                        {/* Products */}
                        <td>
                          <strong className="admin-number-cell">
                            {owner.productCount}
                          </strong>
                        </td>

                        {/* Orders */}
                        <td>
                          <strong className="admin-number-cell">
                            {owner.orderCount}
                          </strong>
                        </td>

                        {/* Joined */}
                        <td>
                          <span className="admin-location-cell">
                            {new Date(
                              owner.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`admin-status ${
                              owner.isActive
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {owner.isActive
                              ? "ACTIVE"
                              : "INACTIVE"}
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