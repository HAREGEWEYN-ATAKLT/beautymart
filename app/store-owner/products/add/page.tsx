
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./add-product.css";

export default function AddProductPage() {
  const router = useRouter();

  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<
  { categoryId: string; categoryName: string }[]
>([]);
const [loadingCategories, setLoadingCategories] = useState(true);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loadingStore, setLoadingStore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
const [createdProductId, setCreatedProductId] =
  useState<string | null>(null);
  // ==================================================
  // LOAD STORE
  // ==================================================
  useEffect(() => {
    async function loadStore() {
      try {
        const response = await fetch("/api/stores");
        const data = await response.json();

        if (!response.ok) {
          setMessage(
            data.message || "Could not load your store."
          );
          return;
        }

        if (!data.stores || data.stores.length === 0) {
          setMessage("You do not have a store yet.");
          return;
        }

        // For now:
        // One Store Owner = One Store
        const store = data.stores[0];

        setStoreId(store.storeId);
        setStoreName(store.storeName);
      } catch (error) {
        console.error("Store loading error:", error);
        setMessage(
          "Something went wrong while loading your store."
        );
      } finally {
        setLoadingStore(false);
      }
    }

    loadStore();
  }, []);

  // LOAD CATEGORIES FROM THE DATABASE
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/store-owner/categories");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load categories.");
        }

        setCategories(data.categories ?? []);
      } catch (error) {
        console.error("Category loading error:", error);
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to load categories."
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    void loadCategories();
  }, []);

  // ==================================================
  // IMAGE SELECTION
  // ==================================================
  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Only images
    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    // Maximum 5MB
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be smaller than 5MB.");
      return;
    }

    setMessage("");
    setImage(file);

    // Show local preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  // ==================================================
  // CREATE PRODUCT
  // ==================================================
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    if (!storeId) {
      setMessage("Your store could not be found.");
      return;
    }

    if (!name.trim()) {
      setMessage("Product name is required.");
      return;
    }

    if (!category) {
      setMessage("Please select a category.");
      return;
    }

    if (!price) {
      setMessage("Product price is required.");
      return;
    }

    if (!stock) {
      setMessage("Initial stock is required.");
      return;
    }

    setLoading(true);

    try {
      // ==================================================
      // // STEP 1: CREATE PRODUCT
      // // ==================================================
      // const productResponse = await fetch("/api/products", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     storeId,
      //     productName: name,
      //     categoryName: category,
      //     description,
      //     price,
      //     quantity: stock,
      //   }),
      // });

      // const productData = await productResponse.json();

      // if (!productResponse.ok) {
      //   setMessage(
      //     productData.message ||
      //       "Failed to create product."
      //   );
      //   return;
      // }

      // // Get newly created product ID
      // const productId = productData.product?.productId;

      // if (!productId) {
      //   setMessage(
      //     "Product was created, but its ID could not be found."
      //   );
      //   return;
      // }

      // STEP 1: CREATE PRODUCT ONLY IF IT DOES NOT EXIST YET
      let productId = createdProductId;

      if (!productId) {
        const productResponse = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storeId,
            productName: name,
            categoryName: category,
            description,
            price,
            quantity: stock,
          }),
        });

        const productData = await productResponse.json();

        if (!productResponse.ok) {
          setMessage(
            productData.message || "Failed to create product."
          );
          return;
        }

        productId = productData.product?.productId;

        if (!productId) {
          setMessage(
            "The product may have been created. Please check your Products page before trying again."
          );
          return;
        }

        setCreatedProductId(productId);
      }
      // ==================================================
      // STEP 2: UPLOAD IMAGE
      // ==================================================
      if (image) {
        const formData = new FormData();

        formData.append("productId", productId);
        formData.append("image", image);

        const imageResponse = await fetch(
          "/api/products/image",
          {
            method: "POST",
            body: formData,
          }
        );

        const imageData = await imageResponse.json();

    if (!imageResponse.ok) {
  setMessage(
    `Your product is saved, but the image upload failed. ${
      imageData.message || "Please try again."
    } Your next attempt will retry the image upload without creating another product.`
  );
  return;
}
      }

      // ==================================================
      // STEP 3: SUCCESS
      // ==================================================
      router.push("/store-owner/products");
    } catch (error) {
      console.error("Create product error:", error);

      setMessage(
        "Something went wrong while creating the product."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="add-product-page">
      {/* ================================================
          NAVBAR
      ================================================ */}
      <nav className="add-product-navbar">
        <div className="add-product-navbar-inner">
          <div className="add-product-brand">
            <div className="add-product-logo">B</div>

            <div>
              <h1>BeautyMart</h1>
              <p>Store Management</p>
            </div>
          </div>

          <Link
            href="/store-owner/products"
            className="add-product-back"
          >
            ← Products
          </Link>
        </div>
      </nav>

      {/* ================================================
          MAIN
      ================================================ */}
      <div className="add-product-main">
        <div className="add-product-container">
          {/* ==============================================
              PAGE HEADER
          ============================================== */}
          <div className="add-product-header">
            <p className="add-product-label">
              Product Management
            </p>

            <h2>Add New Product</h2>

            <p>
              Add a beauty product to your store with its
              price, inventory, category, description, and
              product image.
            </p>
          </div>

          {/* ==============================================
              ERROR MESSAGE
          ============================================== */}
          {message && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px 16px",
                borderRadius: "11px",
                border: "1px solid #efcaca",
                background: "#fff5f5",
                color: "#a33a3a",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {message}
            </div>
          )}

          {/* ==============================================
              PRODUCT CARD
          ============================================== */}
          <div className="add-product-card">
            {/* Card Header */}
            <div className="add-product-card-header">
              <h3>Product Information</h3>

              <p>
                Fill in the details below to create your
                product.
              </p>
            </div>

            {/* Form */}
            <form
              className="add-product-form"
              onSubmit={handleSubmit}
            >
              {/* ==========================================
                  PRODUCT INFORMATION GRID
              ========================================== */}
              <div className="add-product-grid">
                {/* Store */}
                <div className="add-product-group full-width">
                  <label>
                    Store <span>*</span>
                  </label>

                  <input
                    type="text"
                    value={
                      loadingStore
                        ? "Loading store..."
                        : storeName
                    }
                    readOnly
                  />
                </div>

                {/* Product Name */}
                <div className="add-product-group full-width">
                  <label htmlFor="productName">
                    Product Name <span>*</span>
                  </label>

                  <input
                    id="productName"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="e.g. Matte Lipstick"
                  />
                </div>

                {/* Category */}
                <div className="add-product-group">
                  <label htmlFor="category">
                    Category <span>*</span>
                  </label>

                  
                
<select
  id="category"
  value={category}
  onChange={(event) => setCategory(event.target.value)}
  disabled={loadingCategories}
  required
>
  <option value="">
    {loadingCategories ? "Loading categories..." : "Select a category"}
  </option>

  {categories.map((item) => (
    <option key={item.categoryId} value={item.categoryName}>
      {item.categoryName}
    </option>
  ))}
</select>

                
                </div>

                {/* Price */}
                <div className="add-product-group">
                  <label htmlFor="price">
                    Price (ETB) <span>*</span>
                  </label>

                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) =>
                      setPrice(event.target.value)
                    }
                    placeholder="e.g. 299.99"
                  />
                </div>

                {/* Initial Stock */}
                <div className="add-product-group">
                  <label htmlFor="stock">
                    Initial Stock <span>*</span>
                  </label>

                  <input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={stock}
                    onChange={(event) =>
                      setStock(event.target.value)
                    }
                    placeholder="e.g. 20"
                  />
                </div>

                {/* Description */}
                <div className="add-product-group full-width">
                  <label htmlFor="description">
                    Product Description
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Describe your beauty product..."
                  />
                </div>
              </div>

              {/* ==========================================
                  PRODUCT IMAGE
              ========================================== */}
              <div className="product-image-section">
                <div>
                  <h3>Product Image</h3>

                  <p>
                    Add a clear image of your beauty
                    product.
                  </p>
                </div>

                <div className="image-upload-box">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        style={{
                          width: "100%",
                          maxWidth: "320px",
                          height: "220px",
                          objectFit: "cover",
                          display: "block",
                          margin: "0 auto 18px",
                          borderRadius: "12px",
                        }}
                      />

                      <h4>
                        {image?.name}
                      </h4>

                      <p>
                        Image selected successfully
                      </p>

                      <label
                        htmlFor="productImage"
                        className="image-upload-button"
                      >
                        Change Image
                      </label>
                    </>
                  ) : (
                    <>
                      <div className="image-upload-icon">
                        ↑
                      </div>

                      <h4>
                        Upload Product Image
                      </h4>

                      <p>
                        PNG, JPG or WEBP
                      </p>

                      <label
                        htmlFor="productImage"
                        className="image-upload-button"
                      >
                        Choose Image
                      </label>
                    </>
                  )}

                  <input
                    id="productImage"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              {/* ==========================================
                  FOOTER ACTIONS
              ========================================== */}
              <div className="add-product-footer">
                <Link
                  href="/store-owner/products"
                  className="add-product-cancel"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="add-product-submit"
                  disabled={loading || loadingStore}
                  style={{
                    opacity:
                      loading || loadingStore ? 0.6 : 1,
                    cursor:
                      loading || loadingStore
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {loading
                    ? image
                      ? "Creating & Uploading..."
                      : "Creating Product..."
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}