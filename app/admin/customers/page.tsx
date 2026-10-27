
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "../admin.css";

type Customer = {
  customerId: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt: string;
  statistics: {
    totalOrders: number;
    totalAddresses: number;
    totalSpent: number;
  };
};

type CustomerResponse = {
  statistics: {
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    totalOrders: number;
    totalRevenue: number;
  };
  customers: Customer[];
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statistics, setStatistics] =
    useState<CustomerResponse["statistics"]>({
      totalCustomers: 0,
      activeCustomers: 0,
      inactiveCustomers: 0,
      totalOrders: 0,
      totalRevenue: 0,
    });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [updatingCustomerId, setUpdatingCustomerId] =
    useState<string | null>(null);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetch("/api/admin/customers");

        if (!response.ok) {
          throw new Error("Failed to load customers");
        }

        const data: CustomerResponse = await response.json();

        setCustomers(data.customers);
        setStatistics(data.statistics);
      } catch (error) {
        console.error("Customers loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const handleStatusChange = async (customer: Customer) => {
    if (updatingCustomerId) return;

    const newStatus = !customer.isActive;

    try {
      setUpdatingCustomerId(customer.customerId);

      const response = await fetch(
        `/api/admin/customers/${customer.userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update customer status"
        );
      }

      setCustomers((currentCustomers) =>
        currentCustomers.map((currentCustomer) =>
          currentCustomer.customerId === customer.customerId
            ? {
                ...currentCustomer,
                isActive: newStatus,
              }
            : currentCustomer
        )
      );

      setStatistics((currentStatistics) => ({
        ...currentStatistics,
        activeCustomers:
          currentStatistics.activeCustomers +
          (newStatus ? 1 : -1),
        inactiveCustomers:
          currentStatistics.inactiveCustomers +
          (newStatus ? -1 : 1),
      }));
    } catch (error) {
      console.error("Customer status update error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update customer status."
      );
    } finally {
      setUpdatingCustomerId(null);
    }
  };

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    return customers.filter((customer) => {
      const matchesSearch =
        !normalizedSearch ||
        customer.fullName
          .toLowerCase()
          .includes(normalizedSearch) ||
        customer.email
          .toLowerCase()
          .includes(normalizedSearch) ||
        customer.phoneNumber
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && customer.isActive) ||
        (statusFilter === "INACTIVE" && !customer.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ETB`;
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="admin-loading-spinner" />
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            MARKETPLACE
          </span>

        

          <p>
            Manage BeautyMart customers and view their
            shopping activity.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="admin-customer-stat-grid">
        <div className="admin-customer-stat-card">
          <div className="admin-customer-stat-icon">C</div>

          <div>
            <span>Total Customers</span>
            <strong>{statistics.totalCustomers}</strong>
            <small>Registered customers</small>
          </div>
        </div>

        <div className="admin-customer-stat-card">
          <div className="admin-customer-stat-icon active">
            ✓
          </div>

          <div>
            <span>Active</span>
            <strong>{statistics.activeCustomers}</strong>
            <small>Active accounts</small>
          </div>
        </div>

        <div className="admin-customer-stat-card">
          <div className="admin-customer-stat-icon inactive">
            !
          </div>

          <div>
            <span>Inactive</span>
            <strong>{statistics.inactiveCustomers}</strong>
            <small>Inactive accounts</small>
          </div>
        </div>

        <div className="admin-customer-stat-card">
          <div className="admin-customer-stat-icon orders">
            O
          </div>

          <div>
            <span>Total Orders</span>
            <strong>{statistics.totalOrders}</strong>
            <small>Orders placed</small>
          </div>
        </div>

        <div className="admin-customer-stat-card">
          <div className="admin-customer-stat-icon revenue">
            ET
          </div>

          <div>
            <span>Total Revenue</span>
            <strong>
              {formatCurrency(statistics.totalRevenue)}
            </strong>
            <small>Paid orders</small>
          </div>
        </div>
      </div>

      {/* Customers Card */}
      <div className="admin-customers-card">
        <div className="admin-customers-card-header">
          <div>
            <h2>All Customers</h2>

            <p>
              {filteredCustomers.length} customer
              {filteredCustomers.length !== 1 ? "s" : ""}{" "}
              shown
            </p>
          </div>

          <div className="admin-customers-actions">
            <div className="admin-customer-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              className="admin-customer-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="admin-customers-table-wrapper">
          <table className="admin-customers-table">
<thead>
  <tr>
    <th>CUSTOMER</th>
    <th>CONTACT</th>
    <th>ORDERS</th>
    <th>TOTAL SPENT</th>
    <th>REGISTERED</th>
    <th>STATUS</th>
    <th>ACTION</th>
  </tr>
</thead>

            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-customers-empty">
                      <div>⌕</div>

                      <h3>No customers found</h3>

                      <p>
                        Try changing your search or status
                        filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const isUpdating =
                    updatingCustomerId ===
                    customer.customerId;

                  return (
                    <tr key={customer.customerId}>
                      <td>
                        <Link
                          href={`/admin/customers/${customer.userId}`}
                          className="admin-customer-name-link"
                        >
                          <div className="admin-customer-profile">
                            <div className="admin-customer-avatar">
                              {customer.fullName
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {customer.fullName}
                              </strong>

                              <span>
                                {customer.email}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </td>

                      <td>
                        <div className="admin-customer-contact">
                          <span>
                            {customer.phoneNumber ||
                              "No phone"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong className="admin-customer-number">
                          {customer.statistics.totalOrders}
                        </strong>
                      </td>

                      <td>
                        <strong className="admin-customer-spent">
                          {formatCurrency(
                            customer.statistics.totalSpent
                          )}
                        </strong>
                      </td>

                      <td>
                        <span className="admin-customer-date">
                          {formatDate(customer.createdAt)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-customer-status ${
                            customer.isActive
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          <span className="admin-customer-status-dot" />

                          {customer.isActive
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`admin-customer-action-button ${
                            customer.isActive
                              ? "deactivate"
                              : "activate"
                          }`}
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusChange(customer)
                          }
                        >
                          {isUpdating
                            ? "Updating..."
                            : customer.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}