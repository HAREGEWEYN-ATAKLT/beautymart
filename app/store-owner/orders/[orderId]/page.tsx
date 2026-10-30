"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./order-details.css";

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
  discountAmount: string;
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
    paymentId: string;
    provider: string;
    amount: string;
    status: string;
    transactionReference: string | null;
    paidAt: string | null;
  }[];

  store: {
    storeId: string;
    storeName: string;
  };
  cancellationRequest?: { status: "REQUESTED" | "APPROVED" | "REJECTED"; reason: string | null } | null;
};

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [cancellationMessage, setCancellationMessage] = useState("");
  const reviewCancellation = async (decision: "APPROVED" | "REJECTED") => {
    if (!order) return;
    const response = await fetch(`/api/store-owner/orders/${order.orderId}/cancellation-request`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision }) });
    const data = await response.json();
    setCancellationMessage(data.message || "Unable to review cancellation request.");
    if (response.ok) setOrder((current) => current?.cancellationRequest ? { ...current, cancellationRequest: { ...current.cancellationRequest, status: decision } } : current);
  };
  const handleStatusUpdate = async (
  status: "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED"
) => {
  try {
    const orderId = window.location.pathname.split("/").pop();

    if (!orderId) {
      alert("Order ID is missing.");
      return;
    }

    const response = await fetch(
      `/api/store-owner/orders/${orderId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to update order status.");
      return;
    }

    setOrder((currentOrder) => {
      if (!currentOrder) return currentOrder;

      return {
        ...currentOrder,
        orderStatus: data.order.orderStatus,
        paymentStatus: data.order.paymentStatus,
      };
    });

    alert("Order status updated successfully.");
  } catch (error) {
    console.error("Update order status error:", error);
    alert("Something went wrong while updating the order.");
  }
};
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

        const response = await fetch(
          `/api/store-owner/orders/${orderId}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load order.");
          return;
        }

        setOrder(data.order);
      } catch (error) {
        console.error("Load order error:", error);
        setError("Something went wrong while loading the order.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, []);

  if (loading) {
    return (
      <main className="order-details-page">
        <div className="order-details-container">
          <div className="order-details-loading">
            <div className="order-details-spinner" />
            <p>Loading order...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-details-page">
        <div className="order-details-container">
          <Link
            href="/store-owner/orders"
            className="order-details-back"
          >
            ← Back to Orders
          </Link>

          <div className="order-details-error">
            {error || "Order not found."}
          </div>
        </div>
      </main>
    );
  }

  const payment = order.payments[0];

  return (
    <main className="order-details-page">
      <div className="order-details-container">
        {/* Top bar */}
        <div className="order-details-topbar">
          <Link
            href="/store-owner/orders"
            className="order-details-back"
          >
            ← Back to Orders
          </Link>

          <div className="order-details-brand">
            <div className="order-details-brand-mark">B</div>

            <div>
              <div className="order-details-brand-name">
                BeautyMart
              </div>

              <div className="order-details-brand-subtitle">
                Store Management
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <section className="order-details-header">
          <div>
            <div className="order-details-badge">
              Order Management
            </div>

            <h1>
              Order #{order.orderNumber}
            </h1>

            <p>
              Review the customer, delivery, payment, and purchased
              products for this order.
            </p>
          </div>

          <div className="order-details-statuses">
            <span className="order-details-status order-status-main">
              {order.orderStatus}
            </span>

            <span className="order-details-status payment-status-main">
              Payment {order.paymentStatus}
            </span>
          </div>
        </section>

        {/* Main grid */}
        <div className="order-details-grid">
          {/* Left column */}
          <div className="order-details-main">
            {/* Customer */}
            <section className="order-details-card">
              <div className="order-details-card-heading">
                <div>
                  <span className="order-details-eyebrow">
                    Customer
                  </span>

                  <h2>Customer Information</h2>
                </div>
              </div>

              <div className="order-customer-box">
                <div className="order-customer-avatar">
                  {order.customer.fullName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>{order.customer.fullName}</h3>

                  {order.customer.email && (
                    <p>{order.customer.email}</p>
                  )}

                  {order.customer.phoneNumber && (
                    <p>{order.customer.phoneNumber}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Products */}
            <section className="order-details-card">
              <div className="order-details-card-heading">
                <div>
                  <span className="order-details-eyebrow">
                    Purchase
                  </span>

                  <h2>Order Items</h2>
                </div>

                <span className="order-items-count">
                  {order.items.length}{" "}
                  {order.items.length === 1
                    ? "product"
                    : "products"}
                </span>
              </div>

              <div className="order-details-items">
                {order.items.map((item) => (
                  <div
                    key={item.orderItemId}
                    className="order-details-item"
                  >
                    <div className="order-details-item-quantity">
                      {item.quantity}
                    </div>

                    <div className="order-details-item-info">
                      <h3>{item.product.productName}</h3>

                      <p>
                        {item.quantity} × {item.unitPrice} ETB
                      </p>
                    </div>

                    <div className="order-details-item-total">
                      {item.totalPrice} ETB
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-details-total">
                <span>Order Total</span>

                <strong>
                  {order.finalAmount} ETB
                </strong>
              </div>
            </section>

            {/* Delivery */}
            <section className="order-details-card">
              <div className="order-details-card-heading">
                <div>
                  <span className="order-details-eyebrow">
                    Delivery
                  </span>

                  <h2>Delivery Address</h2>
                </div>
              </div>

              <div className="order-address-box">
                <strong>
                  {order.address.city}, {order.address.region}
                </strong>

                {order.address.subCity && (
                  <span>
                    Sub-city: {order.address.subCity}
                  </span>
                )}

                {order.address.woreda && (
                  <span>
                    Woreda: {order.address.woreda}
                  </span>
                )}

                {order.address.houseNumber && (
                  <span>
                    House number: {order.address.houseNumber}
                  </span>
                )}
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="order-details-sidebar">
            {/* Order information */}
            <section className="order-details-card">
              <span className="order-details-eyebrow">
                Overview
              </span>

              <h2>Order Information</h2>

              <div className="order-information-list">
                <div>
                  <span>Order number</span>
                  <strong>{order.orderNumber}</strong>
                </div>

                <div>
                  <span>Store</span>
                  <strong>{order.store.storeName}</strong>
                </div>

                <div>
                  <span>Created</span>
                  <strong>
                    {new Date(order.createdAt).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Subtotal</span>
                  <strong>{order.totalAmount} ETB</strong>
                </div>

                <div>
                  <span>Discount</span>
                  <strong>{order.discountAmount} ETB</strong>
                </div>

                <div>
                  <span>Final amount</span>
                  <strong>{order.finalAmount} ETB</strong>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="order-details-card">
              <span className="order-details-eyebrow">
                Payment
              </span>

              <h2>Payment Information</h2>

              {payment ? (
                <div className="order-information-list">
                  <div>
                    <span>Provider</span>
                    <strong>{payment.provider}</strong>
                  </div>

                  <div>
                    <span>Amount</span>
                    <strong>{payment.amount} ETB</strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>{payment.status}</strong>
                  </div>

                  <div>
                    <span>Reference</span>
                    <strong>
                      {payment.transactionReference || "Not available"}
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="order-details-muted">
                  No payment record available.
                </p>
              )}
            </section>

            {/* Actions */}
            <section className="order-details-card">
              <span className="order-details-eyebrow">
                Actions
              </span>

              <h2>Manage Order</h2>
{order.cancellationRequest?.status === "REQUESTED" && (
  <div className="order-action-buttons">
    <p className="order-details-muted">Cancellation requested{order.cancellationRequest.reason ? `: ${order.cancellationRequest.reason}` : "."}</p>
    <button type="button" onClick={() => reviewCancellation("REJECTED")}>Reject cancellation</button>
    {order.paymentStatus === "FAILED" && order.orderStatus === "PENDING" && <button type="button" className="order-action-secondary" onClick={() => reviewCancellation("APPROVED")}>Approve cancellation and restore stock</button>}
    {order.paymentStatus !== "FAILED" && (
      <>
        <button type="button" className="order-action-secondary" disabled aria-describedby="cancellation-approval-help">
          Approve cancellation and restore stock
        </button>
        <p id="cancellation-approval-help" className="order-details-muted">
          {order.paymentStatus === "PENDING"
            ? "This Chapa payment is still pending. Approval is unavailable until server-side payment verification confirms it failed."
            : "Approval is unavailable because this payment was not confirmed failed. Paid orders need a verified refund process outside this feature."}
        </p>
      </>
    )}
  </div>
)}
{cancellationMessage && <p role="status" className="order-details-muted">{cancellationMessage}</p>}
<div className="order-action-buttons">
  {order.orderStatus === "PENDING" && (
    <button
      type="button"
      onClick={() => handleStatusUpdate("CONFIRMED")}
    >
      Confirm Order
    </button>
  )}

  {order.orderStatus === "CONFIRMED" && (
    <button
      type="button"
      className="order-action-secondary"
      onClick={() => handleStatusUpdate("PROCESSING")}
    >
      Mark as Preparing
    </button>
  )}

  {order.orderStatus === "PROCESSING" && (
    <button
      type="button"
      className="order-action-secondary"
      onClick={() => handleStatusUpdate("DELIVERED")}
    >
      Mark as Delivered
    </button>
  )}

  {order.orderStatus === "DELIVERED" && (
    <p className="order-details-muted">
      This order has been delivered successfully.
    </p>
  )}
</div>

    
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
