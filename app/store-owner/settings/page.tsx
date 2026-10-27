"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./settings.css";

type Store = {
  storeId: string;
  storeName: string;
  description: string | null;
  email: string;
  phone: string;
  address: string;
  status: string;
};

export default function StoreSettingsPage() {
  const [store, setStore] = useState<Store | null>(null);

  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadStore = async () => {
      try {
        const response = await fetch("/api/stores");
        const data = await response.json();

        if (!response.ok || !data.stores?.length) {
          return;
        }

        const ownerStore = data.stores[0];

        setStore(ownerStore);
        setStoreName(ownerStore.storeName || "");
        setDescription(ownerStore.description || "");
        setEmail(ownerStore.email || "");
        setPhone(ownerStore.phone || "");
        setAddress(ownerStore.address || "");
      } catch (error) {
        console.error("Load store settings error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, []);

  const handleSave = async () => {
    if (!store) {
      alert("Store not found.");
      return;
    }

    if (!storeName.trim()) {
      alert("Store name is required.");
      return;
    }

    if (!email.trim()) {
      alert("Store email is required.");
      return;
    }

    if (!phone.trim()) {
      alert("Store phone is required.");
      return;
    }

    if (!address.trim()) {
      alert("Store address is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/stores", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: store.storeId,
          storeName: storeName.trim(),
          description: description.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update store.");
        return;
      }

      setStore(data.store);

      alert("Store settings updated successfully.");
    } catch (error) {
      console.error("Update store settings error:", error);
      alert("Something went wrong while updating the store.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="settings-page">
      <div className="settings-container">

        <Link
          href="/store-owner"
          className="settings-back"
        >
          ← Back to Dashboard
        </Link>

        <div className="settings-header">
          <div>
            <p className="settings-eyebrow">
              Store Management
            </p>

            <h1 className="settings-title">
              Settings
            </h1>

            <p className="settings-description">
              Manage your store information and business details.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="settings-card settings-loading">
            Loading store settings...
          </div>
        ) : !store ? (
          <div className="settings-card settings-empty">
            <h2>No store found</h2>

            <p>
              Create a store before managing its settings.
            </p>

            <Link
              href="/store-owner/create-store"
              className="settings-primary-button"
            >
              Create Store
            </Link>
          </div>
        ) : (
          <div className="settings-card">

            <div className="settings-section-header">
              <div>
                <h2>Business Information</h2>

                <p>
                  Update the information customers see about your store.
                </p>
              </div>

              <span className="settings-status">
                {store.status}
              </span>
            </div>

            <div className="settings-form">

              <div className="settings-field">
                <label htmlFor="storeName">
                  Store Name
                </label>

                <input
                  id="storeName"
                  type="text"
                  value={storeName}
                  onChange={(event) =>
                    setStoreName(event.target.value)
                  }
                  placeholder="Enter your store name"
                />
              </div>

              <div className="settings-field">
                <label htmlFor="description">
                  Store Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe your beauty business"
                  rows={5}
                />
              </div>

              <div className="settings-two-column">

                <div className="settings-field">
                  <label htmlFor="email">
                    Store Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="store@example.com"
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="phone">
                    Store Phone
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="+251..."
                  />
                </div>

              </div>

              <div className="settings-field">
                <label htmlFor="address">
                  Store Address
                </label>

                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  placeholder="Enter your business address"
                />
              </div>

              <div className="settings-actions">

                <button
                  type="button"
                  className="settings-cancel-button"
                  onClick={() => {
                    setStoreName(store.storeName || "");
                    setDescription(store.description || "");
                    setEmail(store.email || "");
                    setPhone(store.phone || "");
                    setAddress(store.address || "");
                  }}
                >
                  Reset
                </button>

                <button
                  type="button"
                  className="settings-primary-button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}