// import Image from "next/image";
// import Link from "next/link";

// const products = [
//   {
//     id: "radiance-glow-serum",
//     name: "Radiance Glow Serum",
//     store: "Mimi Beauty",
//     category: "Skincare",
//     price: "850 ETB",
//     image: "/images/beauty.png",
//   },
//   {
//     id: "velvet-matte-lipstick",
//     name: "Velvet Matte Lipstick",
//     store: "Nile Cosmetics",
//     category: "Makeup",
//     price: "650 ETB",
//     image: "/images/first.png",
//   },
//   {
//     id: "natural-hair-treatment",
//     name: "Natural Hair Treatment",
//     store: "Natural Glow",
//     category: "Haircare",
//     price: "950 ETB",
//     image: "/images/perfect.png",
//   },
//   {
//     id: "signature-bloom-perfume",
//     name: "Signature Bloom Perfume",
//     store: "Mimi Beauty",
//     category: "Fragrance",
//     price: "1,450 ETB",
//     image: "/images/Foreign.png",
//   },
// ];

// export default function TrendingProducts() {
//   return (
//     <section className="products-section">
//       <div className="products-container">

//         <div className="products-heading">
//           <div>
//             <p className="section-eyebrow">TRENDING NOW</p>

//             <h2>
//               Beauty worth
//               <br />
//               <span>discovering.</span>
//             </h2>
//           </div>

//           <Link href="/products" className="products-view-all">
//             Shop all products →
//           </Link>
//         </div>

//         <div className="products-grid">
//           {products.map((product) => (
//            <Link
//   href={`/products/${product.id}`}
//   className="product-card"
//   key={product.id}
// >
//               <div className="product-image">

//                 <Image
//                   src={product.image}
//                   alt={product.name}
//                   fill
//                   sizes="(max-width: 700px) 50vw, 25vw"
//                 />

//                 <span className="product-badge">
//                   TRENDING
//                 </span>

//                 <span
//                   className="product-wishlist"
//                   aria-hidden="true"
//                 >
//                   ♡
//                 </span>

//                 <div className="product-overlay">
//                   <span>View product →</span>
//                 </div>

//               </div>

//               <div className="product-info">
//                 <p className="product-store">
//                   {product.store}
//                 </p>

//                 <h3>{product.name}</h3>

//                 <p className="product-category">
//                   {product.category}
//                 </p>

//                 <strong className="product-price">
//                   {product.price}
//                 </strong>
//               </div>
//             </Link>
//           ))}
//         </div>

//       </div>
//     </section>
//   );
// }


"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type MarketplaceProduct = {
  productId: string;
  productName: string;
  price: number;
  category?: {
    categoryName: string;
  } | null;
  store?: {
    storeName: string;
  } | null;
  images?: {
    productImageId: string;
    imageUrl: string;
    isPrimary: boolean;
  }[];
};

export default function TrendingProducts() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("/api/marketplace/products", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Could not load marketplace products.");
        }

        const data = await response.json();
        setProducts(Array.isArray(data.products) ? data.products.slice(0, 4) : []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(true);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  return (
    <section className="products-section">
      <div className="products-container">
        <div className="products-heading">
          <div>
            <p className="section-eyebrow">TRENDING NOW</p>

            <h2>
              Beauty worth
              <br />
              <span>discovering.</span>
            </h2>
          </div>

          <Link href="/products" className="products-view-all">
            Shop all products →
          </Link>
        </div>

        {loading ? (
          <p>Discovering beauty products...</p>
        ) : error ? (
          <p>Products could not be loaded. Please try again later.</p>
        ) : products.length === 0 ? (
          <p>
            New beauty products are coming soon. Please check back later.
          </p>
        ) : (
          <div className="products-grid">
            {products.map((product) => {
              const image =
                product.images?.find((item) => item.isPrimary)?.imageUrl ||
                product.images?.[0]?.imageUrl;

              return (
                <Link
                  href={`/products/${product.productId}`}
                  className="product-card"
                  key={product.productId}
                >
                  <div className="product-image">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.productName}
                        fill
                        sizes="(max-width: 700px) 50vw, 25vw"
                      />
                    ) : (
                      <div
                        className="product-image-placeholder"
                        aria-label="No product image available"
                      >
                        BeautyMart
                      </div>
                    )}

                    <span className="product-badge">TRENDING</span>

                    <span
                      className="product-wishlist"
                      aria-hidden="true"
                    >
                      ♡
                    </span>

                    <div className="product-overlay">
                      <span>View product →</span>
                    </div>
                  </div>

                  <div className="product-info">
                    <p className="product-store">
                      {product.store?.storeName || "BeautyMart Store"}
                    </p>

                    <h3>{product.productName}</h3>

                    <p className="product-category">
                      {product.category?.categoryName || "Beauty"}
                    </p>

                    <strong className="product-price">
                      {Number(product.price).toLocaleString("en-US")} ETB
                    </strong>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
