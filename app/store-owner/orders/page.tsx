"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./orders.css";

type OrderItem = {
  orderItemId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  product: {
    productName: string;
  };
};

type Order = {
  orderId: string;
  orderNumber: string;
  totalAmount: string;
  finalAmount: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  customer: {
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
  };
  address: {
    region: string;
    city: string;
    subCity: string | null;
    woreda: string | null;
    houseNumber: string | null;
  };
  items: OrderItem[];
  payments: {
    provider: string;
    amount: string;
    status: string;
  }[];
  store: {
    storeName: string;
  };
};

export default function StoreOwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch("/api/store-owner/orders");
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load orders.");
          return;
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error("Load orders error:", error);
        setError("Something went wrong while loading orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const pendingOrders = orders.filter(
    (order) => order.orderStatus === "PENDING"
  ).length;

  const confirmedOrders = orders.filter(
    (order) => order.orderStatus === "CONFIRMED"
  ).length;

  const totalOrderValue = orders.reduce(
    (total, order) => total + Number(order.finalAmount),
    0
  );

  return (
    <main className="orders-page">
      <div className="orders-container">
        {/* Top navigation */}
        <div className="orders-topbar">
          <Link href="/store-owner" className="orders-brand">
            <div className="orders-brand-mark">B</div>

            <div>
              <div className="orders-brand-name">BeautyMart</div>
              <div className="orders-brand-subtitle">
                Store Management
              </div>
            </div>
          </Link>

          <Link
            href="/store-owner"
            className="orders-dashboard-link"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Page heading */}
        <section>
          <div className="orders-badge">Store Operations</div>

          <div className="orders-heading-row">
            <div>
              <h1 className="orders-title">Orders</h1>

              <p className="orders-description">
                Manage customer orders, review payment status, and prepare
                purchases for delivery.
              </p>
            </div>

            <div className="orders-count">
              {orders.length} {orders.length === 1 ? "order" : "orders"} found
            </div>
          </div>
        </section>

        {/* Summary cards */}
        {!loading && !error && (
          <section className="orders-summary">
            <div className="orders-summary-card">
              <div className="orders-summary-label">
                Total Orders
              </div>

              <div className="orders-summary-row">
                <div className="orders-summary-value">
                  {orders.length}
                </div>

                <span className="orders-summary-tag">
                  All time
                </span>
              </div>
            </div>

            <div className="orders-summary-card">
              <div className="orders-summary-label">
                Pending Orders
              </div>

              <div className="orders-summary-row">
                <div className="orders-summary-value">
                  {pendingOrders}
                </div>

                <span className="orders-summary-tag warning">
                  Needs attention
                </span>
              </div>
            </div>

            <div className="orders-summary-card">
              <div className="orders-summary-label">
                Order Value
              </div>

              <div className="orders-summary-row">
                <div className="orders-summary-value">
                  {totalOrderValue.toLocaleString()}{" "}
                  <span>ETB</span>
                </div>

                <span className="orders-summary-tag success">
                  Confirmed: {confirmedOrders}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Loading */}
        {loading && (
          <div className="orders-loading">
            <div className="orders-loading-spinner" />

            <p className="orders-state-text">
              Loading your orders...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="orders-error">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <div className="orders-empty-icon">🛍️</div>

            <h2 className="orders-empty-title">
              No orders yet
            </h2>

            <p className="orders-empty-description">
              Customer orders will appear here when shoppers purchase
              products from your store.
            </p>
          </div>
        )}

        {/* Orders */}
        {!loading && !error && orders.length > 0 && (
          <section className="orders-list">
            {orders.map((order) => {
              const payment = order.payments[0];

              return (
                <article
                  key={order.orderId}
                  className="order-card"
                >
                  {/* Order header */}
                  <div className="order-header">
                    <div className="order-header-content">
                      <div className="order-number-area">
                        <div className="order-number-icon">
                          #
                        </div>

                        <div>
                          <div className="order-label">
                            Order number
                          </div>

                          <div className="order-number">
                            {order.orderNumber}
                          </div>

                          <div className="order-date">
                            {new Date(
                              order.createdAt
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="order-statuses">
                        <span className="order-status pending">
                          Order {order.orderStatus}
                        </span>

                        <span className="order-status payment">
                          Payment {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer / delivery / payment */}
                  <div className="order-info">
                    <div className="order-info-section">
                      <div className="order-info-title">
                        Customer
                      </div>

                      <div className="customer-info">
                        <div className="customer-avatar">
                          {order.customer.fullName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <div className="customer-name">
                            {order.customer.fullName}
                          </div>

                          {order.customer.phoneNumber && (
                            <div className="customer-contact">
                              {order.customer.phoneNumber}
                            </div>
                          )}

                          {order.customer.email && (
                            <div className="customer-contact">
                              {order.customer.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="order-info-section">
                      <div className="order-info-title">
                        Delivery Address
                      </div>

                      <div className="delivery-box">
                        <div className="delivery-main">
                          {order.address.city},{" "}
                          {order.address.region}
                        </div>

                        {(order.address.subCity ||
                          order.address.woreda ||
                          order.address.houseNumber) && (
                          <div className="delivery-details">
                            {order.address.subCity
                              ? `${order.address.subCity}, `
                              : ""}
                            {order.address.woreda
                              ? `Woreda ${order.address.woreda}, `
                              : ""}
                            {order.address.houseNumber
                              ? `House ${order.address.houseNumber}`
                              : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="order-info">
                    <div className="order-info-section">
                      <div className="order-info-title">
                        Payment
                      </div>

                      {payment ? (
                        <div className="payment-box">
                          <div className="payment-row">
                            <span className="payment-label">
                              Method
                            </span>

                            <span className="payment-value">
                              {payment.provider}
                            </span>
                          </div>

                          <div className="payment-row">
                            <span className="payment-label">
                              Amount
                            </span>

                            <span className="payment-value">
                              {payment.amount} ETB
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="orders-state-text">
                          No payment record available.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Products */}
                  <div className="order-products">
                    <div className="order-products-heading">
                      <div className="order-info-title">
                        Order Items
                      </div>

                      <div className="order-products-count">
                        {order.items.length}{" "}
                        {order.items.length === 1
                          ? "product"
                          : "products"}
                      </div>
                    </div>

                    {order.items.map((item) => (
                      <div
                        key={item.orderItemId}
                        className="order-item"
                      >
                        <div className="order-item-left">
                          <div className="order-item-quantity">
                            {item.quantity}
                          </div>

                          <div>
                            <div className="order-item-name">
                              {item.product.productName}
                            </div>

                            <div className="order-item-price">
                              {item.quantity} × {item.unitPrice} ETB
                            </div>
                          </div>
                        </div>

                        <div className="order-item-total">
                          {item.totalPrice} ETB
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="order-footer">
                    <div>
                      <div className="order-total-label">
                        Order Total
                      </div>

                      <div className="order-total">
                        {order.finalAmount}{" "}
                        <span>ETB</span>
                      </div>
                    </div>

                    <Link
  href={`/store-owner/orders/${order.orderId}`}
  className="manage-order-button"
>
  Manage Order →
</Link>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}