"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import "../../admin.css"
type Address = {
  addressId: string;
  region: string | null;
  city: string | null;
  subCity: string | null;
  woreda: string | null;
  houseNumber: string | null;
  createdAt: string;
};

type OrderItem = {
  orderItemId: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
  product: {
    productId: string;
    productName: string;
  } | null;
};

type Payment = {
  paymentId: string;
  provider: string;
  transactionReference: string;
  amount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
};

type Order = {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;

  store: {
    storeId: string;
    storeName: string;
    status: string;
  } | null;

  address: Address | null;

  items: OrderItem[];

  payments: Payment[];
};

type CustomerDetails = {
  customer: {
    customerId: string;
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    createdAt: string;

    account: {
      role: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };

  statistics: {
    totalOrders: number;
    paidOrders: number;
    totalAddresses: number;
    totalItems: number;
    totalSpent: number;
  };

  addresses: Address[];

  orders: Order[];
};

export default function AdminCustomerDetailsPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [data, setData] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCustomer() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/admin/customers/${userId}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Failed to load customer"
          );
        }

        setData(result);
      } catch (error) {
        console.error(
          "Customer details error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load customer"
        );
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchCustomer();
    }
  }, [userId]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ETB`;
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const formatOrderStatus = (status: string) => {
    return status.replace("_", " ");
  };

  const getAddressText = (address: Address) => {
    const parts = [
      address.houseNumber,
      address.woreda,
      address.subCity,
      address.city,
      address.region,
    ].filter(Boolean);

    return parts.length > 0
      ? parts.join(", ")
      : "Address information not provided";
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-customer-details-loading">
          <div className="admin-customers-spinner" />
          <p>Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="admin-page">
        <Link
          href="/admin/customers"
          className="admin-back-link"
        >
          ← Back to Customers
        </Link>

        <div className="admin-customer-details-error">
          <div className="admin-customer-error-icon">
            !
          </div>

          <h2>Customer not found</h2>

          <p>
            {error ||
              "We could not find this customer."}
          </p>

          <Link
            href="/admin/customers"
            className="admin-customer-error-button"
          >
            Return to Customers
          </Link>
        </div>
      </div>
    );
  }

  const { customer, statistics, addresses, orders } =
    data;

  return (
    <div className="admin-page admin-customer-details-page">
      {/* BACK */}
      <Link
        href="/admin/customers"
        className="admin-back-link"
      >
        ← Back to Customers
      </Link>

      {/* CUSTOMER PROFILE HEADER */}
      <section className="admin-customer-details-hero">
        <div className="admin-customer-details-hero-main">
          <div className="admin-customer-details-avatar">
            {getInitial(customer.fullName)}
          </div>

          <div className="admin-customer-details-identity">
            <span className="admin-customer-details-eyebrow">
              CUSTOMER PROFILE
            </span>

            <h1>{customer.fullName}</h1>

            <div className="admin-customer-details-contact-row">
              <span>{customer.email}</span>

              {customer.phoneNumber && (
                <>
                  <span className="admin-customer-details-divider">
                    •
                  </span>

                  <span>
                    {customer.phoneNumber}
                  </span>
                </>
              )}
            </div>

            <span className="admin-customer-details-member">
              Customer since{" "}
              {formatDate(customer.createdAt)}
            </span>
          </div>
        </div>

        <div
          className={`admin-customer-account-status ${
            customer.account.isActive
              ? "active"
              : "inactive"
          }`}
        >
          <span className="admin-customer-account-dot" />

          {customer.account.isActive
            ? "ACTIVE ACCOUNT"
            : "INACTIVE ACCOUNT"}
        </div>
      </section>

      {/* STATISTICS */}
      <section className="admin-customer-detail-stat-grid">
        <div className="admin-customer-detail-stat-card">
          <div className="admin-customer-detail-stat-label">
            ORDERS
          </div>

          <strong>{statistics.totalOrders}</strong>

          <span>
            {statistics.paidOrders} paid orders
          </span>
        </div>

        <div className="admin-customer-detail-stat-card">
          <div className="admin-customer-detail-stat-label">
            TOTAL SPENT
          </div>

          <strong>
            {formatCurrency(statistics.totalSpent)}
          </strong>

          <span>From paid purchases</span>
        </div>

        <div className="admin-customer-detail-stat-card">
          <div className="admin-customer-detail-stat-label">
            ADDRESSES
          </div>

          <strong>
            {statistics.totalAddresses}
          </strong>

          <span>
            Saved delivery{" "}
            {statistics.totalAddresses === 1
              ? "address"
              : "addresses"}
          </span>
        </div>

        <div className="admin-customer-detail-stat-card">
          <div className="admin-customer-detail-stat-label">
            ITEMS PURCHASED
          </div>

          <strong>
            {statistics.totalItems}
          </strong>

          <span>Total items across orders</span>
        </div>
      </section>

      {/* TWO COLUMN TOP AREA */}
      <div className="admin-customer-details-grid">
        {/* ACCOUNT INFORMATION */}
        <section className="admin-details-card">
          <div className="admin-details-card-header">
            <div>
              <span className="admin-details-card-eyebrow">
                ACCOUNT
              </span>

              <h2>Customer Information</h2>
            </div>
          </div>

          <div className="admin-customer-info-grid">
            <div className="admin-customer-info-item">
              <span>Full Name</span>
              <strong>{customer.fullName}</strong>
            </div>

            <div className="admin-customer-info-item">
              <span>Email</span>
              <strong>{customer.email}</strong>
            </div>

            <div className="admin-customer-info-item">
              <span>Phone</span>
              <strong>
                {customer.phoneNumber ||
                  "Not provided"}
              </strong>
            </div>

            <div className="admin-customer-info-item">
              <span>Account Role</span>
              <strong>{customer.account.role}</strong>
            </div>

            <div className="admin-customer-info-item">
              <span>Account Status</span>

              <strong
                className={
                  customer.account.isActive
                    ? "admin-customer-info-active"
                    : "admin-customer-info-inactive"
                }
              >
                {customer.account.isActive
                  ? "Active"
                  : "Inactive"}
              </strong>
            </div>

            <div className="admin-customer-info-item">
              <span>Registered</span>
              <strong>
                {formatDate(customer.account.createdAt)}
              </strong>
            </div>

            <div className="admin-customer-info-item">
              <span>Last Updated</span>
              <strong>
                {formatDate(
                  customer.account.updatedAt
                )}
              </strong>
            </div>
          </div>
        </section>

        {/* ADDRESSES */}
        <section className="admin-details-card">
          <div className="admin-details-card-header">
            <div>
              <span className="admin-details-card-eyebrow">
                DELIVERY
              </span>

              <h2>Saved Addresses</h2>
            </div>

            <span className="admin-details-card-count">
              {addresses.length}
            </span>
          </div>

          {addresses.length === 0 ? (
            <div className="admin-customer-details-empty">
              <div>⌂</div>
              <p>No saved addresses</p>
            </div>
          ) : (
            <div className="admin-customer-address-list">
              {addresses.map((address, index) => (
                <div
                  key={address.addressId}
                  className="admin-customer-address-card"
                >
                  <div className="admin-customer-address-icon">
                    {index + 1}
                  </div>

                  <div>
                    <span>
                      Address {index + 1}
                    </span>

                    <strong>
                      {getAddressText(address)}
                    </strong>

                    <small>
                      Added{" "}
                      {formatDate(address.createdAt)}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ORDER HISTORY */}
      <section className="admin-details-card admin-customer-orders-card">
        <div className="admin-details-card-header">
          <div>
            <span className="admin-details-card-eyebrow">
              SHOPPING ACTIVITY
            </span>

            <h2>Order History</h2>

            <p>
              Orders placed by this customer across
              BeautyMart stores.
            </p>
          </div>

          <span className="admin-details-card-count">
            {orders.length}
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="admin-customer-details-empty large">
            <div>◌</div>

            <h3>No orders yet</h3>

            <p>
              This customer has not placed any orders.
            </p>
          </div>
        ) : (
          <div className="admin-customer-orders-list">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="admin-customer-order-card"
              >
                {/* ORDER TOP */}
                <div className="admin-customer-order-top">
                  <div>
                    <span className="admin-customer-order-label">
                      ORDER
                    </span>

                    <strong>
                      {order.orderNumber}
                    </strong>

                    <small>
                      {formatDateTime(
                        order.createdAt
                      )}
                    </small>
                  </div>

                  <div className="admin-customer-order-store">
                    <span>STORE</span>

                    <strong>
                      {order.store?.storeName ||
                        "Unknown store"}
                    </strong>
                  </div>

                  <div className="admin-customer-order-amount">
                    <span>TOTAL</span>

                    <strong>
                      {formatCurrency(
                        order.finalAmount
                      )}
                    </strong>
                  </div>
                </div>

                {/* ORDER STATUS */}
                <div className="admin-customer-order-status-row">
                  <div>
                    <span className="admin-customer-order-status-label">
                      Order Status
                    </span>

                    <span
                      className={`admin-customer-order-status ${order.orderStatus.toLowerCase()}`}
                    >
                      {formatOrderStatus(
                        order.orderStatus
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="admin-customer-order-status-label">
                      Payment
                    </span>

                    <span
                      className={`admin-customer-payment-status ${order.paymentStatus.toLowerCase()}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div>
                    <span className="admin-customer-order-status-label">
                      Items
                    </span>

                    <strong>
                      {order.items.reduce(
                        (total, item) =>
                          total + item.quantity,
                        0
                      )}
                    </strong>
                  </div>

                  <div>
                    <span className="admin-customer-order-status-label">
                      Store
                    </span>

                    <strong>
                      {order.store?.status ||
                        "UNKNOWN"}
                    </strong>
                  </div>
                </div>

                {/* PRODUCTS */}
                <div className="admin-customer-order-products">
                  <div className="admin-customer-order-products-title">
                    Products
                  </div>

                  {order.items.map((item) => (
                    <div
                      key={item.orderItemId}
                      className="admin-customer-order-product"
                    >
                      <div className="admin-customer-order-product-icon">
                        {item.product?.productName
                          .charAt(0)
                          .toUpperCase() || "P"}
                      </div>

                      <div className="admin-customer-order-product-info">
                        <strong>
                          {item.product
                            ?.productName ||
                            "Product"}
                        </strong>

                        <span>
                          Qty {item.quantity} ×{" "}
                          {formatCurrency(
                            item.unitPrice
                          )}
                        </span>
                      </div>

                      <strong>
                        {formatCurrency(
                          item.totalPrice
                        )}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* PAYMENT */}
                {order.payments.length > 0 && (
                  <div className="admin-customer-order-payment">
                    <div>
                      <span>Payment Provider</span>
                      <strong>
                        {order.payments[0].provider}
                      </strong>
                    </div>

                    <div>
                      <span>Payment Status</span>
                      <strong>
                        {order.payments[0].status}
                      </strong>
                    </div>

                    <div>
                      <span>Transaction</span>
                      <strong>
                        {
                          order.payments[0]
                            .transactionReference
                        }
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}