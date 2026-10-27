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
        }
      } catch (error) {
        console.error("Load discounts error:", error);
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
{showForm && (
  <div
    style={{
      marginTop: "30px",
      background: "#fff",
      padding: "30px",
      borderRadius: "16px",
    }}
  >
    <h2 style={{ marginTop: 0 }}>Create Discount</h2>

   <div style={{ display: "grid", gap: "16px" }}>
  <div>
    <label>Discount Name</label>
    <input
      type="text"
      placeholder="e.g. Summer Beauty Sale"
      value={discountName}
onChange={(event) => setDiscountName(event.target.value)}
      style={{
        display: "block",
        width: "100%",
        padding: "12px",
        marginTop: "6px",
      }}
    />
  </div>

  <div>
    <label>Discount Type</label>
    <select
    value={discountType}
onChange={(event) =>
  setDiscountType(
    event.target.value as "PERCENTAGE" | "FIXED_AMOUNT"
  )
}
      style={{
        display: "block",
        width: "100%",
        padding: "12px",
        marginTop: "6px",
      }}
      
    >
      <option value="PERCENTAGE">Percentage (%)</option>
      <option value="FIXED_AMOUNT">Fixed Amount (ETB)</option>
    </select>
  </div>

  <div>
    <label>Discount Value</label>
    <input
      type="number"
      placeholder="e.g. 10"
      min="1"
      value={discountValue}
onChange={(event) => setDiscountValue(event.target.value)}
      style={{
        display: "block",
        width: "100%",
        padding: "12px",
        marginTop: "6px",
      }}
    />
  </div>

  <div>
    <label>Start Date</label>
    <input
      type="date"
       value={startDate}
  onChange={(event) => setStartDate(event.target.value)}
      style={{
        display: "block",
        width: "100%",
        padding: "12px",
        marginTop: "6px",
      }}
    />
  </div>

  <div>
    <label>End Date</label>
    <input
      type="date"
       value={endDate}
  onChange={(event) => setEndDate(event.target.value)}
      style={{
        display: "block",
        width: "100%",
        padding: "12px",
        marginTop: "6px",
      }}
    />
  </div>

  <div>
  <label>Select Products</label>

  <div
    style={{
      marginTop: "8px",
      display: "grid",
      gap: "10px",
    }}
  >
    {products.map((product) => (
      <label
        key={product.productId}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
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
<button
  type="button"
  onClick={async () => {
    try {
      const storesResponse = await fetch("/api/stores");
      const storesData = await storesResponse.json();

      if (!storesResponse.ok || !storesData.stores?.length) {
        alert("Store not found.");
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
        alert(data.message || "Failed to create discount.");
        return;
      }

      alert("Discount created successfully.");

      setDiscounts((current) => [data.discount, ...current]);
      setShowForm(false);

      setDiscountName("");
      setDiscountType("PERCENTAGE");
      setDiscountValue("");
      setStartDate("");
      setEndDate("");
      setSelectedProductIds([]);
    } catch (error) {
      console.error("Create discount error:", error);
      alert("Something went wrong while creating the discount.");
    }
  }}
>
  Create Discount
</button>
    <button
      type="button"
      onClick={() => setShowForm(false)}
    >
      Cancel
    </button>
  </div>
)}
        <div
          style={{
            marginTop: "30px",
            background: "#fff",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th style={{ padding: "18px", textAlign: "left" }}>
                    Discount
                  </th>

                  <th style={{ padding: "18px", textAlign: "left" }}>
                    Value
                  </th>

                  <th style={{ padding: "18px", textAlign: "left" }}>
                    Products
                  </th>

                  <th style={{ padding: "18px", textAlign: "left" }}>
                    Dates
                  </th>

                  <th style={{ padding: "18px", textAlign: "left" }}>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {discounts.map((discount) => (
                  <tr key={discount.discountId}>
                    <td style={{ padding: "18px" }}>
                      <strong>{discount.name}</strong>
                    </td>

                    <td style={{ padding: "18px" }}>
                      {Number(discount.discountValue).toLocaleString()}
                      {discount.discountType === "PERCENTAGE"
                        ? "%"
                        : " ETB"}
                    </td>

                    <td style={{ padding: "18px" }}>
                      {discount.productDiscounts.length}
                    </td>

                    <td style={{ padding: "18px" }}>
                      {new Date(
                        discount.startDate
                      ).toLocaleDateString()}{" "}
                      –{" "}
                      {new Date(
                        discount.endDate
                      ).toLocaleDateString()}
                    </td>

                    <td style={{ padding: "18px" }}>
                      {discount.isActive
                        ? "Active"
                        : "Inactive"}
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