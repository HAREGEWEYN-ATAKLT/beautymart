"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./orders.css";

type Order = {
  orderId: string;
  orderNumber: string;
  totalAmount: string | number;
  finalAmount: string | number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  store: {
    storeId: string;
    storeName: string;
  };
  items: {
    orderItemId: string;
    quantity: number;
    unitPrice: string | number;
    totalPrice: string | number;
    product: {
      productId: string;
      productName: string;
    };
  }[];
  payments?: {
    paymentId: string;
    provider: string;
    amount: string | number;
    status: string;
    transactionReference: string | null;
    paidAt: string | null;
  }[];
};
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load orders.");
          return;
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error("Load customer orders error:", error);
        setError("Something went wrong while loading your orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <main className="customer-orders-page">
      <div className="customer-orders-container">

        {/* Top Navigation */}
        <div className="customer-orders-topbar">
          <Link href="/products" className="orders-back-link">
            ← Back to Marketplace
          </Link>

          <Link href="/products" className="orders-brand">
            <span className="orders-brand-mark">B</span>

            <div>
              <strong>BeautyMart</strong>
              <span>Marketplace</span>
            </div>
          </Link>
        </div>

        {/* Header */}
        <section className="customer-orders-header">
          <p className="orders-eyebrow">
            CUSTOMER ACCOUNT
          </p>

          <h1>My Orders</h1>

          <p>
            Track your purchases, payment status, and delivery progress.
          </p>
        </section>

        {/* Loading */}
        {loading && (
          <div className="orders-state-card">
            <div className="orders-spinner"></div>
            <h2>Loading your orders...</h2>
            <p>Please wait while we retrieve your order history.</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="orders-state-card orders-error-card">
            <div className="orders-state-icon">!</div>
            <h2>Unable to load your orders</h2>
            <p>{error}</p>

            <Link href="/products" className="orders-primary-button">
              Back to Marketplace
            </Link>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="orders-state-card">
            <div className="orders-state-icon">♡</div>

            <h2>No orders yet</h2>

           <p>
  You haven&apos;t placed an order yet. Discover something beautiful
  from our marketplace.
</p>

            <Link href="/products" className="orders-primary-button">
              Browse Products
              <span>→</span>
            </Link>
          </div>
        )}

        {/* Orders */}
        {!loading && !error && orders.length > 0 && (
          <section className="customer-orders-list">

            <div className="orders-list-header">
              <div>
                <h2>Your Order History</h2>
                <p>
                  {orders.length}{" "}
                  {orders.length === 1 ? "order" : "orders"} found
                </p>
              </div>
            </div>

            {orders.map((order) => (
              <article className="customer-order-card" key={order.orderId}>

                {/* Order Header */}
                <div className="customer-order-header">

                  <div>
                    <p className="customer-order-label">
                      ORDER NUMBER
                    </p>

                    <h2>#{order.orderNumber}</h2>

                    <p className="customer-order-date">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="customer-order-statuses">
                    <span
                      className={`customer-order-status order-${order.orderStatus.toLowerCase()}`}
                    >
                      {order.orderStatus}
                    </span>

                    <span
                      className={`customer-payment-status payment-${order.paymentStatus.toLowerCase()}`}
                    >
                      Payment {order.paymentStatus}
                    </span>
                  </div>

                </div>

                {/* Store */}
                <div className="customer-order-store">
                  <div className="store-icon">B</div>

                  <div>
                    <span>Purchased from</span>
                    <strong>{order.store.storeName}</strong>
                  </div>
                </div>

                {/* Products */}
                <div className="customer-order-products">

                  <div className="order-section-heading">
                    <h3>Products</h3>

                    <span>
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {order.items.map((item) => (
                    <div
                      className="customer-order-item"
                      key={item.orderItemId}
                    >
                      <div className="order-product-icon">
                        B
                      </div>

                      <div className="order-product-details">
                        <h4>{item.product.productName}</h4>

                        <p>
                          {item.quantity} ×{" "}
                          {Number(item.unitPrice).toLocaleString()} ETB
                        </p>
                      </div>

                      <strong>
                        {Number(item.totalPrice).toLocaleString()} ETB
                      </strong>
                    </div>
                  ))}

                </div>

                {/* Bottom */}
                <div className="customer-order-footer">

                  <div className="customer-order-total">
                    <span>Order Total</span>
                    <strong>
                      {Number(order.finalAmount).toLocaleString()} ETB
                    </strong>
                  </div>

                  <div className="customer-order-payment">
                    <span>Payment method</span>

                    <strong>
                      {order.payments?.[0]?.provider || "Not available"}
                    </strong>
                  </div>

                </div>
<div className="customer-order-actions">
  <Link
    href={`/orders/${order.orderId}`}
    className="customer-order-details-button"
  >
    View Order Details
    <span>→</span>
  </Link>
</div>
              </article>
            ))}
          </section>
        )}

      </div>
    </main>
  );
}