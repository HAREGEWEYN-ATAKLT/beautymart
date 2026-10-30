
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
  const [createdStore, setCreatedStore] = useState<{ storeId: string; storeName: string } | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingBranding, setUploadingBranding] = useState(false);

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

      setCreatedStore({ storeId: data.store.storeId, storeName: data.store.storeName });
      setSuccess("Your store was created. Add its branding now, or do it later in Settings.");
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

  const uploadBrandingAndContinue = async () => {
    if (!createdStore) return;
    setUploadingBranding(true); setError("");
    try {
      for (const [imageType, file] of [["logo", logoFile], ["banner", bannerFile]] as const) {
        if (!file) continue;
        const formData = new FormData();
        formData.set("storeId", createdStore.storeId);
        formData.set("imageType", imageType);
        formData.set("image", file);
        const response = await fetch("/api/stores/image", { method: "POST", body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "An image could not be uploaded.");
      }
      router.push("/store-owner/settings");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Store created, but branding could not be uploaded. You can try again in Settings.");
    } finally { setUploadingBranding(false); }
  };

  if (createdStore) {
    return (
      <div className="create-store-page">
        <header className="create-store-navbar"><div className="create-store-navbar-inner"><div className="create-brand"><div className="create-brand-logo">B</div><div><h1 className="create-brand-name">BeautyMart</h1><p className="create-brand-subtitle">Store Management</p></div></div></div></header>
        <main className="create-store-main"><div className="create-store-container"><div className="create-store-header"><p className="create-store-label">Store created</p><h2 className="create-store-title">Make your store recognizable.</h2><p className="create-store-description">A logo and wide cover image make your public store page feel like your real beauty brand.</p></div>
          <section className="create-store-card"><div className="create-store-card-header"><h3 className="create-store-card-title">{createdStore.storeName} branding</h3><p className="create-store-card-description">Both images are optional. You can change them later from Settings.</p></div><div className="create-store-form">
            {success ? <div className="form-success" role="status">{success}</div> : null}{error ? <div className="form-error" role="alert">{error}</div> : null}
            <div className="create-branding-grid">
              <label className="create-image-upload"><span>Store logo</span><strong>{logoFile ? logoFile.name : "Choose a square logo"}</strong><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} /><small>JPEG, PNG, or WebP · maximum 5 MB</small></label>
              <label className="create-image-upload"><span>Store cover image</span><strong>{bannerFile ? bannerFile.name : "Choose a wide cover image"}</strong><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setBannerFile(event.target.files?.[0] ?? null)} /><small>This appears at the top of your public store page.</small></label>
            </div>
            <div className="form-footer"><p className="form-footer-note">You can skip this now and add branding later in Store Settings.</p><div className="form-actions"><button type="button" className="cancel-button" onClick={() => router.push("/store-owner")}>Skip for now</button><button type="button" className="create-button" disabled={uploadingBranding} onClick={() => void uploadBrandingAndContinue()}>{uploadingBranding ? "Uploading..." : "Save branding"}</button></div></div>
          </div></section></div></main>
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
