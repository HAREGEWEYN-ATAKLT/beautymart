

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "../store-owner.css";
import "./products.css";

type Store = {
  storeId: string;
  storeName: string;
  status: string;
};

type Product = {
  productId: string;
  productName: string;
  description: string | null;
  price: string | number;
  isActive: boolean;
  category: {
    categoryId: string;
    categoryName: string;
  };
  inventory: {
    quantity: number;
    minimumStock: number;
  } | null;
  images: {
    productImageId: string;
    imageUrl: string;
    isPrimary: boolean;
  }[];
};

export default function StoreOwnerProductsPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState("");

  const [products, setProducts] = useState<Product[]>([]);

  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  /*
  |--------------------------------------------------------------------------
  | Load Store Owner's Stores
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoadingStores(true);
        setError("");

        const response = await fetch("/api/stores");

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load your stores.");
          return;
        }

        const storeList = data.stores || [];

        setStores(storeList);

        /*
         * For now, one Store Owner has one store.
         *
         * We still keep the storeId internally because
         * products belong to a specific store.
         */
        if (storeList.length > 0) {
          setStoreId(storeList[0].storeId);
        }
      } catch (error) {
        console.error("Load stores error:", error);
        setError("Something went wrong while loading your stores.");
      } finally {
        setLoadingStores(false);
      }
    };

    loadStores();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load Products For Store
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!storeId) {
      setProducts([]);
      return;
    }

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setError("");

        const response = await fetch(
          `/api/products?storeId=${encodeURIComponent(storeId)}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load products.");
          return;
        }

        setProducts(data.products || []);
      } catch (error) {
        console.error("Load products error:", error);
        setError("Something went wrong while loading products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [storeId]);

  /*
  |--------------------------------------------------------------------------
  | Product Statistics
  |--------------------------------------------------------------------------
  */

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.isActive
  ).length;

  const lowStockProducts = products.filter((product) => {
    const quantity = product.inventory?.quantity ?? 0;
    const minimumStock = product.inventory?.minimumStock ?? 0;

    return quantity > 0 && quantity <= minimumStock;
  }).length;

  const outOfStockProducts = products.filter((product) => {
    const quantity = product.inventory?.quantity ?? 0;

    return quantity === 0;
  }).length;

  /*
  |--------------------------------------------------------------------------
  | Search + Filter
  |--------------------------------------------------------------------------
  */

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        product.productName.toLowerCase().includes(searchText) ||
        product.category.categoryName
          .toLowerCase()
          .includes(searchText);

      const quantity = product.inventory?.quantity ?? 0;
      const minimumStock = product.inventory?.minimumStock ?? 0;

      let matchesFilter = true;

      if (filter === "active") {
        matchesFilter = product.isActive;
      }

      if (filter === "low") {
        matchesFilter =
          quantity > 0 && quantity <= minimumStock;
      }

      if (filter === "out") {
        matchesFilter = quantity === 0;
      }

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  return (
    <div className="products-page">
      <header className="products-navbar">
        <div className="products-navbar-inner">
          <div className="products-brand">
            <div className="products-brand-logo">B</div>

            <div>
              <h1>BeautyMart</h1>
              <p>Store Management</p>
            </div>
          </div>

          <Link href="/store-owner" className="products-back-link">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="products-main">
        <div className="products-container">
          <div className="products-header">
            <div>
              <p className="products-label">Store Management</p>

              <h2>Products</h2>

              <p>
                Add, manage, and organize the beauty products in your store.
              </p>
            </div>

            <Link
              href="/store-owner/products/add"
              className="products-primary-button"
            >
              + Add Product
            </Link>
          </div>

          {/* Error */}

          {error && (
            <div className="form-error" style={{ marginBottom: "24px" }}>
              {error}
            </div>
          )}

          {/* Statistics */}

          <div className="products-stats">
            <div className="products-stat-card">
              <p>Total Products</p>
              <h3>{totalProducts}</h3>
              <span>Products in your store</span>
            </div>

            <div className="products-stat-card">
              <p>Active Products</p>
              <h3>{activeProducts}</h3>
              <span>Currently available</span>
            </div>

            <div className="products-stat-card">
              <p>Low Stock</p>
              <h3>{lowStockProducts}</h3>
              <span>Need restocking</span>
            </div>

            <div className="products-stat-card">
              <p>Out of Stock</p>
              <h3>{outOfStockProducts}</h3>
              <span>Unavailable products</span>
            </div>
          </div>

          <div className="products-card">
            <div className="products-card-header">
              <div>
                <h3>Your Products</h3>

                <p>Products belonging to your store.</p>
              </div>

              <div className="products-search-wrapper">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="products-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <select
                  className="products-filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Products</option>
                  <option value="active">Active</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Loading */}

            {loadingStores || loadingProducts ? (
              <div className="products-empty">
                <div className="products-empty-icon">
                  ◇
                </div>

                <h3>Loading products...</h3>

                <p>
                  Please wait while we load your store products.
                </p>
              </div>
            ) : stores.length === 0 ? (
              /* No Store */

              <div className="products-empty">
                <div className="products-empty-icon">
                  ◇
                </div>

                <h3>No store yet</h3>

                <p>
                  Create a store before adding products.
                </p>

                <Link
                  href="/store-owner/create-store"
                  className="products-primary-button"
                >
                  + Create Store
                </Link>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* No Products */

              <div className="products-empty">
                <div className="products-empty-icon">
                  ◇
                </div>

                <h3>
                  {products.length === 0
                    ? "No products yet"
                    : "No matching products"}
                </h3>

                <p>
                  {products.length === 0
                    ? "Start building your store by adding your first beauty product."
                    : "Try changing your search or filter."}
                </p>

                {products.length === 0 && (
                  <Link
                    href="/store-owner/products/add"
                    className="products-primary-button"
                  >
                    + Add Your First Product
                  </Link>
                )}
              </div>
            ) : (
              /* Products */

              <div
                style={{
                  display: "grid",
                  gap: "16px",
                  padding: "24px",
                }}
              >
                {filteredProducts.map((product) => {
                  const quantity =
                    product.inventory?.quantity ?? 0;

                
const primaryImage =
  product.images?.find(
    (image) => image.isPrimary
  )?.imageUrl ||
  product.images?.[0]?.imageUrl ||
  null;

                  return (
                    <div
                      key={product.productId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "18px",
                        padding: "18px",
                        border: "1px solid #eee",
                        borderRadius: "12px",
                        background: "#fff",
                      }}
                    >
                      {/* Product Image */}

                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          background: "#f5f1ec",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={product.productName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: "28px" }}>
                            ◇
                          </span>
                        )}
                      </div>

                      {/* Product Information */}

                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            margin: "0 0 6px",
                            fontSize: "18px",
                          }}
                        >
                          {product.productName}
                        </h3>

                        <p
                          style={{
                            margin: "0 0 6px",
                            color: "#777",
                          }}
                        >
                          {product.category.categoryName}
                        </p>

                        <p
                          style={{
                            margin: 0,
                            fontWeight: 600,
                          }}
                        >
                          {Number(product.price).toLocaleString()} ETB
                        </p>
                      </div>

                      {/* Stock */}

                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            margin: "0 0 6px",
                            fontWeight: 600,
                          }}
                        >
                          Stock
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color:
                              quantity === 0
                                ? "#b42318"
                                : "#555",
                          }}
                        >
                          {quantity}
                        </p>
                      </div>

                      {/* Status + Edit */}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background: product.isActive
                              ? "#edf7ed"
                              : "#f5eeee",
                            color: product.isActive
                              ? "#2e6b35"
                              : "#8b4b5a",
                          }}
                        >
                          {product.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>

                        <Link
                          href={`/store-owner/products/edit/${product.productId}`}
                          style={{
                            display: "inline-block",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            background: "#8b4b5a",
                            color: "#fff",
                            textDecoration: "none",
                            fontSize: "14px",
                            fontWeight: 600,
                          }}
                        >
                          Edit
                        </Link>
                        <button
  type="button"
  onClick={async () => {
    const confirmed = window.confirm(
      `Remove "${product.productName}" from sale? Products with order history are kept inactive to preserve customer records.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.productId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete product.");
        return;
      }

      if (data.deactivated) alert(data.message);

      setProducts((currentProducts) =>
        currentProducts.filter(
          (item) => item.productId !== product.productId
        )
      );
    } catch (error) {
      console.error("Delete product error:", error);
      alert("Something went wrong while deleting the product.");
    }
  }}
  style={{
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #e3c4c4",
    background: "#fff5f5",
    color: "#b42318",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  Delete
</button>
<button
  type="button"
  onClick={async () => {
    const nextStatus = !product.isActive;

    try {
      const response = await fetch("/api/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.productId,
          isActive: nextStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to change product status."
        );
        return;
      }

      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.productId === product.productId
            ? {
                ...item,
                isActive: nextStatus,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Product status update error:",
        error
      );

      alert(
        "Something went wrong while changing the product status."
      );
    }
  }}
  style={{
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd5d1",
    background: "#fff",
    color: "#555",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  {product.isActive ? "Deactivate" : "Activate"}
</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
