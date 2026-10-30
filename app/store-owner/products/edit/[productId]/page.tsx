"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Product = {
  productId: string;
  productName: string;
  description: string | null;
  price: number | string;
  category: {
    categoryName: string;
  };
  inventory: {
    quantity: number;
    updatedAt: string;
  } | null;
  images?: {
    productImageId: string;
    imageUrl: string;
    isPrimary: boolean;
  }[];
};

const categories = [
  "Skincare",
  "Makeup",
  "Haircare",
  "Fragrance",
  "Body Care",
];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = String(params.productId);

  const [product, setProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Product
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const storesResponse = await fetch("/api/stores");

        if (!storesResponse.ok) {
          throw new Error("Unable to load your store.");
        }

        const storesData = await storesResponse.json();

        const store = storesData.stores?.[0];

        if (!store) {
          throw new Error("You do not have a store yet.");
        }

        const productsResponse = await fetch(
          `/api/products?storeId=${store.storeId}`
        );

        if (!productsResponse.ok) {
          const data = await productsResponse.json();

          throw new Error(
            data.message || "Unable to load products."
          );
        }

        const productsData = await productsResponse.json();

        const foundProduct = productsData.products?.find(
          (item: Product) => item.productId === productId
        );

        if (!foundProduct) {
          throw new Error("Product not found.");
        }

        setProduct(foundProduct);

        setName(foundProduct.productName);

        setCategory(foundProduct.category.categoryName);

        setPrice(String(foundProduct.price));

        setStock(
          foundProduct.inventory
            ? String(foundProduct.inventory.quantity)
            : "0"
        );

        setDescription(foundProduct.description || "");

   const primaryImage = foundProduct.images?.find(
  (image: NonNullable<Product["images"]>[number]) =>
    image.isPrimary
);
        if (primaryImage) {
          setImagePreview(primaryImage.imageUrl);
        } else if (foundProduct.images?.[0]) {
          setImagePreview(foundProduct.images[0].imageUrl);
        }
      } catch (error) {
        console.error("Load product error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  /*
  |--------------------------------------------------------------------------
  | Select Image
  |--------------------------------------------------------------------------
  */

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageError("");

    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be smaller than 5MB.");
      return;
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  /*
  |--------------------------------------------------------------------------
  | Upload Image
  |--------------------------------------------------------------------------
  */

  async function handleImageUpload() {
    if (!selectedImage) {
      setImageError("Please choose an image first.");
      return;
    }

    try {
      setUploadingImage(true);
      setImageError("");

      const formData = new FormData();

      formData.append("productId", productId);
      formData.append("image", selectedImage);

      const response = await fetch(
        "/api/products/image",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setImageError(
          data.message || "Failed to upload image."
        );

        return;
      }

      setSelectedImage(null);

      if (data.image?.imageUrl) {
        setImagePreview(data.image.imageUrl);
      }

      setProduct((currentProduct) => {
        if (!currentProduct) {
          return currentProduct;
        }

        return {
          ...currentProduct,
          images: [
            {
              productImageId:
                data.image.productImageId,
              imageUrl: data.image.imageUrl,
              isPrimary: true,
            },
          ],
        };
      });

      alert("Product image uploaded successfully.");
    } catch (error) {
      console.error("Image upload error:", error);

      setImageError(
        "Something went wrong while uploading the image."
      );
    } finally {
      setUploadingImage(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Save Changes
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!category.trim()) {
      setError("Category is required.");
      return;
    }

    if (!price || Number(price) < 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (
      !stock ||
      Number(stock) < 0 ||
      !Number.isInteger(Number(stock))
    ) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          productName: name,
          categoryName: category,
          price,
          quantity: stock,
          inventoryUpdatedAt: product?.inventory?.updatedAt,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to update product."
        );

        return;
      }

      alert("Product updated successfully.");

      router.push("/store-owner/products");
    } catch (error) {
      console.error("Update product error:", error);

      setError(
        "Something went wrong while updating the product."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f8f5f0",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "24px",
              padding: "60px 30px",
              textAlign: "center",
              boxShadow:
                "0 10px 40px rgba(80, 50, 40, 0.06)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                border: "4px solid #eadfe1",
                borderTopColor: "#8b4b5a",
                animation: "spin 1s linear infinite",
              }}
            />

            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "22px",
                color: "#2d2928",
              }}
            >
              Loading product
            </h2>

            <p
              style={{
                margin: 0,
                color: "#817a77",
              }}
            >
              Please wait while we load your product information.
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Product Not Found
  |--------------------------------------------------------------------------
  */

  if (!product) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f8f5f0",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "24px",
              padding: "50px 30px",
              textAlign: "center",
              boxShadow:
                "0 10px 40px rgba(80, 50, 40, 0.06)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                background: "#f5eeee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                color: "#8b4b5a",
              }}
            >
              !
            </div>

            <h1
              style={{
                margin: "0 0 10px",
                fontSize: "28px",
                color: "#2d2928",
              }}
            >
              Product Not Found
            </h1>

            <p
              style={{
                margin: "0 auto 26px",
                maxWidth: "500px",
                color: "#817a77",
                lineHeight: 1.6,
              }}
            >
              {error || "We could not find this product."}
            </p>

            <button
              type="button"
              onClick={() =>
                router.push("/store-owner/products")
              }
              style={{
                border: "none",
                borderRadius: "12px",
                padding: "13px 22px",
                background: "#8b4b5a",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Back to Products
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8f5f0",
        color: "#2d2928",
      }}
    >
      {/* ---------------------------------------------------------
          Top Navigation
      --------------------------------------------------------- */}

      <header
        style={{
          borderBottom: "1px solid #e9e1db",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "#8b4b5a",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "18px",
              }}
            >
              B
            </div>

            <div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                BeautyMart
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#8b817c",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Store Management
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/store-owner/products")
            }
            style={{
              border: "none",
              background: "transparent",
              color: "#6e4650",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ← Products
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------------
          Page Content
      --------------------------------------------------------- */}

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "44px 24px 70px",
        }}
      >
        {/* Breadcrumb */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "18px",
            fontSize: "13px",
            color: "#918883",
          }}
        >
          <button
            type="button"
            onClick={() =>
              router.push("/store-owner/products")
            }
            style={{
              border: "none",
              padding: 0,
              background: "transparent",
              color: "#8b4b5a",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Products
          </button>

          <span>/</span>

          <span>Edit Product</span>
        </div>

        {/* Page Heading */}

        <div
          style={{
            marginBottom: "34px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 12px",
              marginBottom: "14px",
              borderRadius: "999px",
              background: "#f1e6e8",
              color: "#8b4b5a",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Product Management
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(30px, 5vw, 44px)",
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              fontWeight: 700,
              color: "#2d2928",
            }}
          >
            Edit Product
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              maxWidth: "650px",
              fontSize: "16px",
              lineHeight: 1.6,
              color: "#817a77",
            }}
          >
            Update the information, pricing, inventory, and
            image for your beauty product.
          </p>
        </div>

        {/* Main Layout */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 300px",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* -----------------------------------------------------
              Form Card
          ----------------------------------------------------- */}

          <form
            onSubmit={handleSubmit}
            style={{
              background: "#fff",
              border: "1px solid #ebe3dd",
              borderRadius: "24px",
              boxShadow:
                "0 12px 40px rgba(80, 50, 40, 0.06)",
              overflow: "hidden",
            }}
          >
            {/* Form Header */}

            <div
              style={{
                padding: "28px 30px",
                borderBottom: "1px solid #eee7e1",
              }}
            >
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#2d2928",
                }}
              >
                Product Information
              </h2>

              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#918883",
                }}
              >
                Keep your product details accurate and up to date.
              </p>
            </div>

            <div
              style={{
                padding: "30px",
              }}
            >
              {/* Error */}

              {error && (
                <div
                  style={{
                    marginBottom: "24px",
                    padding: "13px 15px",
                    borderRadius: "12px",
                    border: "1px solid #f0c9c9",
                    background: "#fff5f5",
                    color: "#a33a3a",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </div>
              )}

              {/* -------------------------------------------------
                  Product Image
              ------------------------------------------------- */}

              <div
                style={{
                  marginBottom: "30px",
                  paddingBottom: "30px",
                  borderBottom: "1px solid #eee7e1",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "9px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#403b39",
                  }}
                >
                  Product Image
                </label>

                <p
                  style={{
                    margin: "0 0 15px",
                    fontSize: "12px",
                    color: "#918883",
                  }}
                >
                  Upload a clear image of your product. Maximum
                  size is 5MB.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "180px minmax(0, 1fr)",
                    gap: "20px",
                    alignItems: "center",
                  }}
                >
                  {/* Image Preview */}

                  <div
                    style={{
                      width: "180px",
                      height: "180px",
                      borderRadius: "18px",
                      overflow: "hidden",
                      border: "1px solid #e3dad4",
                      background: "#f7f3ef",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt={product.productName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          color: "#9c928d",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "30px",
                            marginBottom: "8px",
                          }}
                        >
                          🖼
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          No image
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}

                  <div>
                    <input
                      id="productImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{
                        display: "none",
                      }}
                    />

                    <label
                      htmlFor="productImage"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "12px 18px",
                        borderRadius: "11px",
                        border: "1px solid #ddd4ce",
                        background: "#fff",
                        color: "#5f5854",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Choose Image
                    </label>

                    {selectedImage && (
                      <div
                        style={{
                          marginTop: "12px",
                          fontSize: "13px",
                          color: "#5f5854",
                        }}
                      >
                        Selected:{" "}
                        <strong>
                          {selectedImage.name}
                        </strong>
                      </div>
                    )}

                    {imageError && (
                      <div
                        style={{
                          marginTop: "12px",
                          color: "#a33a3a",
                          fontSize: "13px",
                          lineHeight: 1.5,
                        }}
                      >
                        {imageError}
                      </div>
                    )}

                    {selectedImage && (
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={uploadingImage}
                        style={{
                          display: "block",
                          marginTop: "14px",
                          padding: "12px 18px",
                          borderRadius: "11px",
                          border: "none",
                          background: uploadingImage
                            ? "#b8949d"
                            : "#8b4b5a",
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: uploadingImage
                            ? "not-allowed"
                            : "pointer",
                          boxShadow:
                            "0 7px 16px rgba(139, 75, 90, 0.16)",
                        }}
                      >
                        {uploadingImage
                          ? "Uploading..."
                          : "Upload Image"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Name */}

              <div style={{ marginBottom: "24px" }}>
                <label
                  htmlFor="productName"
                  style={{
                    display: "block",
                    marginBottom: "9px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#403b39",
                  }}
                >
                  Product Name
                </label>

                <input
                  id="productName"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="e.g. Ethiopian Rose Face Cream"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "14px 15px",
                    borderRadius: "12px",
                    border: "1px solid #ddd4ce",
                    background: "#fdfcfb",
                    color: "#2d2928",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              {/* Category */}

              <div style={{ marginBottom: "24px" }}>
                <label
                  htmlFor="category"
                  style={{
                    display: "block",
                    marginBottom: "9px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#403b39",
                  }}
                >
                  Category
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "14px 15px",
                    borderRadius: "12px",
                    border: "1px solid #ddd4ce",
                    background: "#fdfcfb",
                    color: "#2d2928",
                    fontSize: "14px",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="">
                    Select a category
                  </option>

                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price + Stock */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "18px",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <label
                    htmlFor="price"
                    style={{
                      display: "block",
                      marginBottom: "9px",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#403b39",
                    }}
                  >
                    Price
                  </label>

                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(event) =>
                        setPrice(event.target.value)
                      }
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "14px 58px 14px 15px",
                        borderRadius: "12px",
                        border: "1px solid #ddd4ce",
                        background: "#fdfcfb",
                        color: "#2d2928",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />

                    <span
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#8b4b5a",
                      }}
                    >
                      ETB
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    style={{
                      display: "block",
                      marginBottom: "9px",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#403b39",
                    }}
                  >
                    Stock Quantity
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
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "14px 15px",
                      borderRadius: "12px",
                      border: "1px solid #ddd4ce",
                      background: "#fdfcfb",
                      color: "#2d2928",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Description */}

              <div style={{ marginBottom: "30px" }}>
                <label
                  htmlFor="description"
                  style={{
                    display: "block",
                    marginBottom: "9px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#403b39",
                  }}
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={6}
                  placeholder="Describe the product, its benefits, ingredients, or other useful information..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "14px 15px",
                    borderRadius: "12px",
                    border: "1px solid #ddd4ce",
                    background: "#fdfcfb",
                    color: "#2d2928",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    outline: "none",
                    resize: "vertical",
                  }}
                />

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "12px",
                    color: "#a29a95",
                  }}
                >
                  A clear description helps customers understand
                  your product.
                </p>
              </div>

              {/* Buttons */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  paddingTop: "24px",
                  borderTop: "1px solid #eee7e1",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    router.push("/store-owner/products")
                  }
                  disabled={saving || uploadingImage}
                  style={{
                    padding: "13px 20px",
                    borderRadius: "12px",
                    border: "1px solid #ddd4ce",
                    background: "#fff",
                    color: "#5f5854",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor:
                      saving || uploadingImage
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      saving || uploadingImage ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  style={{
                    minWidth: "150px",
                    padding: "13px 20px",
                    borderRadius: "12px",
                    border: "none",
                    background:
                      saving || uploadingImage
                        ? "#b8949d"
                        : "#8b4b5a",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor:
                      saving || uploadingImage
                        ? "not-allowed"
                        : "pointer",
                    boxShadow:
                      "0 8px 18px rgba(139, 75, 90, 0.18)",
                  }}
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </div>
          </form>

          {/* -----------------------------------------------------
              Product Summary
          ----------------------------------------------------- */}

          <aside
            style={{
              background: "#2f2928",
              borderRadius: "24px",
              padding: "26px",
              color: "#fff",
              boxShadow:
                "0 12px 40px rgba(40, 30, 25, 0.12)",
            }}
          >
            {/* Summary Image */}

            <div
              style={{
                width: "100%",
                height: "210px",
                marginBottom: "22px",
                borderRadius: "18px",
                overflow: "hidden",
                background: "rgba(255,255,255,0.08)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={product.productName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a99d98",
                    fontSize: "13px",
                  }}
                >
                  No product image
                </div>
              )}
            </div>

            <div
              style={{
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  margin: "0 0 7px",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#c9a9b0",
                  fontWeight: 700,
                }}
              >
                Currently Editing
              </p>

              <h3
                style={{
                  margin: 0,
                  fontSize: "22px",
                  lineHeight: 1.25,
                }}
              >
                {product.productName}
              </h3>
            </div>

            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.12)",
                marginBottom: "22px",
              }}
            />

            <div
              style={{
                display: "grid",
                gap: "18px",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 5px",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#a99d98",
                  }}
                >
                  Current Category
                </p>

                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {product.category.categoryName}
                </p>
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 5px",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#a99d98",
                  }}
                >
                  Current Price
                </p>

                <p
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#e6cbd0",
                  }}
                >
                  {Number(product.price).toLocaleString()} ETB
                </p>
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 5px",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#a99d98",
                  }}
                >
                  Current Stock
                </p>

                <p
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  {product.inventory?.quantity ?? 0}

                  <span
                    style={{
                      marginLeft: "5px",
                      fontSize: "12px",
                      color: "#a99d98",
                      fontWeight: 400,
                    }}
                  >
                    units
                  </span>
                </p>
              </div>
            </div>

            <div
              style={{
                marginTop: "28px",
                padding: "16px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.07)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  lineHeight: 1.6,
                  color: "#c6bcb8",
                }}
              >
                Changes you save here will immediately update
                this product in your store.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* ---------------------------------------------------------
          Responsive behavior
      --------------------------------------------------------- */}

      <style jsx>{`
        @media (max-width: 800px) {
          main > div {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }

        @media (max-width: 700px) {
          div[style*="grid-template-columns: minmax(0, 1fr) 300px"] {
            display: block !important;
          }

          div[style*="grid-template-columns: repeat(2, minmax(0, 1fr))"] {
            grid-template-columns: 1fr !important;
          }

          div[style*="grid-template-columns: 180px minmax(0, 1fr)"] {
            grid-template-columns: 1fr !important;
          }

          aside {
            margin-top: 20px;
          }
        }

        @media (max-width: 520px) {
          header div {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          form > div:last-child {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }

          form > div:first-child {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }

          form button {
            width: 100%;
          }

          form div[style*="justify-content: flex-end"] {
            flex-direction: column-reverse;
          }
        }
      `}</style>
    </main>
  );
}
