"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "./analytics.css";

type Store = {
  storeId: string;
  storeName: string;
  status: string;
};

type Product = {
  productId: string;
  productName: string;
  price: string | number;
  isActive: boolean;
};

type OrderItem = {
  quantity: number;
  unitPrice: string | number;
  product: {
    productId: string;
    productName: string;
  };
};

type Order = {
  orderId: string;
  orderNumber: string;
  finalAmount: string | number;
  orderStatus: string;
  createdAt: string;
  customer: {
    customerId: string;
    fullName: string;
  };
  items: OrderItem[];
};

type Period = 7 | 30 | 90;

export default function AnalyticsPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [period, setPeriod] = useState<Period>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);

        const storesResponse = await fetch("/api/stores");
        const storesData = await storesResponse.json();

        if (
          !storesResponse.ok ||
          !storesData.stores?.length
        ) {
          return;
        }

        const ownerStore = storesData.stores[0];

        setStore(ownerStore);

        const productsResponse = await fetch(
          `/api/products?storeId=${encodeURIComponent(
            ownerStore.storeId
          )}`
        );

        const productsData =
          await productsResponse.json();

        if (
          productsResponse.ok &&
          productsData.products
        ) {
          setProducts(productsData.products);
        }

        const ordersResponse = await fetch(
          "/api/store-owner/orders"
        );

        const ordersData =
          await ordersResponse.json();

        if (
          ordersResponse.ok &&
          ordersData.orders
        ) {
          setOrders(ordersData.orders);
        }
      } catch (error) {
        console.error(
          "Load analytics error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  /*
   * Orders inside the selected period
   */
  const periodOrders = useMemo(() => {
    const now = new Date();

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);

      const difference =
        now.getTime() - orderDate.getTime();

      const days =
        difference /
        (1000 * 60 * 60 * 24);

      return days >= 0 && days < period;
    });
  }, [orders, period]);

  /*
   * Total sales for selected period
   */
  const totalSales = useMemo(() => {
    return periodOrders.reduce(
      (total, order) =>
        total + Number(order.finalAmount),
      0
    );
  }, [periodOrders]);

  /*
   * Unique customers
   */
 const totalCustomers = useMemo(() => {
  const customerIds = new Set(
    periodOrders.map(
      (order) => order.customer.customerId
    )
  );

  return customerIds.size;
}, [periodOrders]);

  /*
   * Sales chart
   */
  const salesByDay = useMemo(() => {
    const values = Array(period).fill(0);

    periodOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const today = new Date();

      const differenceInDays = Math.floor(
        (today.getTime() -
          orderDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (
        differenceInDays >= 0 &&
        differenceInDays < period
      ) {
        values[
          period - 1 - differenceInDays
        ] += Number(order.finalAmount);
      }
    });

    return values;
  }, [periodOrders, period]);

  const maxSales = Math.max(
    ...salesByDay,
    1
  );

  /*
   * Product performance
   */
  const topProducts = useMemo(() => {
    const productMap = new Map<
      string,
      {
        productName: string;
        units: number;
        sales: number;
      }
    >();

    periodOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const productId =
          item.product?.productId;

        const productName =
          item.product?.productName ||
          "Unknown Product";

        if (!productId) return;

        const existing =
          productMap.get(productId) || {
            productName,
            units: 0,
            sales: 0,
          };

        existing.units += Number(
          item.quantity
        );

        existing.sales +=
          Number(item.unitPrice) *
          Number(item.quantity);

        productMap.set(
          productId,
          existing
        );
      });
    });

    return Array.from(
      productMap.values()
    )
      .sort(
        (a, b) => b.sales - a.sales
      )
      .slice(0, 5);
  }, [periodOrders]);

  /*
   * Order status
   */
  const orderStatus = {
    pending: periodOrders.filter(
      (order) =>
        order.orderStatus === "PENDING"
    ).length,

    confirmed: periodOrders.filter(
      (order) =>
        order.orderStatus === "CONFIRMED"
    ).length,

    processing: periodOrders.filter(
      (order) =>
        order.orderStatus === "PROCESSING"
    ).length,

    shipped: periodOrders.filter(
      (order) =>
        order.orderStatus === "SHIPPED"
    ).length,

    delivered: periodOrders.filter(
      (order) =>
        order.orderStatus === "DELIVERED"
    ).length,

    cancelled: periodOrders.filter(
      (order) =>
        order.orderStatus === "CANCELLED"
    ).length,
  };

  /*
   * Active products
   */
  const activeProducts =
    products.filter(
      (product) => product.isActive
    ).length;

  return (
    <main className="analytics-page">
      <div className="analytics-container">

        <Link
          href="/store-owner"
          className="analytics-back"
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}

        <div className="analytics-header">

          <div>
            <p className="analytics-eyebrow">
              Store Performance
            </p>

            <h1 className="analytics-title">
              Analytics
            </h1>

            <p className="analytics-description">
              Understand how your beauty store
              is performing.
            </p>
          </div>

          <div className="analytics-store">
            <span>Store</span>
            <strong>
              {store?.storeName ||
                "Loading..."}
            </strong>
          </div>

        </div>

        {/* Loading */}

        {loading ? (
          <div className="analytics-loading">
            Loading analytics...
          </div>
        ) : (
          <>
            {/* KPI Cards */}

            <div className="analytics-stats">

              <div className="analytics-stat-card">
                <span className="analytics-stat-label">
                  Total Sales
                </span>

                <strong>
                  {totalSales.toLocaleString()} ETB
                </strong>

                <p>
                  Last {period} days
                </p>
              </div>

              <div className="analytics-stat-card">
                <span className="analytics-stat-label">
                  Orders
                </span>

                <strong>
                  {periodOrders.length}
                </strong>

                <p>
                  Last {period} days
                </p>
              </div>

              <div className="analytics-stat-card">
                <span className="analytics-stat-label">
                  Customers
                </span>

                <strong>
                  {totalCustomers}
                </strong>

                <p>
                  Unique customers
                </p>
              </div>

              <div className="analytics-stat-card">
                <span className="analytics-stat-label">
                  Active Products
                </span>

                <strong>
                  {activeProducts}
                </strong>

                <p>
                  Currently active
                </p>
              </div>

            </div>

            {/* Sales Chart */}

            <section className="analytics-card">

              <div className="analytics-card-header">

                <div>
                  <h2>
                    Sales Overview
                  </h2>

                  <p>
                    Sales performance over
                    the selected period.
                  </p>
                </div>

                <select
                  value={period}
                  onChange={(event) =>
                    setPeriod(
                      Number(
                        event.target.value
                      ) as Period
                    )
                  }
                  className="analytics-period"
                >
                  <option value={7}>
                    Last 7 days
                  </option>

                  <option value={30}>
                    Last 30 days
                  </option>

                  <option value={90}>
                    Last 90 days
                  </option>
                </select>

              </div>

              <div className="analytics-chart">

                {salesByDay.map(
                  (amount, index) => {
                    const height =
                      (amount /
                        maxSales) *
                      100;

                    return (
                      <div
                        className="analytics-chart-column"
                        key={index}
                      >
                        <div
                          className="analytics-chart-bar"
                          style={{
                            height: `${Math.max(
                              height,
                              amount > 0
                                ? 8
                                : 2
                            )}%`,
                          }}
                          title={`${amount.toLocaleString()} ETB`}
                        />
                      </div>
                    );
                  }
                )}

              </div>

              <div className="analytics-chart-labels">
                {salesByDay.map(
                  (_, index) => {
                    const date =
                      new Date();

                    date.setDate(
                      date.getDate() -
                        (period -
                          1 -
                          index)
                    );

                    return (
                      <span key={index}>
                        {date.toLocaleDateString(
                          "en-US",
                          {
                            month:
                              period <= 30
                                ? undefined
                                : "short",
                            day:
                              period <= 30
                                ? undefined
                                : "numeric",
                            weekday:
                              period === 7
                                ? "short"
                                : undefined,
                          }
                        )}
                      </span>
                    );
                  }
                )}
              </div>

            </section>

            {/* Two Columns */}

            <div className="analytics-two-column">

              {/* Top Products */}

              <section className="analytics-card">

                <div className="analytics-card-header">
                  <div>
                    <h2>
                      Top Products
                    </h2>

                    <p>
                      Best-performing products.
                    </p>
                  </div>
                </div>

                {topProducts.length === 0 ? (
                  <div className="analytics-empty-small">
                    No product sales found
                    for this period.
                  </div>
                ) : (
                  <div className="top-products">

                    {topProducts.map(
                      (product, index) => (
                        <div
                          className="top-product"
                          key={
                            product.productName
                          }
                        >
                          <div className="top-product-number">
                            {index + 1}
                          </div>

                          <div className="top-product-info">
                            <strong>
                              {
                                product.productName
                              }
                            </strong>

                            <span>
                              {product.units}{" "}
                              unit
                              {product.units !==
                              1
                                ? "s"
                                : ""}{" "}
                              sold
                            </span>
                          </div>

                          <strong className="top-product-sales">
                            {product.sales.toLocaleString()}{" "}
                            ETB
                          </strong>
                        </div>
                      )
                    )}

                  </div>
                )}

              </section>

              {/* Order Performance */}

              <section className="analytics-card">

                <div className="analytics-card-header">
                  <div>
                    <h2>
                      Order Performance
                    </h2>

                    <p>
                      Order status breakdown.
                    </p>
                  </div>
                </div>

                <div className="order-performance">

                  <div>
                    <span>
                      Pending
                    </span>
                    <strong>
                      {orderStatus.pending}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Confirmed
                    </span>
                    <strong>
                      {orderStatus.confirmed}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Processing
                    </span>
                    <strong>
                      {orderStatus.processing}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Shipped
                    </span>
                    <strong>
                      {orderStatus.shipped}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Delivered
                    </span>
                    <strong>
                      {orderStatus.delivered}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Cancelled
                    </span>
                    <strong>
                      {orderStatus.cancelled}
                    </strong>
                  </div>

                </div>

              </section>

            </div>

            {/* Store Summary */}

            <section className="analytics-card analytics-summary">

              <div>
                <span>
                  Store
                </span>

                <strong>
                  {store?.storeName ||
                    "Your Store"}
                </strong>
              </div>

              <div>
                <span>
                  Products
                </span>

                <strong>
                  {products.length}
                </strong>
              </div>

              <div>
                <span>
                  Active Products
                </span>

                <strong>
                  {activeProducts}
                </strong>
              </div>

              <div>
                <span>
                  Total Orders
                </span>

                <strong>
                  {orders.length}
                </strong>
              </div>

            </section>
          </>
        )}

      </div>
    </main>
  );
}