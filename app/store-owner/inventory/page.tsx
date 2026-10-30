"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./inventory.css";

type Product = {
  productId: string;
  productName: string;
  price: string | number;
  isActive: boolean;
  inventory: {
    quantity: number;
    minimumStock: number;
  } | null;
};

type Store = {
  storeId: string;
  storeName: string;
};

export default function InventoryPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInventory = async () => {
    try {
      setLoading(true); setError("");
      const storesResponse = await fetch("/api/stores");
      const storesData = await storesResponse.json();
      if (!storesResponse.ok || !storesData.stores?.length) throw new Error(storesData.message || "Your store could not be loaded.");
      const ownerStore = storesData.stores[0]; setStore(ownerStore);
      const productsResponse = await fetch(`/api/products?storeId=${encodeURIComponent(ownerStore.storeId)}`);
      const productsData = await productsResponse.json();
      if (!productsResponse.ok) throw new Error(productsData.message || "Inventory could not be loaded.");
      setProducts(productsData.products || []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Inventory could not be loaded."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    void loadInventory();
  }, []);

  const totalProducts = products.length;

  const totalUnits = products.reduce(
    (total, product) =>
      total + (product.inventory?.quantity ?? 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) => {
      const quantity =
        product.inventory?.quantity ?? 0;

      const minimumStock =
        product.inventory?.minimumStock ?? 0;

      return (
        quantity > 0 &&
        quantity <= minimumStock
      );
    }
  ).length;

  return (
    <main className="inventory-page">
      <div className="inventory-container">

        <Link
          href="/store-owner"
          className="inventory-back"
        >
          ← Back to Dashboard
        </Link>

        <header className="inventory-header">
          <p className="inventory-label">
            Store Inventory
          </p>

          <h1 className="inventory-title">
            Inventory
          </h1>

          <p className="inventory-description">
            Manage stock levels for{" "}
            {store?.storeName || "your store"}.
          </p>
        </header>

        {loading ? (
          <p>Loading inventory...</p>
        ) : error ? (
          <div className="inventory-empty"><p>{error}</p><button type="button" onClick={() => void loadInventory()}>Try again</button></div>
        ) : (
          <>
            <section className="inventory-stats">

              <div className="inventory-stat-card">
                <p className="inventory-stat-label">
                  Total Products
                </p>

                <h2 className="inventory-stat-value">
                  {totalProducts}
                </h2>
              </div>

              <div className="inventory-stat-card">
                <p className="inventory-stat-label">
                  Total Units
                </p>

                <h2 className="inventory-stat-value">
                  {totalUnits}
                </h2>
              </div>

              <div className="inventory-stat-card">
                <p className="inventory-stat-label">
                  Low Stock
                </p>

                <h2 className="inventory-stat-value">
                  {lowStockProducts}
                </h2>
              </div>

            </section>

            <section className="inventory-table-card">

              <div className="inventory-table-header">
                <h2 className="inventory-table-title">
                  Product Inventory
                </h2>
              </div>

              <div className="inventory-table-wrapper">

                <table className="inventory-table">

                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Minimum</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="inventory-empty"
                        >
                          No products found.
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => {
                        const quantity =
                          product.inventory?.quantity ?? 0;

                        const minimumStock =
                          product.inventory?.minimumStock ?? 0;

                        const isLowStock =
                          quantity > 0 &&
                          quantity <= minimumStock;

                        return (
                          <tr key={product.productId}>

                            <td className="inventory-product-name">
                              {product.productName}
                            </td>

                            <td className="inventory-price">
                              {Number(
                                product.price
                              ).toLocaleString()}{" "}
                              ETB
                            </td>

                            <td className="inventory-stock">
                              {quantity}
                            </td>

                            <td>
                              {minimumStock}
                            </td>

                           <td>
  <span
    className={`inventory-status ${
      !product.isActive
        ? "inventory-status-inactive"
        : quantity === 0
        ? "inventory-status-out"
        : isLowStock
          ? "inventory-status-low"
          : "inventory-status-in"
    }`}
  >
    {!product.isActive
      ? "Inactive"
      : quantity === 0
      ? "Out of Stock"
      : isLowStock
        ? "Low Stock"
        : "In Stock"}
  </span>
</td>
                            <td>
                              <Link
                                href={`/store-owner/products/edit/${product.productId}`}
                                className="inventory-edit-link"
                              >
                                Edit stock
                              </Link>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>

                </table>

              </div>
            </section>
          </>
        )}

      </div>
    </main>
  );
}
