

import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import AddToCartButton from "../../components/AddToCartButton";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: {
      productId: id,
      
      isActive: true,
      store: {
        status: "ACTIVE",
      },
    },
    include: {
      category: true,
      store: {
        select: {
          storeId: true,
          storeName: true,
        },
      },
      inventory: {
        select: {
          quantity: true,
        },
      },
      images: {
        where: {
          isPrimary: true,
        },
        select: {
          productImageId: true,
          imageUrl: true,
          isPrimary: true,
        },
        take: 1,
      },
      productDiscounts: {
  include: {
    discount: true,
  },
},
    },
  });

  if (!product) {
    return (
      <main className="product-not-found">
        <div>
          <p className="section-eyebrow">BEAUTYMART</p>

          <h1>Product not found.</h1>

          <p>
            The product you are looking for does not exist or is no longer
            available.
          </p>

          <Link href="/products">
            ← Back to products
          </Link>
        </div>
      </main>
    );
  }

  const primaryImage = product.images[0]?.imageUrl;

  const stockQuantity = product.inventory?.quantity ?? 0;
const now = new Date();

const activeDiscount = product.productDiscounts.find(
  (productDiscount) => {
    const discount = productDiscount.discount;

    return (
      discount.isActive &&
      new Date(discount.startDate) <= now &&
      new Date(discount.endDate) >= now
    );
  }
);

const originalPrice = Number(product.price);

let finalPrice = originalPrice;

if (activeDiscount) {
  const discount = activeDiscount.discount;
  const discountValue = Number(discount.discountValue);

  if (discount.discountType === "PERCENTAGE") {
    finalPrice =
      originalPrice - (originalPrice * discountValue) / 100;
  } else {
    finalPrice = originalPrice - discountValue;
  }

  finalPrice = Math.max(0, finalPrice);
}
  return (
    <main className="product-detail-page">

      {/* Breadcrumb */}

      <div className="product-breadcrumb-container">
        <Link href="/products">
          Products
        </Link>

        <span>/</span>

        <Link href={`/stores/${product.store.storeId}`}>
          {product.store.storeName}
        </Link>

        <span>/</span>

        <span>{product.productName}</span>
      </div>

      {/* Product */}

      <section className="product-detail">

        <div className="product-detail-container">

          {/* Image */}

          <div className="product-detail-image">

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
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "64px",
                  background: "#f5f1ec",
                }}
              >
                ◇
              </div>
            )}

            <span className="product-detail-category">
              {product.category.categoryName}
            </span>

            <span className="product-detail-heart">
              ♡
            </span>

          </div>

          {/* Information */}

          <div className="product-detail-content">

            <Link
              href={`/stores/${product.store.storeId}`}
              className="product-store-link"
            >
              {product.store.storeName} →
            </Link>

            <p className="product-detail-category-text">
              {product.category.categoryName}
            </p>

            <h1>{product.productName}</h1>

            {activeDiscount ? (
  <div>
    <span
      style={{
        textDecoration: "line-through",
        color: "#999",
        marginRight: "10px",
      }}
    >
      {originalPrice.toLocaleString()} ETB
    </span>

    <strong className="product-detail-price">
      {finalPrice.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}{" "}
      ETB
    </strong>

    <span
      style={{
        marginLeft: "10px",
        fontSize: "14px",
        fontWeight: 600,
        color: "#8b4b68",
      }}
    >
      {activeDiscount.discount.discountType === "PERCENTAGE"
        ? `${Number(
            activeDiscount.discount.discountValue
          )}% OFF`
        : `${Number(
            activeDiscount.discount.discountValue
          ).toLocaleString()} ETB OFF`}
    </span>
  </div>
) : (
  <strong className="product-detail-price">
    {originalPrice.toLocaleString()} ETB
  </strong>
)}

            <div className="product-detail-divider"></div>

            <p className="product-detail-description">
              {product.description ||
                "A quality beauty product available from this BeautyMart store."}
            </p>

            {/* Stock */}

            <div className="product-quantity">

              <span>AVAILABILITY</span>

              <div className="quantity-control">
                <strong>
                  {stockQuantity > 0
                    ? `${stockQuantity} available`
                    : "Out of stock"}
                </strong>
              </div>

            </div>

            {/* Add to Cart */}

            {stockQuantity > 0 ? (
              <AddToCartButton
                product={{
                  id: product.productId,
                  name: product.productName,
                  price: finalPrice,
                  image: primaryImage || "",
                  store: product.store.storeName,
                   storeId: product.store.storeId,
                }}
              />
            ) : (
              <button
                type="button"
                disabled
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#ddd",
                  color: "#777",
                  fontWeight: 600,
                  cursor: "not-allowed",
                }}
              >
                Out of Stock
              </button>
            )}

            {/* Product details */}

            <div className="product-detail-features">

              <p className="product-features-title">
                PRODUCT DETAILS
              </p>

              <div className="product-feature">
                <span>+</span>
                <p>
                  Category: {product.category.categoryName}
                </p>
              </div>

              <div className="product-feature">
                <span>+</span>
                <p>
                  Sold by {product.store.storeName}
                </p>
              </div>

              <div className="product-feature">
                <span>+</span>
                <p>
                  {stockQuantity > 0
                    ? "Currently available"
                    : "Currently unavailable"}
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Store connection */}

      <section className="product-store-section">

        <div className="product-store-container">

          <div>

            <p className="section-eyebrow">
              SOLD BY
            </p>

            <h2>
              {product.store.storeName}
            </h2>

            <p>
              Explore more products from this BeautyMart business.
            </p>

          </div>

          <Link href={`/stores/${product.store.storeId}`}>
            Visit store →
          </Link>

        </div>

      </section>

    </main>
  );
}