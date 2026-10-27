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

  store: {
    storeId: string;
    storeName: string;
    description: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    status: string;
  } | null;

  category: {
    categoryId: string;
    name: string;
    description: string | null;
  } | null;

  quantity: number;

  images: string[];
};

export default function AdminProductDetailsPage() {
  const params = useParams();
  const productId = params?.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [updatingStatus, setUpdatingStatus] = useState(false);
  useEffect(() => {
    if (!productId) return;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/admin/products/${productId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load product"
          );
        }

        setProduct(data.product);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);
  


const handleStatusChange = async () => {
  if (!product) return;

  const nextStatus = !product.isActive;

  const confirmed = window.confirm(
    nextStatus
      ? "Are you sure you want to activate this product?"
      : "Are you sure you want to deactivate this product?"
  );

  if (!confirmed) return;

  try {
    setUpdatingStatus(true);

    const response = await fetch(`/api/admin/products/${product.productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive: nextStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update product status");
    }

    setProduct((current) =>
      current
        ? {
            ...current,
            isActive: data.product.isActive,
          }
        : current
    );
  } catch (error) {
    console.error("Product status update error:", error);
    alert(
      error instanceof Error
        ? error.message
        : "Failed to update product status"
    );
  } finally {
    setUpdatingStatus(false);
  }
};


  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-product-details-loading">
          <div className="admin-loading-spinner" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="admin-page">
        <div className="admin-product-details-error">
          <div className="admin-error-icon">!</div>

          <h2>Product not found</h2>

          <p>
            {error || "We could not find this product."}
          </p>

          <Link
            href="/admin/products"
            className="admin-product-back-button"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const stockStatus =
    product.quantity === 0
      ? "Out of stock"
      : product.quantity <= 5
        ? "Low stock"
        : "In stock";

  const stockClass =
    product.quantity === 0
      ? "out"
      : product.quantity <= 5
        ? "low"
        : "good";

  const formattedDate = new Date(
    product.createdAt
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const imageUrl = product.images?.[0];

  return (
    <div className="admin-page admin-product-details-page">
      {/* Page header */}
      <div className="admin-product-details-top">
        <div>
          <Link
            href="/admin/products"
            className="admin-product-back-link"
          >
            ← Back to Products
          </Link>

          <div className="admin-products-eyebrow">
            PRODUCT DETAILS
          </div>

          <h1>{product.productName}</h1>

          <p>
            Review product information, inventory, category,
            and store details.
          </p>
        </div>

       <div className="admin-product-header-actions">
  <div
    className={`admin-product-status ${
      product.isActive ? "active" : "inactive"
    }`}
  >
    <span />
    {product.isActive ? "Active" : "Inactive"}
  </div>

  <button
    type="button"
    onClick={handleStatusChange}
    disabled={updatingStatus}
    className={`admin-product-status-action ${
      product.isActive ? "deactivate" : "activate"
    }`}
  >
    {updatingStatus
      ? "Updating..."
      : product.isActive
        ? "Deactivate Product"
        : "Activate Product"}
  </button>
</div>
      </div>

      {/* Main content */}
      <div className="admin-product-details-grid">
        {/* Product overview */}
        <section className="admin-product-main-card">
          <div className="admin-product-image-large">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.productName}
              />
            ) : (
              <div className="admin-product-image-placeholder">
                <span>◇</span>
                <small>No image available</small>
              </div>
            )}
          </div>

          <div className="admin-product-main-info">
            <div className="admin-product-category-label">
              {product.category?.name || "Uncategorized"}
            </div>

            <h2>{product.productName}</h2>

            <div className="admin-product-price-large">
              {product.price.toLocaleString()} ETB
            </div>

            <p className="admin-product-description">
              {product.description ||
                "No product description has been provided."}
            </p>

            <div className="admin-product-meta">
              <div>
                <span>Product ID</span>
                <strong>
                  {product.productId}
                </strong>
              </div>

              <div>
                <span>Added</span>
                <strong>{formattedDate}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Inventory */}
        <section className="admin-product-info-card">
          <div className="admin-product-card-heading">
            <div>
              <span className="admin-product-card-eyebrow">
                INVENTORY
              </span>

              <h3>Stock information</h3>
            </div>

            <span className={`admin-stock-icon ${stockClass}`}>
              {product.quantity === 0
                ? "×"
                : product.quantity <= 5
                  ? "!"
                  : "✓"}
            </span>
          </div>

          <div className="admin-stock-number">
            {product.quantity}
          </div>

          <div className={`admin-stock-status ${stockClass}`}>
            {stockStatus}
          </div>

          <p className="admin-product-card-description">
            Current quantity available for this product.
          </p>
        </section>

        {/* Category */}
        <section className="admin-product-info-card">
          <div className="admin-product-card-heading">
            <div>
              <span className="admin-product-card-eyebrow">
                CATEGORY
              </span>

              <h3>Product category</h3>
            </div>

            <span className="admin-product-card-icon">
              ◈
            </span>
          </div>

          <div className="admin-detail-value">
            {product.category?.name ||
              "Uncategorized"}
          </div>

          <p className="admin-product-card-description">
            {product.category?.description ||
              "No category description available."}
          </p>
        </section>
      </div>

      {/* Store information */}
      <section className="admin-product-store-card">
        <div className="admin-product-store-header">
          <div>
            <span className="admin-product-card-eyebrow">
              STORE INFORMATION
            </span>

            <h2>
              {product.store?.storeName ||
                "Unknown Store"}
            </h2>

            <p>
              Product belongs to this BeautyMart store.
            </p>
          </div>

          {product.store && (
            <span
              className={`admin-store-status ${
                product.store.status.toLowerCase()
              }`}
            >
              <span />
              {product.store.status}
            </span>
          )}
        </div>

        {product.store && (
          <div className="admin-product-store-details">
            <div>
              <span>Store ID</span>
              <strong>{product.store.storeId}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>
                {product.store.email || "Not provided"}
              </strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>
                {product.store.phone || "Not provided"}
              </strong>
            </div>

            <div>
              <span>Address</span>
              <strong>
                {product.store.address ||
                  "Not provided"}
              </strong>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}