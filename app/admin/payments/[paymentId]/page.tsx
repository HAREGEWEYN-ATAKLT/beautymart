
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Payment = {
  paymentId: string;
  orderId: string;
  storeId: string;
  provider: string;
  transactionReference: string | null;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paidAt: string | null;
  createdAt: string;
  order: {
    orderId: string;
    orderNumber: string;
    orderStatus: string;
    paymentStatus: string;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    createdAt: string;
    customer: {
      customerId: string;
      fullName: string;
      email: string | null;
      phoneNumber: string | null;
    };
  };
  store: {
    storeId: string;
    storeName: string;
    owner: {
      fullName: string;
      email: string;
    };
  };
};

function formatMoney(amount: number) {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
}

function formatDate(date: string | null) {
  if (!date) return "Not available";

  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status: string) {
  switch (status) {
    case "PAID":
      return "admin-payment-detail-status paid";
    case "FAILED":
      return "admin-payment-detail-status failed";
    case "REFUNDED":
      return "admin-payment-detail-status refunded";
    default:
      return "admin-payment-detail-status pending";
  }
}

export default function AdminPaymentDetailPage() {
  const params = useParams<{ paymentId: string }>();
  const paymentId = params.paymentId;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPayment() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/payments/${encodeURIComponent(paymentId)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load payment.");
        }

        setPayment(data.payment);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading this payment."
        );
      } finally {
        setLoading(false);
      }
    }

    if (paymentId) loadPayment();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="admin-payment-detail-page">
        <div className="admin-payment-detail-state">
          <div className="admin-payment-detail-spinner" />
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="admin-payment-detail-page">
        <Link href="/admin/payments" className="admin-payment-detail-back">
          ← Back to Payments
        </Link>
        <div className="admin-payment-detail-error">
          <h2>Unable to load payment</h2>
          <p>{error || "Payment not found."}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="admin-payment-detail-button"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-payment-detail-page">
      <Link href="/admin/payments" className="admin-payment-detail-back">
        ← Back to Payments
      </Link>

      <div className="admin-payment-detail-heading">
        <div>
          <p className="admin-payment-detail-eyebrow">
            FINANCIAL MANAGEMENT / MARKETPLACE PAYMENTS
          </p>
          <h1>Payment Details</h1>
          <p className="admin-payment-detail-subtitle">
            Review the transaction, customer, store, and associated order.
          </p>
        </div>

        <span className="admin-payment-detail-readonly">
          <span>●</span> Read-only
        </span>
      </div>

      <section className="admin-payment-detail-hero">
        <div>
          <p className="admin-payment-detail-muted">Payment amount</p>
          <h2>{formatMoney(payment.amount)}</h2>
      <p className="admin-payment-detail-reference">
  Ref: {payment.transactionReference || "Not available"}
</p>
        </div>

        <div className={statusClass(payment.status)}>
          {payment.status}
        </div>
      </section>

      <div className="admin-payment-detail-grid">
        <section className="admin-payment-detail-card">
          <div className="admin-payment-detail-card-heading">
            <span className="admin-payment-detail-icon">▤</span>
            <div>
              <h2>Payment information</h2>
              <p>Transaction details recorded by BeautyMart.</p>
            </div>
          </div>

          <div className="admin-payment-detail-rows">
            <DetailRow label="Payment ID" value={payment.paymentId} />
            <DetailRow label="Provider" value={payment.provider} />
            <DetailRow
              label="Transaction reference"
              value={payment.transactionReference || "Not available"}
            />
            <DetailRow label="Created at" value={formatDate(payment.createdAt)} />
            <DetailRow label="Paid at" value={formatDate(payment.paidAt)} />
            <DetailRow label="Payment status" value={payment.status} />
          </div>
        </section>

        <section className="admin-payment-detail-card">
          <div className="admin-payment-detail-card-heading">
            <span className="admin-payment-detail-icon">□</span>
            <div>
              <h2>Order information</h2>
              <p>Order associated with this payment.</p>
            </div>
          </div>

          <div className="admin-payment-detail-rows">
            <DetailRow
              label="Order number"
              value={payment.order.orderNumber}
            />
            <DetailRow
              label="Order status"
              value={payment.order.orderStatus}
            />
            <DetailRow
              label="Order payment status"
              value={payment.order.paymentStatus}
            />
            <DetailRow
              label="Order created"
              value={formatDate(payment.order.createdAt)}
            />
            <DetailRow
              label="Subtotal / total before discount"
              value={formatMoney(payment.order.totalAmount)}
            />
            <DetailRow
              label="Discount"
              value={formatMoney(payment.order.discountAmount)}
            />
            <DetailRow
              label="Final order amount"
              value={formatMoney(payment.order.finalAmount)}
            />
          </div>

          <Link
            href={`/admin/orders/${payment.orderId}`}
            className="admin-payment-detail-order-link"
          >
            View Order Details →
          </Link>
        </section>

        <section className="admin-payment-detail-card">
          <div className="admin-payment-detail-card-heading">
            <span className="admin-payment-detail-icon">♙</span>
            <div>
              <h2>Customer information</h2>
              <p>Customer associated with the order.</p>
            </div>
          </div>

          <div className="admin-payment-detail-rows">
            <DetailRow
              label="Customer name"
              value={payment.order.customer.fullName}
            />
            <DetailRow
              label="Email"
              value={payment.order.customer.email || "Not provided"}
            />
            <DetailRow
              label="Phone"
              value={payment.order.customer.phoneNumber || "Not provided"}
            />
            <DetailRow
              label="Customer ID"
              value={payment.order.customer.customerId}
            />
          </div>
        </section>

        <section className="admin-payment-detail-card">
          <div className="admin-payment-detail-card-heading">
            <span className="admin-payment-detail-icon">⌂</span>
            <div>
              <h2>Store information</h2>
              <p>Store receiving the customer's payment.</p>
            </div>
          </div>

          <div className="admin-payment-detail-rows">
            <DetailRow label="Store name" value={payment.store.storeName} />
            <DetailRow
              label="Store owner"
              value={payment.store.owner.fullName}
            />
            <DetailRow
              label="Owner email"
              value={payment.store.owner.email || "Not provided"}
            />
            <DetailRow label="Store ID" value={payment.store.storeId} />
          </div>
        </section>
      </div>

      <div className="admin-payment-detail-notice">
        <strong>Read-only financial record</strong>
        <p>
          This payment is a customer-to-store transaction. Payment status and
          refunds must be handled through the authorized payment workflow,
          not changed manually by the Super Admin.
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="admin-payment-detail-row">
      <span>{label}</span>
      <strong title={value}>{value}</strong>
    </div>
  );
}