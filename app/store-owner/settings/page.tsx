"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import "./settings.css";

type Store = {
  storeId: string;
  storeName: string;
  description: string | null;
  email: string;
  phone: string;
  address: string;
  status: string;
  logoUrl: string | null;
  bannerUrl: string | null;
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
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const uploadStoreImage = async (imageType: "logo" | "banner", file: File | undefined) => {
    if (!store || !file) return;
    setUploading(imageType); setError(""); setMessage("");
    try {
      const formData = new FormData();
      formData.set("storeId", store.storeId);
      formData.set("imageType", imageType);
      formData.set("image", file);
      const response = await fetch("/api/stores/image", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Image could not be uploaded.");
      setStore((current) => current ? { ...current, ...data.store } : current);
      setMessage(data.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Image could not be uploaded.");
    } finally { setUploading(null); }
  };

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
      setError(""); setMessage("");

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
        setError(data.message || "Failed to update store.");
        return;
      }

      setStore(data.store);

      setMessage("Store settings updated successfully.");
    } catch {
      setError("Something went wrong while updating the store.");
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

              {message ? <p className="settings-message" role="status">{message}</p> : null}
              {error ? <p className="settings-error" role="alert">{error}</p> : null}

              <section className="settings-images" aria-labelledby="store-images-heading">
                <div>
                  <h3 id="store-images-heading">Store branding</h3>
                  <p>Add a logo and cover image customers see on your public store page.</p>
                </div>
                <div className="settings-image-grid">
                  <label className="settings-image-upload">
                    <span>Store logo</span>
                    <div className="settings-logo-preview">
                      {store.logoUrl ? <Image src={store.logoUrl} alt="Current store logo" fill sizes="120px" /> : <strong>{store.storeName.slice(0, 1).toUpperCase()}</strong>}
                    </div>
                    <input className="settings-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadStoreImage("logo", event.target.files?.[0])} disabled={uploading !== null} />
                    <small>{uploading === "logo" ? "Uploading logo..." : "JPEG, PNG, or WebP · maximum 5 MB"}</small>
                  </label>
                  <label className="settings-image-upload">
                    <span>Store cover image</span>
                    <div className="settings-banner-preview">
                      {store.bannerUrl ? <Image src={store.bannerUrl} alt="Current store cover" fill sizes="420px" /> : <strong>Your store cover image</strong>}
                    </div>
                    <input className="settings-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadStoreImage("banner", event.target.files?.[0])} disabled={uploading !== null} />
                    <small>{uploading === "banner" ? "Uploading cover image..." : "Wide image recommended · JPEG, PNG, or WebP"}</small>
                  </label>
                </div>
              </section>

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
