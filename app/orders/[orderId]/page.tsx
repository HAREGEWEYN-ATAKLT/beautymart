"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./order-details.css";

type Order = {
  orderId: string;
  orderNumber: string;
  totalAmount: string | number;
  discountAmount: string | number;
  finalAmount: string | number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;

  store: {
    storeId: string;
    storeName: string;
  };

  address: {
    region: string;
    city: string;
    subCity: string | null;
    woreda: string | null;
    houseNumber: string | null;
  };

  items: {
    orderItemId: string;
    quantity: number;
    unitPrice: string | number;
    discountAmount: string | number;
    totalPrice: string | number;

    product: {
      productId: string;
      productName: string;
    };
  }[];

  payments: {
    paymentId: string;
    provider: string;
    amount: string | number;
    status: string;
    transactionReference: string | null;
    paidAt: string | null;
  }[];
};

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderId = window.location.pathname.split("/").pop();

        if (!orderId) {
          setError("Order ID is missing.");
          return;
        }

        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load order.");
          return;
        }

        setOrder(data.order);
      } catch (error) {
        console.error("Load order details error:", error);
        setError("Something went wrong while loading your order.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, []);

  if (loading) {
    return (
      <main className="customer-order-details-page">
        <div className="customer-order-details-container">
          <div className="order-details-state">
            <div className="order-details-spinner"></div>
            <h2>Loading your order...</h2>
            <p>Please wait while we retrieve your order details.</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="customer-order-details-page">
        <div className="customer-order-details-container">
          <div className="order-details-state order-details-error">
            <div className="order-details-state-icon">!</div>

            <h2>Unable to load order</h2>

            <p>{error || "Order not found."}</p>

            <Link
              href="/orders"
              className="order-details-primary-button"
            >
              ← Back to My Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const payment = order.payments[0];

  const addressParts = [
    order.address.houseNumber,
    order.address.woreda,
    order.address.subCity,
    order.address.city,
    order.address.region,
  ].filter(Boolean);

  const statusSteps = [
    {
      key: "CONFIRMED",
      label: "Confirmed",
    },
    {
      key: "PROCESSING",
      label: "Preparing",
    },
    {
      key: "SHIPPED",
      label: "Shipped",
    },
    {
      key: "DELIVERED",
      label: "Delivered",
    },
  ];

  const statusOrder = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ];

  const currentStatusIndex = statusOrder.indexOf(order.orderStatus);

  return (
    <main className="customer-order-details-page">
      <div className="customer-order-details-container">

        {/* Top Navigation */}
        <div className="order-details-topbar">
          <Link href="/orders" className="order-details-back-link">
            ← Back to My Orders
          </Link>

          <Link href="/products" className="order-details-brand">
            <span className="order-details-brand-mark">B</span>

            <div>
              <strong>BeautyMart</strong>
              <span>Marketplace</span>
            </div>
          </Link>
        </div>

        {/* Header */}
        <section className="order-details-header">
          <div>
            <p className="order-details-eyebrow">
              ORDER DETAILS
            </p>

            <h1>Order #{order.orderNumber}</h1>

            <p>
              Placed on{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="order-details-status-group">
            <span
              className={`order-details-status order-${order.orderStatus.toLowerCase()}`}
            >
              {order.orderStatus}
            </span>

            <span
              className={`order-details-payment payment-${order.paymentStatus.toLowerCase()}`}
            >
              Payment {order.paymentStatus}
            </span>
          </div>
        </section>

        {/* Order Progress */}
        <section className="order-progress-card">
          <div className="order-section-title">
            <div>
              <p className="order-details-eyebrow">
                ORDER PROGRESS
              </p>

              <h2>Delivery status</h2>
            </div>
          </div>

          <div className="order-progress">
            {statusSteps.map((step, index) => {
              const stepIndex = index + 1;
              const completed =
                currentStatusIndex >= stepIndex;

              return (
                <div
                  className={`order-progress-step ${
                    completed ? "completed" : ""
                  } ${
                    order.orderStatus === step.key
                      ? "current"
                      : ""
                  }`}
                  key={step.key}
                >
                  <div className="order-progress-dot">
                    {completed ? "✓" : index + 1}
                  </div>

                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Main Grid */}
        <div className="order-details-grid">

          {/* Left */}
          <div className="order-details-main">

            {/* Products */}
            <section className="order-details-card">
              <div className="order-card-heading">
                <div>
                  <p className="order-details-eyebrow">
                    PURCHASE
                  </p>

                  <h2>Products</h2>
                </div>

                <span>
                  {order.items.length}{" "}
                  {order.items.length === 1
                    ? "item"
                    : "items"}
                </span>
              </div>

              <div className="order-detail-products">
                {order.items.map((item) => (
                  <div
                    className="order-detail-product"
                    key={item.orderItemId}
                  >
                    <div className="order-detail-product-icon">
                      B
                    </div>

                    <div className="order-detail-product-info">
                      <h3>{item.product.productName}</h3>

                      <p>
                        {item.quantity} ×{" "}
                        {Number(
                          item.unitPrice
                        ).toLocaleString()}{" "}
                        ETB
                      </p>
                    </div>

                    <strong>
                      {Number(
                        item.totalPrice
                      ).toLocaleString()}{" "}
                      ETB
                    </strong>
                  </div>
                ))}
              </div>
            </section>

            {/* Delivery */}
            <section className="order-details-card">
              <div className="order-card-heading">
                <div>
                  <p className="order-details-eyebrow">
                    DELIVERY
                  </p>

                  <h2>Delivery address</h2>
                </div>
              </div>

              <div className="order-address-box">
                <div className="order-address-icon">
                  ⌖
                </div>

                <div>
                  <strong>Delivery location</strong>

                  <p>
                    {addressParts.join(", ")}
                  </p>
                </div>
              </div>
            </section>

            {/* Store */}
            <section className="order-details-card">
              <div className="order-card-heading">
                <div>
                  <p className="order-details-eyebrow">
                    SELLER
                  </p>

                  <h2>Purchased from</h2>
                </div>
              </div>

              <div className="order-store-box">
                <div className="order-store-icon">
                  B
                </div>

                <div>
                  <strong>{order.store.storeName}</strong>

                  <p>
                    Beauty business on BeautyMart
                  </p>
                </div>

                <Link
                  href={`/stores/${order.store.storeId}`}
                  className="order-store-link"
                >
                  Visit store →
                </Link>
              </div>
            </section>
          </div>

          {/* Right */}
          <aside className="order-details-sidebar">

            {/* Summary */}
            <section className="order-details-card order-summary-card">
              <div className="order-card-heading">
                <div>
                  <p className="order-details-eyebrow">
                    SUMMARY
                  </p>

                  <h2>Order total</h2>
                </div>
              </div>

              <div className="order-summary-lines">
                <div>
                  <span>Subtotal</span>

                  <strong>
                    {Number(
                      order.totalAmount
                    ).toLocaleString()}{" "}
                    ETB
                  </strong>
                </div>

                <div>
                  <span>Discount</span>

                  <strong>
                    {Number(
                      order.discountAmount
                    ).toLocaleString()}{" "}
                    ETB
                  </strong>
                </div>

                <div className="order-summary-total">
                  <span>Total</span>

                  <strong>
                    {Number(
                      order.finalAmount
                    ).toLocaleString()}{" "}
                    ETB
                  </strong>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="order-details-card">
              <div className="order-card-heading">
                <div>
                  <p className="order-details-eyebrow">
                    PAYMENT
                  </p>

                  <h2>Payment information</h2>
                </div>
              </div>

              <div className="order-payment-info">
                <div>
                  <span>Method</span>

                  <strong>
                    {payment?.provider || "Not available"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>

                  <strong>
                    {payment?.status || order.paymentStatus}
                  </strong>
                </div>

                <div>
                  <span>Amount</span>

                  <strong>
                    {Number(
                      payment?.amount || order.finalAmount
                    ).toLocaleString()}{" "}
                    ETB
                  </strong>
                </div>
              </div>

              {order.paymentStatus === "PENDING" && (
                <div className="order-payment-note">
                  Payment is currently pending. Your payment
                  will be updated once the payment provider
                  confirms the transaction.
                </div>
              )}
            </section>

            <Link
              href="/products"
              className="order-details-shop-button"
            >
              Continue shopping
              <span>→</span>
            </Link>

          </aside>
        </div>
      </div>
    </main>
  );
}