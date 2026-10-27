"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
// import AdminSidebar from "../components/AdminSidebar";
// import AdminHeader from "../components/AdminHeader";
import "../admin.css";

type Store = {
  storeId: string;
  storeName: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  owner: {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
  };
  productCount: number;
  orderCount: number;
};

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadStores() {
      try {
        const response = await fetch("/api/admin/stores");

        if (!response.ok) {
          throw new Error("Failed to load stores");
        }

        const data = await response.json();
        setStores(data.stores || []);
      } catch (error) {
        console.error("Stores loading error:", error);
        setError("Unable to load stores.");
      } finally {
        setLoading(false);
      }
    }

    loadStores();
  }, []);

  const filteredStores = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return stores.filter((store) => {
      const matchesSearch =
        !searchValue ||
        store.storeName.toLowerCase().includes(searchValue) ||
        store.owner.fullName.toLowerCase().includes(searchValue) ||
        (store.address || "").toLowerCase().includes(searchValue) ||
        (store.email || "").toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" || store.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stores, search, statusFilter]);

  const totalStores = stores.length;
  const activeStores = stores.filter(
    (store) => store.status === "ACTIVE"
  ).length;
  const inactiveStores = stores.filter(
    (store) => store.status === "INACTIVE"
  ).length;
  const suspendedStores = stores.filter(
    (store) => store.status === "SUSPENDED"
  ).length;

return (
  <section className="admin-dashboard-content">
          <div className="admin-page-intro">
            <div>
              <p className="admin-eyebrow">MARKETPLACE MANAGEMENT</p>
              
              <p>
                View and manage all businesses registered on BeautyMart.
              </p>
            </div>

            <Link href="/admin" className="admin-secondary-button">
              ← Dashboard
            </Link>
          </div>

          {error && <div className="admin-error">{error}</div>}

          <div className="admin-store-stat-grid">
            <div className="admin-store-stat-card">
              <span>Total Stores</span>
              <strong>{loading ? "—" : totalStores}</strong>
              <small>Registered businesses</small>
            </div>

            <div className="admin-store-stat-card">
              <span>Active</span>
              <strong>{loading ? "—" : activeStores}</strong>
              <small>Currently active</small>
            </div>

            <div className="admin-store-stat-card">
              <span>Inactive</span>
              <strong>{loading ? "—" : inactiveStores}</strong>
              <small>Currently inactive</small>
            </div>

            <div className="admin-store-stat-card">
              <span>Suspended</span>
              <strong>{loading ? "—" : suspendedStores}</strong>
              <small>Platform restricted</small>
            </div>
          </div>

          <div className="admin-store-toolbar">
            <div className="admin-search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search stores, owners, email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              className="admin-filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <div className="admin-store-table-card">
            <div className="admin-store-table-header">
              <div>
                <p>REGISTERED BUSINESSES</p>
                <h3>All Stores</h3>
              </div>

              <span>
                {loading
                  ? "Loading..."
                  : `${filteredStores.length} ${
                      filteredStores.length === 1 ? "store" : "stores"
                    }`}
              </span>
            </div>

            {loading ? (
              <div className="admin-store-loading">
                Loading stores...
              </div>
            ) : filteredStores.length === 0 ? (
              <div className="admin-store-empty">
                <strong>No stores found</strong>
                <span>
                  Try changing your search or status filter.
                </span>
              </div>
            ) : (
              <div className="admin-store-table-wrapper">
                <table className="admin-store-table">
                  <thead>
                    <tr>
                      <th>STORE</th>
                      <th>OWNER</th>
                      <th>LOCATION</th>
                      <th>PRODUCTS</th>
                      <th>ORDERS</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStores.map((store) => (
                      <tr key={store.storeId}>
                        <td>
                          <div className="admin-store-name-cell">
                            <div className="admin-store-large-avatar">
                              {store.storeName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <Link
  href={`/admin/stores/${store.storeId}`}
  className="admin-store-name-link"
>
  {store.storeName}
</Link>

<span>
  {store.email || "No email provided"}
</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="admin-owner-cell">
                            <strong>{store.owner.fullName}</strong>
                            <span>{store.owner.email}</span>
                          </div>
                        </td>

                        <td>
                          <span className="admin-location-cell">
                            {store.address || "Not provided"}
                          </span>
                        </td>

                        <td>
                          <strong className="admin-number-cell">
                            {store.productCount}
                          </strong>
                        </td>

                        <td>
                          <strong className="admin-number-cell">
                            {store.orderCount}
                          </strong>
                        </td>

                       <td>
  <select
    className={`admin-status-select ${store.status.toLowerCase()}`}
    value={store.status}
    onChange={async (event) => {
      const newStatus = event.target.value;

      try {
        const response = await fetch(
          `/api/admin/stores/${store.storeId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: newStatus,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update status");
        }

        setStores((currentStores) =>
          currentStores.map((currentStore) =>
            currentStore.storeId === store.storeId
              ? {
                  ...currentStore,
                  status: data.store.status,
                }
              : currentStore
          )
        );
      } catch (error) {
        console.error("Store status update error:", error);
        alert("Failed to update store status.");
      }
    }}
  >
    <option value="ACTIVE">ACTIVE</option>
    <option value="INACTIVE">INACTIVE</option>
    <option value="SUSPENDED">SUSPENDED</option>
  </select>
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