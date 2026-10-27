"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Product = {
  productId: string;
  productName: string;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: string;
  quantity: number;
};

type Category = {
  categoryId: string;
  categoryName: string;
  description: string | null;
  createdAt: string;

  store: {
    storeId: string;
    storeName: string;
    description: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    status: string;
  } | null;

  productCount: number;
  products: Product[];
};

export default function AdminCategoryDetailsPage() {
  const params = useParams();

  const categoryId = params.categoryId as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategory() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/categories/${categoryId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load category"
          );
        }

        setCategory(data.category);
      } catch (err) {
        console.error("Category details error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load category details"
        );
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-category-details-loading">
          <div className="admin-loading-spinner" />
          <p>Loading category details...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="admin-page">
        <div className="admin-category-details-error">
          <div className="admin-error-icon">!</div>

          <h2>Unable to load category</h2>

          <p>
            {error || "Category could not be found."}
          </p>

          <Link
            href="/admin/categories"
            className="admin-category-back-button"
          >
            ← Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  const createdDate = new Date(
    category.createdAt
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="admin-page admin-category-details-page">
      {/* Header */}
      <div className="admin-category-details-header">
        <div>
          <Link
            href="/admin/categories"
            className="admin-category-details-back"
          >
            ← Back to Categories
          </Link>

          <div className="admin-products-eyebrow">
            MARKETPLACE MANAGEMENT
          </div>

          <h1>{category.categoryName}</h1>

          <p>
            View category information, store ownership, and
            products assigned to this category.
          </p>
        </div>

        <div
          className={`admin-category-details-store-status ${
            category.store?.status?.toLowerCase() || ""
          }`}
        >
          <span />
          {category.store?.status || "Unknown"}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="admin-category-details-stat-grid">
        <div className="admin-category-details-stat-card">
          <div className="admin-category-details-stat-icon">
            ◈
          </div>

          <div>
            <span>Category</span>
            <strong>{category.categoryName}</strong>
          </div>
        </div>

        <div className="admin-category-details-stat-card">
          <div className="admin-category-details-stat-icon">
            ◇
          </div>

          <div>
            <span>Products</span>
            <strong>{category.productCount}</strong>
          </div>
        </div>

        <div className="admin-category-details-stat-card">
          <div className="admin-category-details-stat-icon">
            ⌂
          </div>

          <div>
            <span>Store</span>
            <strong>
              {category.store?.storeName || "Unknown"}
            </strong>
          </div>
        </div>

        <div className="admin-category-details-stat-card">
          <div className="admin-category-details-stat-icon">
            ◷
          </div>

          <div>
            <span>Created</span>
            <strong>{createdDate}</strong>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-category-details-grid">
        {/* Category Information */}
        <section className="admin-category-details-card">
          <div className="admin-category-details-card-header">
            <div>
              <span className="admin-products-eyebrow">
                CATEGORY INFORMATION
              </span>

              <h2>Category Details</h2>
            </div>
          </div>

          <div className="admin-category-details-info">
            <div className="admin-category-details-info-row">
              <span>Category Name</span>
              <strong>{category.categoryName}</strong>
            </div>

            <div className="admin-category-details-info-row">
              <span>Description</span>
              <strong>
                {category.description ||
                  "No description provided"}
              </strong>
            </div>

            <div className="admin-category-details-info-row">
              <span>Category ID</span>
              <strong className="admin-category-details-id">
                {category.categoryId}
              </strong>
            </div>

            <div className="admin-category-details-info-row">
              <span>Created</span>
              <strong>{createdDate}</strong>
            </div>
          </div>
        </section>

        {/* Store Information */}
        <section className="admin-category-details-card">
          <div className="admin-category-details-card-header">
            <div>
              <span className="admin-products-eyebrow">
                STORE OWNERSHIP
              </span>

              <h2>Store Information</h2>
            </div>
          </div>

          {category.store ? (
            <div className="admin-category-store-details">
              <div className="admin-category-store-details-title">
                <div className="admin-category-store-details-icon">
                  ⌂
                </div>

                <div>
                  <strong>
                    {category.store.storeName}
                  </strong>

                  <span>
                    {category.store.status}
                  </span>
                </div>
              </div>

              <div className="admin-category-details-info">
                <div className="admin-category-details-info-row">
                  <span>Store ID</span>
                  <strong className="admin-category-details-id">
                    {category.store.storeId}
                  </strong>
                </div>

                <div className="admin-category-details-info-row">
                  <span>Email</span>
                  <strong>
                    {category.store.email || "Not provided"}
                  </strong>
                </div>

                <div className="admin-category-details-info-row">
                  <span>Phone</span>
                  <strong>
                    {category.store.phone || "Not provided"}
                  </strong>
                </div>

                <div className="admin-category-details-info-row">
                  <span>Address</span>
                  <strong>
                    {category.store.address || "Not provided"}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-category-store-unavailable">
              Store information is unavailable.
            </div>
          )}
        </section>
      </div>

      {/* Products */}
      <section className="admin-category-products-card">
        <div className="admin-category-products-header">
          <div>
            <span className="admin-products-eyebrow">
              CATEGORY PRODUCTS
            </span>

            <h2>Products in {category.categoryName}</h2>

            <p>
              Products currently assigned to this category.
            </p>
          </div>

          <span className="admin-category-products-count">
            {category.productCount}{" "}
            {category.productCount === 1
              ? "product"
              : "products"}
          </span>
        </div>

        {category.products.length === 0 ? (
          <div className="admin-category-products-empty">
            <div className="admin-category-products-empty-icon">
              ◇
            </div>

            <h3>No products assigned</h3>

            <p>
              Products assigned to this category will appear
              here.
            </p>
          </div>
        ) : (
          <div className="admin-category-products-table-wrapper">
            <table className="admin-category-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {category.products.map((product) => {
                  const productDate = new Date(
                    product.createdAt
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={product.productId}>
                      <td>
                        <div className="admin-category-product-name">
                          <div className="admin-category-product-icon">
                            ◇
                          </div>

                          <div>
                            <strong>
                              {product.productName}
                            </strong>

                            <span>
                              {product.description ||
                                "No description provided"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong className="admin-category-product-price">
                          {product.price.toLocaleString()} ETB
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            product.quantity === 0
                              ? "admin-category-stock out"
                              : product.quantity <= 5
                                ? "admin-category-stock low"
                                : "admin-category-stock"
                          }
                        >
                          {product.quantity}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-category-product-status ${
                            product.isActive
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          <span />
                          {product.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <span className="admin-category-product-date">
                          {productDate}
                        </span>
                      </td>

                      <td>
                        <Link
                          href={`/admin/products/${product.productId}`}
                          className="admin-category-product-view"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}