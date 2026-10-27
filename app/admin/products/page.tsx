

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Product = {
  productId: string;
  productName: string;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: string;

  store: {
    storeId: string;
    storeName: string;
    status: string;
  };

  category: {
    categoryId: string;
    name: string;
  } | null;

  quantity: number;
  imageUrl: string | null;
};

type Statistics = {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
};

type ProductsResponse = {
  statistics: Statistics;
  products: Product[];
};

type StatusFilter =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE"
  | "LOW_STOCK"
  | "OUT_OF_STOCK";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [statistics, setStatistics] = useState<Statistics>({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/admin/products");

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data: ProductsResponse = await response.json();

        setProducts(data.products);
        setStatistics(data.statistics);
      } catch (error) {
        console.error("Products loading error:", error);
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const names = products
      .map((product) => product.category?.name)
      .filter((name): name is string => Boolean(name));

    return Array.from(new Set(names)).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        product.productName.toLowerCase().includes(searchValue) ||
        product.store.storeName.toLowerCase().includes(searchValue) ||
        product.category?.name
          ?.toLowerCase()
          .includes(searchValue);

      let matchesStatus = true;

      if (statusFilter === "ACTIVE") {
        matchesStatus = product.isActive;
      }

      if (statusFilter === "INACTIVE") {
        matchesStatus = !product.isActive;
      }

      if (statusFilter === "LOW_STOCK") {
        matchesStatus =
          product.quantity > 0 && product.quantity <= 5;
      }

      if (statusFilter === "OUT_OF_STOCK") {
        matchesStatus = product.quantity === 0;
      }

      const matchesCategory =
        categoryFilter === "ALL" ||
        product.category?.name === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    products,
    search,
    statusFilter,
    categoryFilter,
  ]);

  function formatCurrency(value: number) {
    return `${value.toLocaleString("en-US")} ETB`;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getStockLabel(quantity: number) {
    if (quantity === 0) return "Out of stock";
    if (quantity <= 5) return "Low stock";
    return "In stock";
  }

  function getStockClass(quantity: number) {
    if (quantity === 0) return "out";
    if (quantity <= 5) return "low";
    return "good";
  }

  if (loading) {
    return (
      <div className="admin-page admin-products-page">
        <div className="products-loading">
          <div className="products-spinner" />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page admin-products-page">
        <div className="products-error">
          <div className="products-error-icon">!</div>

          <h2>Unable to load products</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-page admin-products-page">

        {/* STATISTICS */}

        <div className="products-stats">

          <div className="product-stat-card">
            <div className="product-stat-icon total">
              ◈
            </div>

            <div>
              <span>Total Products</span>
              <strong>{statistics.totalProducts}</strong>
            </div>
          </div>

          <div className="product-stat-card">
            <div className="product-stat-icon active">
              ✓
            </div>

            <div>
              <span>Active</span>
              <strong>{statistics.activeProducts}</strong>
            </div>
          </div>

          <div className="product-stat-card">
            <div className="product-stat-icon inactive">
              —
            </div>

            <div>
              <span>Inactive</span>
              <strong>{statistics.inactiveProducts}</strong>
            </div>
          </div>

          <div className="product-stat-card">
            <div className="product-stat-icon low">
              !
            </div>

            <div>
              <span>Low Stock</span>
              <strong>{statistics.lowStockProducts}</strong>
            </div>
          </div>

          <div className="product-stat-card">
            <div className="product-stat-icon out">
              ×
            </div>

            <div>
              <span>Out of Stock</span>
              <strong>{statistics.outOfStockProducts}</strong>
            </div>
          </div>

        </div>

        {/* PRODUCT CATALOGUE */}

        <section className="products-catalogue">

          <div className="products-catalogue-header">

            {/* <div>
              <span className="products-section-label">
                MARKETPLACE
              </span>

              <h1>Products</h1>

              <p>
                Manage and monitor products listed across
                BeautyMart stores.
              </p>
            </div> */}

            <div className="products-count">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}{" "}
              shown
            </div>

          </div>

          {/* SEARCH */}

          <div className="products-toolbar">

            <div className="products-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search products, stores..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="ALL">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

          </div>

          {/* FILTERS */}

          <div className="products-filters">

            {[
              {
                value: "ALL",
                label: "All Products",
              },
              {
                value: "ACTIVE",
                label: "Active",
              },
              {
                value: "INACTIVE",
                label: "Inactive",
              },
              {
                value: "LOW_STOCK",
                label: "Low Stock",
              },
              {
                value: "OUT_OF_STOCK",
                label: "Out of Stock",
              },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={
                  statusFilter === filter.value
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setStatusFilter(
                    filter.value as StatusFilter
                  )
                }
              >
                {filter.label}
              </button>
            ))}

          </div>

          {/* TABLE */}

          <div className="products-table-container">

            <table className="products-table">

              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>STORE</th>
                  <th>CATEGORY</th>
                  <th>PRICE</th>
                  <th>STOCK</th>
                  <th>STATUS</th>
                  <th>ADDED</th>
                </tr>
              </thead>

              <tbody>

                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="products-empty"
                    >
                      <div>
                        <span>◌</span>
                        <h3>No products found</h3>
                        <p>
                          Try changing your search or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.productId}>

                      {/* PRODUCT */}

                      <td>
                        <div className="product-cell">

                          <div className="product-image">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.productName}
                              />
                            ) : (
                              <span>
                                {product.productName
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="product-details">

                            <Link
                              href={`/admin/products/${product.productId}`}
                            >
                              {product.productName}
                            </Link>

                            <small>
                              ID ·{" "}
                              {product.productId.slice(0, 8)}
                            </small>

                          </div>

                        </div>
                      </td>

                      {/* STORE */}

                      <td>
                        <div className="store-cell">

                          <strong>
                            {product.store.storeName}
                          </strong>

                          <span
                            className={
                              product.store.status ===
                              "ACTIVE"
                                ? "store-status active"
                                : "store-status inactive"
                            }
                          >
                            {product.store.status}
                          </span>

                        </div>
                      </td>

                      {/* CATEGORY */}

                      <td>
                        <span className="category-badge">
                          {product.category?.name ||
                            "Uncategorized"}
                        </span>
                      </td>

                      {/* PRICE */}

                      <td>
                        <strong className="product-price">
                          {formatCurrency(product.price)}
                        </strong>
                      </td>

                      {/* STOCK */}

                      <td>
                        <div className="stock-cell">

                          <strong>
                            {product.quantity}
                          </strong>

                          <span
                            className={`stock-badge ${getStockClass(
                              product.quantity
                            )}`}
                          >
                            {getStockLabel(
                              product.quantity
                            )}
                          </span>

                        </div>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={
                            product.isActive
                              ? "product-status active"
                              : "product-status inactive"
                          }
                        >
                          <i />
                          {product.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* DATE */}

                      <td>
                        <span className="product-date">
                          {formatDate(
                            product.createdAt
                          )}
                        </span>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>

      {/* PRODUCTS PAGE STYLES */}

      <style jsx global>{`

        .admin-products-page {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        /* =========================
           STATISTICS
        ========================= */

        .products-stats {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .product-stat-card {
          min-width: 0;
          min-height: 104px;
          padding: 20px;
          background: #ffffff;
          border: 1px solid #e9e2dd;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow:
            0 3px 12px rgba(45, 40, 43, 0.035);
        }

        .product-stat-icon {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
        }

        .product-stat-icon.total {
          color: #8b4b68;
          background: #f7edf2;
        }

        .product-stat-icon.active {
          color: #327255;
          background: #edf7f1;
        }

        .product-stat-icon.inactive {
          color: #77706c;
          background: #f2efed;
        }

        .product-stat-icon.low {
          color: #a46a25;
          background: #fbf3e8;
        }

        .product-stat-icon.out {
          color: #a14c4c;
          background: #faeeee;
        }

        .product-stat-card span {
          display: block;
          margin-bottom: 6px;
          color: #7c7470;
          font-size: 12px;
          font-weight: 700;
        }

        .product-stat-card strong {
          display: block;
          color: #2d282b;
          font-size: 25px;
          line-height: 1;
          font-weight: 800;
        }

        /* =========================
           MAIN CARD
        ========================= */

        .products-catalogue {
          width: 100%;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #e8e1dc;
          border-radius: 16px;
          box-shadow:
            0 4px 18px rgba(45, 40, 43, 0.04);
        }

        .products-catalogue-header {
          padding: 24px 26px 20px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #eee8e4;
        }

        .products-section-label {
          display: block;
          margin-bottom: 7px;
          color: #8b4b68;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
        }

        .products-catalogue-header h1 {
          margin: 0;
          color: #2d282b;
          font-size: 25px;
          line-height: 1.15;
          font-weight: 800;
        }

        .products-catalogue-header p {
          margin: 7px 0 0;
          color: #817975;
          font-size: 13px;
        }

        .products-count {
          flex: 0 0 auto;
          color: #817975;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        /* =========================
           TOOLBAR
        ========================= */

        .products-toolbar {
          padding: 18px 26px 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .products-search {
          width: min(390px, 100%);
          height: 42px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 13px;
          background: #faf8f6;
          border: 1px solid #e5ddd8;
          border-radius: 9px;
          box-sizing: border-box;
        }

        .products-search span {
          color: #8b4b68;
          font-size: 20px;
          line-height: 1;
        }

        .products-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #2d282b;
          font-family: inherit;
          font-size: 12px;
        }

        .products-search input::placeholder {
          color: #aaa19c;
        }

        .products-toolbar select {
          height: 42px;
          min-width: 170px;
          padding: 0 34px 0 12px;
          border: 1px solid #e5ddd8;
          border-radius: 9px;
          background: #ffffff;
          color: #4b4441;
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          outline: none;
        }

        /* =========================
           FILTERS
        ========================= */

        .products-filters {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 26px 18px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .products-filters::-webkit-scrollbar {
          display: none;
        }

        .products-filters button {
          flex: 0 0 auto;
          height: 34px;
          padding: 0 13px;
          border: 1px solid #e5ddd8;
          border-radius: 8px;
          background: #ffffff;
          color: #746c68;
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .products-filters button:hover {
          border-color: #cdaabc;
          color: #8b4b68;
        }

        .products-filters button.selected {
          border-color: #8b4b68;
          background: #8b4b68;
          color: #ffffff;
        }

        /* =========================
           TABLE
        ========================= */

        .products-table-container {
          width: 100%;
          overflow-x: auto;
          border-top: 1px solid #eee8e4;
          -webkit-overflow-scrolling: touch;
        }

        .products-table {
          width: 100%;
          min-width: 980px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .products-table th {
          height: 48px;
          padding: 0 16px;
          background: #fbf9f7;
          border-bottom: 1px solid #ebe4df;
          color: #8a817c;
          text-align: left;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.09em;
          white-space: nowrap;
        }

        .products-table td {
          height: 76px;
          padding: 12px 16px;
          border-bottom: 1px solid #f0ebe7;
          color: #413a37;
          font-size: 12px;
          vertical-align: middle;
        }

        .products-table tbody tr {
          transition: background 0.16s ease;
        }

        .products-table tbody tr:hover {
          background: #fdfbf9;
        }

        .products-table th:nth-child(1),
        .products-table td:nth-child(1) {
          width: 28%;
        }

        .products-table th:nth-child(2),
        .products-table td:nth-child(2) {
          width: 16%;
        }

        .products-table th:nth-child(3),
        .products-table td:nth-child(3) {
          width: 13%;
        }

        .products-table th:nth-child(4),
        .products-table td:nth-child(4) {
          width: 12%;
        }

        .products-table th:nth-child(5),
        .products-table td:nth-child(5) {
          width: 12%;
        }

        .products-table th:nth-child(6),
        .products-table td:nth-child(6) {
          width: 10%;
        }

        .products-table th:nth-child(7),
        .products-table td:nth-child(7) {
          width: 12%;
        }

        /* PRODUCT */

        .product-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .product-image {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          overflow: hidden;
          border-radius: 10px;
          background: #f5efeb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8b4b68;
          font-size: 16px;
          font-weight: 800;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .product-details {
          min-width: 0;
        }

        .product-details a {
          display: block;
          overflow: hidden;
          color: #2d282b;
          text-decoration: none;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
          font-weight: 800;
        }

        .product-details a:hover {
          color: #8b4b68;
        }

        .product-details small {
          display: block;
          margin-top: 5px;
          color: #a39a95;
          font-size: 9px;
          font-weight: 600;
        }

        /* STORE */

        .store-cell {
          min-width: 0;
        }

        .store-cell strong {
          display: block;
          overflow: hidden;
          color: #403936;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
          font-weight: 800;
        }

        .store-status {
          display: inline-block;
          margin-top: 5px;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .store-status.active {
          color: #327255;
        }

        .store-status.inactive {
          color: #9a7777;
        }

        /* CATEGORY */

        .category-badge {
          display: inline-flex;
          align-items: center;
          min-height: 26px;
          padding: 0 9px;
          border-radius: 7px;
          background: #f6f1ee;
          color: #685f5b;
          font-size: 10px;
          font-weight: 700;
        }

        /* PRICE */

        .product-price {
          color: #2d282b;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        /* STOCK */

        .stock-cell strong {
          display: block;
          color: #2d282b;
          font-size: 13px;
          font-weight: 800;
        }

        .stock-badge {
          display: block;
          margin-top: 4px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }

        .stock-badge.good {
          color: #327255;
        }

        .stock-badge.low {
          color: #a46a25;
        }

        .stock-badge.out {
          color: #a14c4c;
        }

        /* STATUS */

        .product-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .product-status i {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: block;
        }

        .product-status.active {
          color: #327255;
        }

        .product-status.active i {
          background: #327255;
        }

        .product-status.inactive {
          color: #9a7777;
        }

        .product-status.inactive i {
          background: #9a7777;
        }

        /* DATE */

        .product-date {
          color: #7d7470;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
        }

        /* EMPTY */

        .products-empty {
          height: 260px !important;
          text-align: center !important;
        }

        .products-empty > div {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .products-empty span {
          font-size: 28px;
          color: #b5aaa5;
        }

        .products-empty h3 {
          margin: 10px 0 4px;
          color: #403936;
          font-size: 15px;
        }

        .products-empty p {
          margin: 0;
          color: #968d88;
          font-size: 11px;
        }

        /* LOADING */

        .products-loading {
          min-height: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #817975;
        }

        .products-spinner {
          width: 30px;
          height: 30px;
          margin-bottom: 12px;
          border: 3px solid #eadfe4;
          border-top-color: #8b4b68;
          border-radius: 50%;
          animation: products-spin 0.8s linear infinite;
        }

        .products-loading p {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
        }

        @keyframes products-spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ERROR */

        .products-error {
          min-height: 420px;
          padding: 40px;
          background: #ffffff;
          border: 1px solid #e8e1dc;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .products-error-icon {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #faeeee;
          color: #a14c4c;
          font-weight: 800;
        }

        .products-error h2 {
          margin: 14px 0 6px;
          color: #2d282b;
          font-size: 18px;
        }

        .products-error p {
          margin: 0 0 18px;
          color: #817975;
          font-size: 12px;
        }

        .products-error button {
          height: 38px;
          padding: 0 18px;
          border: 0;
          border-radius: 8px;
          background: #8b4b68;
          color: white;
          font-family: inherit;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 1200px) {
          .products-stats {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .products-stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .products-catalogue-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .products-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .products-search {
            width: 100%;
          }

          .products-toolbar select {
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .products-stats {
            grid-template-columns: 1fr;
          }

          .product-stat-card {
            min-height: 88px;
          }

          .products-catalogue-header {
            padding: 20px;
          }

          .products-toolbar {
            padding: 16px 20px 8px;
          }

          .products-filters {
            padding-left: 20px;
            padding-right: 20px;
          }

          .products-table th,
          .products-table td {
            padding-left: 12px;
            padding-right: 12px;
          }
        }

      `}</style>
    </>
  );
}