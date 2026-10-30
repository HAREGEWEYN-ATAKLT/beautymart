"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./discounts.css";
type Discount = {
  discountId: string;
  name: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: string | number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productDiscounts: {
    product: {
      productId: string;
      productName: string;
    };
  }[];
};

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [updatingDiscountId, setUpdatingDiscountId] = useState<string | null>(null);
const [showForm, setShowForm] = useState(false);
const [discountName, setDiscountName] = useState("");
const [discountType, setDiscountType] = useState<
  "PERCENTAGE" | "FIXED_AMOUNT"
>("PERCENTAGE");
const [discountValue, setDiscountValue] = useState("");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [products, setProducts] = useState<
  { productId: string; productName: string }[]
>([]);

const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  useEffect(() => {
    const loadDiscounts = async () => {
      try {
        const response = await fetch("/api/discounts");
        const data = await response.json();

        if (response.ok && data.discounts) {
          setDiscounts(data.discounts);
        } else {
          setError(data.message || "Discounts could not be loaded.");
        }
      } catch {
        setError("Discounts could not be loaded. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDiscounts();
  }, []);
useEffect(() => {
  const loadProducts = async () => {
    try {
      const storesResponse = await fetch("/api/stores");
      const storesData = await storesResponse.json();

      if (!storesResponse.ok || !storesData.stores?.length) {
        return;
      }

      const storeId = storesData.stores[0].storeId;

      const productsResponse = await fetch(
        `/api/products?storeId=${storeId}`
      );

      const productsData = await productsResponse.json();

      if (productsResponse.ok && productsData.products) {
        setProducts(productsData.products);
      }
    } catch (error) {
      console.error("Load products error:", error);
    }
  };

  loadProducts();
}, []);
  const updateDiscountStatus = async (discount: Discount) => {
    setMessage("");
    setError("");
    setUpdatingDiscountId(discount.discountId);
    try {
      const response = await fetch("/api/discounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountId: discount.discountId, isActive: !discount.isActive }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "The discount could not be updated.");
        return;
      }
      setDiscounts((items) =>
        items.map((item) =>
          item.discountId === discount.discountId
            ? { ...item, isActive: data.discount.isActive }
            : item
        )
      );
      setMessage(data.message);
    } catch {
      setError("The discount could not be updated. Check your connection and try again.");
    } finally {
      setUpdatingDiscountId(null);
    }
  };

  return (
   <main className="discounts-page">
      <div className="discounts-container">
       <Link
  href="/store-owner"
  className="discounts-back"
>
  ← Back to Dashboard
</Link>

       <div className="discounts-header">
          <div>
            <p className="discounts-eyebrow">
              Store Promotions
            </p>
<h1 className="discounts-title">
              Discounts
            </h1>

          <p className="discounts-description">
              Create and manage promotions for your products.
            </p>
          </div>

  <button
  type="button"
  onClick={() => setShowForm(true)}
  className="discounts-create-button"
>
  + Create Discount
</button>
        </div>
       {message ? <p className="discounts-message" role="status">{message}</p> : null}
       {error ? <p className="discounts-error" role="alert">{error}</p> : null}
{showForm && (
  <section className="discounts-form" aria-labelledby="create-discount-title">
    <div className="discounts-form-heading">
      <div>
        <p className="discounts-form-eyebrow">New promotion</p>
        <h2 id="create-discount-title">Create Discount</h2>
      </div>
      <button type="button" className="discounts-close-button" onClick={() => setShowForm(false)} aria-label="Close create discount form">×</button>
    </div>

   <div className="discounts-form-grid">
  <div className="discounts-field discounts-field-wide">
    <label>Discount Name</label>
    <input
      type="text"
      placeholder="e.g. Summer Beauty Sale"
      value={discountName}
onChange={(event) => setDiscountName(event.target.value)}
    />
  </div>

  <div className="discounts-field">
    <label>Discount Type</label>
    <select
    value={discountType}
onChange={(event) =>
  setDiscountType(
    event.target.value as "PERCENTAGE" | "FIXED_AMOUNT"
  )
}
      
    >
      <option value="PERCENTAGE">Percentage (%)</option>
      <option value="FIXED_AMOUNT">Fixed Amount (ETB)</option>
    </select>
  </div>

  <div className="discounts-field">
    <label>Discount Value</label>
    <input
      type="number"
      placeholder="e.g. 10"
      min="1"
      value={discountValue}
onChange={(event) => setDiscountValue(event.target.value)}
    />
  </div>

  <div className="discounts-field">
    <label>Start Date</label>
    <input
      type="date"
       value={startDate}
  onChange={(event) => setStartDate(event.target.value)}
    />
  </div>

  <div className="discounts-field">
    <label>End Date</label>
    <input
      type="date"
       value={endDate}
  onChange={(event) => setEndDate(event.target.value)}
    />
  </div>

  <div className="discounts-field discounts-field-wide">
  <label>Select Products</label>

  <div className="discounts-products">
    {products.map((product) => (
      <label
        key={product.productId}
        className="discounts-product-option"
      >
        <input
          type="checkbox"
          checked={selectedProductIds.includes(product.productId)}
          onChange={(event) => {
            if (event.target.checked) {
              setSelectedProductIds((current) => [
                ...current,
                product.productId,
              ]);
            } else {
              setSelectedProductIds((current) =>
                current.filter(
                  (id) => id !== product.productId
                )
              );
            }
          }}
        />

        <span>{product.productName}</span>
      </label>
    ))}
  </div>
</div>
</div>
<div className="discounts-form-actions">
<button
  type="button"
  onClick={async () => {
    try {
      const storesResponse = await fetch("/api/stores");
      const storesData = await storesResponse.json();

      if (!storesResponse.ok || !storesData.stores?.length) {
        setError("Store not found.");
        return;
      }

      const storeId = storesData.stores[0].storeId;

      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId,
          name: discountName,
          discountType,
          discountValue: Number(discountValue),
          startDate,
          endDate,
          productIds: selectedProductIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create discount.");
        return;
      }

      setError("");
      setMessage("Discount created successfully.");

      setDiscounts((current) => [data.discount, ...current]);
      setShowForm(false);

      setDiscountName("");
      setDiscountType("PERCENTAGE");
      setDiscountValue("");
      setStartDate("");
      setEndDate("");
      setSelectedProductIds([]);
    } catch {
      setError("Something went wrong while creating the discount.");
    }
  }}
 className="discounts-submit-button">
  Create Discount
</button>
    <button
      type="button"
      onClick={() => setShowForm(false)}
      className="discounts-cancel-button"
    >
      Cancel
    </button>
  </div>
  </section>
)}
        <div className="discounts-table-card">
          {loading ? (
            <p style={{ padding: "30px" }}>
              Loading discounts...
            </p>
          ) : discounts.length === 0 ? (
            <div
              style={{
                padding: "60px 30px",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  marginBottom: "8px",
                  color: "#292222",
                }}
              >
                No discounts yet
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#746c68",
                }}
              >
                Create your first promotion to offer customers
                a special price.
              </p>
            </div>
          ) : (
            <table className="discounts-table">
              <thead>
                <tr>
                  <th>Discount</th>

                  <th>Value</th>

                  <th>Products</th>

                  <th>Dates</th>

                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {discounts.map((discount) => (
                  <tr key={discount.discountId}>
                    <td>
                      <strong>{discount.name}</strong>
                    </td>

                    <td>
                      {Number(discount.discountValue).toLocaleString()}
                      {discount.discountType === "PERCENTAGE"
                        ? "%"
                        : " ETB"}
                    </td>

                    <td>
                      {discount.productDiscounts.length}
                    </td>

                    <td>
                      {new Date(
                        discount.startDate
                      ).toLocaleDateString()}{" "}
                      –{" "}
                      {new Date(
                        discount.endDate
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      <span className={discount.isActive ? "discount-status" : "discount-status discount-status-inactive"}>
                        {discount.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={discount.isActive ? "discount-action discount-action-deactivate" : "discount-action discount-action-activate"}
                        onClick={() => void updateDiscountStatus(discount)}
                        disabled={updatingDiscountId === discount.discountId}
                      >
                        {updatingDiscountId === discount.discountId
                          ? "Saving..."
                          : discount.isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
