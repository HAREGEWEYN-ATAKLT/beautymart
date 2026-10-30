
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import "./analytics.css";

type AnalyticsData = {
  generatedAt: string;
  period: { key: string; days: number; startDate: string };
  overview: {
    totalStores: number;
    activeStores: number;
    totalOwners: number;
    totalCustomers: number;
    totalProducts: number;
    totalOrders: number;
    paidOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    periodOrders: number;
    periodPaidOrders: number;
    periodRevenue: number;
    paidSubscriptionRevenue: number;
  };
  subscriptions: { status: string; count: number }[];
  salesTrend: { date: string; orders: number; revenue: number }[];
  recentOrders: {
    orderId: string;
    orderNumber: string;
    amount: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
    storeName: string;
    customerName: string;
  }[];
  topStores: {
    storeId: string;
    storeName: string;
    revenue: number;
    orders: number;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    storeName: string;
    unitsSold: number;
    salesValue: number;
  }[];
};

const money = (amount: number) =>
  `${amount.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })} ETB`;

const dateLabel = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/analytics?period=${period}`,
        { cache: "no-store" }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load analytics.");
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAnalytics(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAnalytics]);

  const overview = data?.overview;
  const maxRevenue = Math.max(
    1,
    ...(data?.salesTrend.map((point) => point.revenue) ?? [])
  );
  const maxOrders = Math.max(
    1,
    ...(data?.salesTrend.map((point) => point.orders) ?? [])
  );

  return (
    <section className="admin-dashboard-content analytics-page">
      <div className="analytics-heading">
        <div>
          <p className="admin-eyebrow">BUSINESS INTELLIGENCE</p>
          <h2>Analytics Overview</h2>
          <p>
            Understand marketplace performance, sales, and business growth
            using your actual BeautyMart records.
          </p>
        </div>

        <div className="analytics-heading-actions">
          <label className="analytics-period-label" htmlFor="analytics-period">
            Reporting period
          </label>
          <select
            id="analytics-period"
            className="analytics-period-select"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="12m">Last 12 months</option>
          </select>
          <button
            type="button"
            className="analytics-refresh-button"
            onClick={() => void loadAnalytics()}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-error analytics-error" role="alert">
          {error}
          <button type="button" onClick={() => void loadAnalytics()}>
            Try again
          </button>
        </div>
      )}

      {loading && !data ? (
        <div className="analytics-loading" aria-live="polite">
          <span className="analytics-spinner" />
          <strong>Loading marketplace analytics…</strong>
          <span>Fetching live data from BeautyMart.</span>
        </div>
      ) : data ? (
        <>
          

          <div className="analytics-metrics-grid">
            <article className="analytics-metric-card analytics-revenue-card">
              <div className="analytics-metric-top">
                <span>Paid order revenue</span>
                <span className="analytics-metric-icon">ETB</span>
              </div>
              <strong>{money(overview?.periodRevenue ?? 0)}</strong>
              <p>{overview?.periodPaidOrders ?? 0} paid orders in this period</p>
            </article>

            <article className="analytics-metric-card">
              <div className="analytics-metric-top">
                <span>Total orders</span>
                <span className="analytics-metric-icon">↗</span>
              </div>
              <strong>{overview?.periodOrders ?? 0}</strong>
              <p>{overview?.totalOrders ?? 0} orders overall</p>
            </article>

            <article className="analytics-metric-card">
              <div className="analytics-metric-top">
                <span>Active stores</span>
                <span className="analytics-metric-icon">⌂</span>
              </div>
              <strong>{overview?.activeStores ?? 0}</strong>
              <p>{overview?.totalStores ?? 0} registered stores</p>
            </article>

            <article className="analytics-metric-card">
              <div className="analytics-metric-top">
                <span>Customers</span>
                <span className="analytics-metric-icon">♙</span>
              </div>
              <strong>{overview?.totalCustomers ?? 0}</strong>
              <p>{overview?.totalOwners ?? 0} registered store owners</p>
            </article>
          </div>

          <div className="analytics-main-grid">
            <section className="analytics-panel analytics-trend-panel">
              <div className="analytics-panel-heading">
                <div>
                  <p>SALES PERFORMANCE</p>
                  <h3>Revenue and order trend</h3>
                </div>
                <span className="analytics-panel-note">
                  {data.period.days} days
                </span>
              </div>

              <div className="analytics-chart-legend">
                <span><i className="legend-revenue" /> Paid revenue</span>
                <span><i className="legend-orders" /> Orders</span>
              </div>

              {data.salesTrend.every(
                (point) => point.orders === 0 && point.revenue === 0
              ) ? (
                <div className="analytics-empty">
                  <strong>No sales activity in this period</strong>
                  <span>Daily activity will appear here when orders are recorded.</span>
                </div>
              ) : (
                <div className="analytics-chart">
                  {data.salesTrend.map((point) => (
                    <div className="analytics-chart-column" key={point.date}>
                      <div className="analytics-chart-bars">
                        <div
                          className="analytics-bar analytics-bar-revenue"
                          style={{
                            height: `${Math.max(
                              point.revenue > 0 ? 3 : 0,
                              (point.revenue / maxRevenue) * 100
                            )}%`,
                          }}
                          title={`${dateLabel(point.date)}: ${money(point.revenue)} paid revenue`}
                        />
                        <div
                          className="analytics-bar analytics-bar-orders"
                          style={{
                            height: `${Math.max(
                              point.orders > 0 ? 3 : 0,
                              (point.orders / maxOrders) * 100
                            )}%`,
                          }}
                          title={`${dateLabel(point.date)}: ${point.orders} orders`}
                        />
                      </div>
                      {(data.salesTrend.length <= 14 ||
                        data.salesTrend.indexOf(point) % 5 === 0 ||
                        data.salesTrend.indexOf(point) ===
                          data.salesTrend.length - 1) && (
                        <span className="analytics-chart-label">
                          {dateLabel(point.date)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="analytics-chart-footnote">
                Revenue includes paid orders only. The order count includes all
                orders created during the selected period.
              </p>
            </section>

            <section className="analytics-panel analytics-breakdown-panel">
              <div className="analytics-panel-heading">
                <div>
                  <p>ORDER HEALTH</p>
                  <h3>Order breakdown</h3>
                </div>
              </div>

              {[
                { label: "Paid", value: overview?.paidOrders ?? 0, tone: "paid" },
                { label: "Pending", value: overview?.pendingOrders ?? 0, tone: "pending" },
                { label: "Cancelled", value: overview?.cancelledOrders ?? 0, tone: "cancelled" },
              ].map((item) => {
                const total = Math.max(overview?.totalOrders ?? 0, 1);
                const percent = Math.round((item.value / total) * 100);

                return (
                  <div className="analytics-breakdown-item" key={item.label}>
                    <div>
                      <span className={`analytics-status-dot ${item.tone}`} />
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                    <div className="analytics-progress-track">
                      <span
                        className={`analytics-progress-fill ${item.tone}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="analytics-breakdown-footer">
                <span>Lifetime paid order revenue</span>
                <strong>{money(overview?.totalRevenue ?? 0)}</strong>
              </div>
            </section>
          </div>

          <div className="analytics-main-grid analytics-lists-grid">
            <section className="analytics-panel">
              <div className="analytics-panel-heading">
                <div>
                  <p>STORE PERFORMANCE</p>
                  <h3>Top stores by revenue</h3>
                </div>
              </div>

              {data.topStores.length === 0 ? (
                <div className="analytics-empty">No paid store sales in this period.</div>
              ) : (
                <div className="analytics-ranking-list">
                  {data.topStores.map((store, index) => (
                    <div className="analytics-ranking-row" key={store.storeId}>
                      <span className="analytics-rank">{index + 1}</span>
                      <div className="analytics-ranking-info">
                        <strong>{store.storeName}</strong>
                        <span>{store.orders} paid orders</span>
                      </div>
                      <strong className="analytics-ranking-value">
                        {money(store.revenue)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="analytics-panel">
              <div className="analytics-panel-heading">
                <div>
                  <p>PRODUCT PERFORMANCE</p>
                  <h3>Top-selling products</h3>
                </div>
              </div>

              {data.topProducts.length === 0 ? (
                <div className="analytics-empty">No paid product sales in this period.</div>
              ) : (
                <div className="analytics-ranking-list">
                  {data.topProducts.map((product, index) => (
                    <div className="analytics-ranking-row" key={product.productId}>
                      <span className="analytics-rank">{index + 1}</span>
                      <div className="analytics-ranking-info">
                        <strong>{product.productName}</strong>
                        <span>{product.storeName} · {product.unitsSold} units sold</span>
                      </div>
                      <strong className="analytics-ranking-value">
                        {money(product.salesValue)}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="analytics-panel analytics-orders-panel">
            <div className="analytics-panel-heading">
              <div>
                <p>TRANSACTION ACTIVITY</p>
                <h3>Recent orders</h3>
              </div>
              <Link href="/admin/orders" className="analytics-view-all">
                View all orders →
              </Link>
            </div>

            {data.recentOrders.length === 0 ? (
              <div className="analytics-empty">No orders recorded during this period.</div>
            ) : (
              <div className="analytics-table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>ORDER</th>
                      <th>CUSTOMER</th>
                      <th>STORE</th>
                      <th>AMOUNT</th>
                      <th>PAYMENT</th>
                      <th>ORDER STATUS</th>
                      <th>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr key={order.orderId}>
                        <td><strong>#{order.orderNumber}</strong></td>
                        <td>{order.customerName}</td>
                        <td>{order.storeName}</td>
                        <td className="analytics-table-amount">{money(order.amount)}</td>
                        <td>
                          <span className={`analytics-pill ${order.paymentStatus.toLowerCase()}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`analytics-pill ${order.orderStatus.toLowerCase()}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="analytics-bottom-grid">
            <section className="analytics-panel">
              <div className="analytics-panel-heading">
                <div>
                  <p>CATALOG</p>
                  <h3>Marketplace inventory</h3>
                </div>
              </div>
              <div className="analytics-catalog-grid">
                <div><span>Products</span><strong>{overview?.totalProducts ?? 0}</strong></div>
                <div><span>Stores</span><strong>{overview?.totalStores ?? 0}</strong></div>
                <div><span>Store owners</span><strong>{overview?.totalOwners ?? 0}</strong></div>
              </div>
            </section>

            <section className="analytics-panel">
              <div className="analytics-panel-heading">
                <div>
                  <p>SUBSCRIPTIONS</p>
                  <h3>Subscription status</h3>
                </div>
              </div>
              {data.subscriptions.length === 0 ? (
                <div className="analytics-empty">No subscription records found.</div>
              ) : (
                <div className="analytics-subscription-list">
                  {data.subscriptions.map((item) => (
                    <div key={item.status}>
                      <span>{item.status}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              )}
              <div className="analytics-breakdown-footer">
                <span>Paid subscription payments</span>
                <strong>{money(overview?.paidSubscriptionRevenue ?? 0)}</strong>
              </div>
            </section>
          </div>
        </>
      ) : !error ? (
        <div className="analytics-empty">Analytics data is not available yet.</div>
      ) : null}
    </section>
  );
}
