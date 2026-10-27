
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import "./create-store.css";

export default function CreateStorePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch("/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeName,
          description,
          email,
          phone,
          address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create store.");
        return;
      }

      setSuccess("Store created successfully!");

      setTimeout(() => {
        router.push("/store-owner");
        router.refresh();
      }, 1200);
    } catch (error) {
      console.error("Create store error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="create-store-page">
        <main className="create-store-main">
          <div className="create-store-container">
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="create-store-page">
        <main className="create-store-main">
          <div className="create-store-container">
            <div className="create-store-card">
              <div className="create-store-card-header">
                <h2 className="create-store-card-title">
                  You must be logged in
                </h2>

                <p className="create-store-card-description">
                  Please sign in before creating a store.
                </p>
              </div>

              <div className="create-store-form">
                <Link href="/login" className="create-button">
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="create-store-page">
      <header className="create-store-navbar">
        <div className="create-store-navbar-inner">
          <div className="create-brand">
            <div className="create-brand-logo">B</div>

            <div>
              <h1 className="create-brand-name">BeautyMart</h1>
              <p className="create-brand-subtitle">Store Management</p>
            </div>
          </div>

          <Link href="/store-owner" className="back-dashboard">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="create-store-main">
        <div className="create-store-container">
          <div className="create-store-header">
            <p className="create-store-label">Store Management</p>

            <h2 className="create-store-title">
              Create a New Store
            </h2>

            <p className="create-store-description">
              Set up another beauty store on BeautyMart and start managing
              products, orders, inventory, and customers from one platform.
            </p>
          </div>

          <div className="create-store-card">
            <div className="create-store-card-header">
              <h3 className="create-store-card-title">
                Store Information
              </h3>

              <p className="create-store-card-description">
                Enter the basic information for your new beauty store.
              </p>
            </div>

            <form
              className="create-store-form"
              onSubmit={handleSubmit}
            >
              {success && (
                <div className="form-success">
                  {success}
                </div>
              )}

              {error && (
                <div className="form-error">
                  {error}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="storeName">
                    Store Name <span>*</span>
                  </label>

                  <input
                    id="storeName"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Habesha Beauty"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    Store Email <span>*</span>
                  </label>

                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="store@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    Phone Number <span>*</span>
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    className="form-input"
                    placeholder="+251 9XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="address">
                    Store Address <span>*</span>
                  </label>

                  <input
                    id="address"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bole, Addis Ababa"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label" htmlFor="description">
                    Store Description
                  </label>

                  <textarea
                    id="description"
                    className="form-textarea"
                    placeholder="Tell customers a little about your beauty store..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />

                  <p className="form-help">
                    A short description helps customers understand what your
                    store offers.
                  </p>
                </div>
              </div>

              <div className="form-footer">
                <p className="form-footer-note">
                  You can update your store information later from Store
                  Settings.
                </p>

                <div className="form-actions">
                  <Link
                    href="/store-owner"
                    className="cancel-button"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    className="create-button"
                    disabled={loading}
                  >
                    {loading ? "Creating Store..." : "Create Store"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="create-store-info">
            <div className="info-card">
              <div className="info-icon">◇</div>

              <h3>Manage Products</h3>

              <p>
                Add beauty products, prices, images, categories, and
                inventory.
              </p>
            </div>

            <div className="info-card">
              <div className="info-icon">▤</div>

              <h3>Manage Orders</h3>

              <p>
                Receive customer orders and manage them from your dashboard.
              </p>
            </div>

            <div className="info-card">
              <div className="info-icon">↗</div>

              <h3>Track Performance</h3>

              <p>
                Monitor your store performance, sales, and customer activity.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}