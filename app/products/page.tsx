

"use client";

import Link from "next/link";
import { Suspense, type ReactNode, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import HorizontalCarousel from "../components/HorizontalCarousel";
type Product = {
  productId: string;
  productName: string;
  price: string | number;

  productDiscounts: {
    discount: {
      name: string;
      discountType: "PERCENTAGE" | "FIXED_AMOUNT";
      discountValue: string | number;
      startDate: string;
      endDate: string;
      isActive: boolean;
    };
  }[];

  category: {
    categoryName: string;
  };
  store: {
    storeName: string;
  };
  inventory: {
    quantity: number;
  } | null;
  images: {
    productImageId: string;
    imageUrl: string;
    isPrimary: boolean;
  }[];
};

const fallbackImages = [
  "/images/beauty.png",
  "/images/first.png",
  "/images/perfect.png",
  "/images/Foreign.png",
  "/images/secondPerfect.png",
];

function ProductCollection({
  categoryName,
  children,
}: {
  categoryName: string;
  children: ReactNode;
}) {
  if (categoryName === "All") {
    return <div className="all-products-grid">{children}</div>;
  }

  return (
    <HorizontalCarousel
      className="all-products-grid"
      label={`${categoryName} products`}
    >
      {children}
    </HorizontalCarousel>
  );
}

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const searchParams = useSearchParams();
const requestedCategory = searchParams.get("category");
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/marketplace/products");

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load products.");
          return;
        }

const loadedProducts: Product[] = data.products || [];
setProducts(loadedProducts);


const normalizedRequestedCategory = (requestedCategory || "").trim();

if (!normalizedRequestedCategory) {
  setSelectedCategory("All");
} else {
  const matchingCategory = loadedProducts.find(
    (product) =>
      product.category.categoryName.toLowerCase() ===
      normalizedRequestedCategory.toLowerCase()
  )?.category.categoryName;

  setSelectedCategory(
    matchingCategory || normalizedRequestedCategory
  );
}

      } catch (error) {
        console.error("Load marketplace products error:", error);
        setError("Something went wrong while loading products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [requestedCategory]);


const categories = useMemo(() => {
  // Use only real categories returned by the marketplace API. This prevents
  // a static button such as "Skincare" from appearing beside a database
  // category named "skincare" and confusing customers.
  const uniqueCategories = new Map<string, string>();
  for (const product of products) {
    const name = product.category.categoryName.trim();
    if (name) uniqueCategories.set(name.toLowerCase(), name);
  }
  return ["All", ...Array.from(uniqueCategories.values()).sort((a, b) => a.localeCompare(b))];
}, [products]);


  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") {
      return products;
    }

    return products.filter(
      (product) =>
        product.category.categoryName.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [products, selectedCategory]);

  return (
    <main className="products-page">

      {/* Header */}

      <section className="products-page-header">
        <div className="products-page-container">

          <p className="section-eyebrow">
            BEAUTYMART MARKETPLACE
          </p>

          <h1>
            Discover beauty
            <br />
            <span>your way.</span>
          </h1>

          <p>
            Browse beauty products from independent businesses and
            brands across Ethiopia.
          </p>

        </div>
      </section>

      {/* Products */}

      <section className="all-products-section">
        <div className="products-page-container">

          <div className="products-toolbar">

            <div className="product-category-tabs">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={
                    selectedCategory === category
                      ? "product-category-tab active"
                      : "product-category-tab"
                  }
                >
                  {category}
                </button>
              ))}
            </div>

            <span className="products-result-count">
              {filteredProducts.length} products
            </span>

          </div>

          {/* Loading */}

          {loading && (
            <div className="products-empty">
              <h3>Loading products...</h3>
              <p>
                Please wait while we load products from BeautyMart.
              </p>
            </div>
          )}

          {/* Error */}

          {!loading && error && (
            <div className="products-empty">
              <h3>Unable to load products</h3>
              <p>{error}</p>
            </div>
          )}

          {/* No products */}

          {!loading &&
            !error &&
            filteredProducts.length === 0 && (
              <div className="products-empty">
                <h3>No products found</h3>
                <p>
                  There are no products available in this category yet.
                </p>
              </div>
            )}

          {/* Product Grid */}

          {!loading && !error && filteredProducts.length > 0 && (
            <ProductCollection categoryName={selectedCategory}>

              {filteredProducts.map((product, index) => {
                const primaryImage = product.images.find(
                  (image) => image.isPrimary
                )?.imageUrl;

                const image =
                  primaryImage ||
                  fallbackImages[index % fallbackImages.length];

                return (
                  <Link
                    href={`/products/${product.productId}`}
                    className="all-product-card"
                    key={product.productId}
                  >

                    <div className="all-product-image">

                      <img
                        src={image}
                        alt={product.productName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />

                      <span className="all-product-wishlist">
                        ♡
                      </span>

                      <div className="all-product-overlay">
                        <span>View product →</span>
                      </div>

                    </div>

                    <div className="all-product-info">

                      <p className="all-product-store">
                        {product.store.storeName}
                      </p>

                      <h2>{product.productName}</h2>

                      <div className="all-product-bottom">

                        <span>
                          {product.category.categoryName}
                        </span>

                        {(() => {
  const now = new Date();

  const activeDiscount = product.productDiscounts?.find(
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

  if (!activeDiscount) {
    return (
      <strong>
        {originalPrice.toLocaleString()} ETB
      </strong>
    );
  }

  return (
    <span>
      <span
        style={{
          textDecoration: "line-through",
          color: "#999",
          marginRight: "8px",
        }}
      >
        {originalPrice.toLocaleString()} ETB
      </span>

      <strong>
        {finalPrice.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{" "}
        ETB
      </strong>

      <span
        style={{
          marginLeft: "8px",
          fontSize: "12px",
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
    </span>
  );
})()}

                      </div>

                    </div>

                  </Link>
                );
              })}

            </ProductCollection>
          )}

        </div>
      </section>

      </main>
  );
}

// Add this new function immediately below the code above.
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="products-page">
          <section className="all-products-section">
            <div className="products-page-container">
              <div className="products-empty">
                <h3>Loading products...</h3>
                <p>Please wait while we load products from BeautyMart.</p>
              </div>
            </div>
          </section>
        </main>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
