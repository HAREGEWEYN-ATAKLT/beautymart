
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

type PaymentRecord = {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  customer: {
    customerId: string;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
  };
  store: {
    storeId: string;
    storeName: string;
    owner: {
      fullName: string;
      email: string;
    };
  };
  provider: string;
  transactionReference: string | null;
  amount: number;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
};

type PaymentStatistics = {
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalPaidAmount: number;
};

const emptyStatistics: PaymentStatistics = {
  totalPayments: 0,
  paidPayments: 0,
  pendingPayments: 0,
  failedPayments: 0,
  refundedPayments: 0,
  totalPaidAmount: 0,
};

function formatMoney(amount: number) {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
}

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [statistics, setStatistics] =
    useState<PaymentStatistics>(emptyStatistics);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (status) params.set("status", status);
      if (provider) params.set("provider", provider);

      const response = await fetch(
        `/api/admin/payments?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load payments.");
      }

      setPayments(data.payments);
      setStatistics(data.statistics);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load payment records."
      );
    } finally {
      setLoading(false);
    }
  }, [search, status, provider]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  return (
    <div className="admin-payments-page">
      <div className="admin-payments-heading">
        <div>
          <div className="admin-payments-eyebrow">
            FINANCIAL MANAGEMENT
          </div>
          <h1>Marketplace Payments</h1>
          <p>
            Monitor customer payments made to BeautyMart stores.
            Payment records are view-only for Super Admin.
          </p>
        </div>

        <div className="admin-payments-readonly">
          <span className="admin-payments-readonly-dot" />
          Read-only monitoring
        </div>
      </div>

      <div className="admin-payments-notice">
        <span className="admin-payments-notice-icon">ⓘ</span>
        <div>
          <strong>Customer-to-store payments</strong>
          <p>
            Customers pay the store directly. This page does not
            collect payments or allow administrators to change
            payment statuses. Store subscription payments are
            managed separately.
          </p>
        </div>
      </div>

      <div className="admin-payments-stats">
        <div className="admin-payment-stat">
          <div className="admin-payment-stat-top">
            <span>Total records</span>
            <span className="admin-payment-stat-icon">▤</span>
          </div>
          <strong>{statistics.totalPayments}</strong>
          <small>Recorded payment attempts</small>
        </div>

        <div className="admin-payment-stat">
          <div className="admin-payment-stat-top">
            <span>Paid payments</span>
            <span className="admin-payment-stat-icon paid">✓</span>
          </div>
          <strong>{statistics.paidPayments}</strong>
          <small>Successfully recorded as paid</small>
        </div>

        <div className="admin-payment-stat">
          <div className="admin-payment-stat-top">
            <span>Pending payments</span>
            <span className="admin-payment-stat-icon pending">◷</span>
          </div>
          <strong>{statistics.pendingPayments}</strong>
          <small>Awaiting payment confirmation</small>
        </div>

        <div className="admin-payment-stat">
          <div className="admin-payment-stat-top">
            <span>Total paid amount</span>
            <span className="admin-payment-stat-icon revenue">₿</span>
          </div>
          <strong className="admin-payment-stat-money">
            {formatMoney(statistics.totalPaidAmount)}
          </strong>
          <small>Recorded paid payments only</small>
        </div>
      </div>

      <div className="admin-payments-secondary-stats">
        <span>
          Failed: <strong>{statistics.failedPayments}</strong>
        </span>
        <span>
          Refunded: <strong>{statistics.refundedPayments}</strong>
        </span>
      </div>

      <section className="admin-payments-panel">
        <div className="admin-payments-panel-heading">
          <div>
            <h2>Payment transactions</h2>
            <p>Search and review marketplace payment records.</p>
          </div>

          <button
            type="button"
            className="admin-payments-refresh"
            onClick={() => void loadPayments()}
            disabled={loading}
          >
            ↻ {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="admin-payments-filters">
          <div className="admin-payments-search">
            <span>⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer, store or reference..."
              aria-label="Search payments"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by payment status"
          >
            <option value="">All statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            aria-label="Filter by payment provider"
          >
            <option value="">All providers</option>
            <option value="CHAPA">Chapa</option>
            <option value="TELEBIRR">Telebirr</option>
            <option value="SANTIMPAY">SantimPay</option>
            <option value="BANK">Bank</option>
          </select>
        </div>

        {error && (
          <div className="admin-payments-error">
            <span>{error}</span>
            <button type="button" onClick={() => void loadPayments()}>
              Try again
            </button>
          </div>
        )}

        <div className="admin-payments-table-wrapper">
          <table className="admin-payments-table">
            <thead>
              <tr>
                <th>ORDER / DATE</th>
                <th>CUSTOMER</th>
                <th>STORE / OWNER</th>
                <th>PROVIDER</th>
                <th>TRANSACTION REFERENCE</th>
                <th>AMOUNT</th>
                <th>PAYMENT STATUS</th>
                <th>PAID AT</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="admin-payments-empty">
                    <span className="admin-payments-spinner" />
                    Loading payment records...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="admin-payments-empty">
                    Payment records could not be loaded.
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-payments-empty">
                    <span className="admin-payments-empty-icon">▤</span>
                    <strong>No payment records found</strong>
                    <span>Try changing your search or filters.</span>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.paymentId}>
             
<td>
  <Link
    href={`/admin/payments/${payment.paymentId}`}
    className="admin-payment-order-link"
  >
    {payment.orderNumber}
  </Link>
  <div className="admin-payment-muted">
    {formatDate(payment.createdAt)}
  </div>
</td>

                    <td>
                      <strong className="admin-payment-primary-text">
                        {payment.customer.fullName}
                      </strong>
                      <div className="admin-payment-muted">
                        {payment.customer.email || "No email"}
                      </div>
                      <div className="admin-payment-muted">
                        {payment.customer.phoneNumber || "No phone"}
                      </div>
                    </td>

                    <td>
                      <strong className="admin-payment-primary-text">
                        {payment.store.storeName}
                      </strong>
                      <div className="admin-payment-muted">
                        Owner: {payment.store.owner.fullName}
                      </div>
                    </td>

                    <td>
                      <span className="admin-payment-provider">
                        {payment.provider === "SANTIMPAY"
                          ? "SantimPay"
                          : payment.provider.charAt(0) +
                            payment.provider.slice(1).toLowerCase()}
                      </span>
                    </td>

                    <td>
                      <span
                        className="admin-payment-reference"
                        title={payment.transactionReference || ""}
                      >
                        {payment.transactionReference || "Not available"}
                      </span>
                    </td>

                    <td>
                      <strong className="admin-payment-amount">
                        {formatMoney(payment.amount)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`admin-payment-status status-${payment.status.toLowerCase()}`}
                      >
                        <span className="admin-payment-status-dot" />
                        {statusLabel(payment.status)}
                      </span>
                    </td>

                    <td>
                      <span className="admin-payment-paid-date">
                        {formatDate(payment.paidAt)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-payments-table-footer">
          <span>
            Showing {loading ? 0 : payments.length} payment{" "}
            {payments.length === 1 ? "record" : "records"}
            {search || status || provider ? " matching your filters" : ""}
          </span>
          <span>All amounts are in ETB</span>
        </div>
      </section>
    </div>
  );
}