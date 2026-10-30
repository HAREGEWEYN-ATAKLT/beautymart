
// "use client";

// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";

// type Product = {
//   productId: string;
//   productName: string;
//   price: string | number;
//   category: {
//     categoryName: string;
//   };
//   store: {
//     storeName: string;
//   };
//   images: {
//     imageUrl: string;
//     isPrimary: boolean;
//   }[];
// };

// const fallbackImages = [
//   "/images/beauty.png",
//   "/images/first.png",
//   "/images/perfect.png",
//   "/images/Foreign.png",
//   "/images/secondPerfect.png",
// ];

// export default function SearchPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function loadProducts() {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await fetch("/api/marketplace/products");
//         const data = await response.json();

//         if (!response.ok) {
//           setError(data.message || "We couldn't load products right now.");
//           return;
//         }

//         setProducts(data.products || []);
//       } catch (err) {
//         console.error("Search products error:", err);
//         setError("Something went wrong. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadProducts();
//   }, []);

//   const filteredProducts = useMemo(() => {
//     const term = search.trim().toLowerCase();

//     if (!term) return products;

//     return products.filter((product) => {
//       const name = product.productName?.toLowerCase() || "";
//       const category = product.category?.categoryName?.toLowerCase() || "";
//       const store = product.store?.storeName?.toLowerCase() || "";

//       return (
//         name.includes(term) ||
//         category.includes(term) ||
//         store.includes(term)
//       );
//     });
//   }, [products, search]);

//   return (
//     <main className="min-h-screen bg-[#f8f5f0] px-4 py-10 text-[#2d282b] sm:px-6 lg:px-8">
//       <div className="mx-auto max-w-7xl">
//         <Link
//           href="/"
//           className="text-sm font-medium text-[#8b4b5a] hover:underline"
//         >
//           ← Back to home
//         </Link>

//         <section className="mx-auto mb-10 mt-8 max-w-3xl text-center">
//           <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#8b4b5a]">
//             BeautyMart
//           </p>

//           <h1 className="text-3xl font-bold sm:text-4xl">
//             Find your beauty essentials
//           </h1>

//           <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
//             Search products, explore categories, and discover local beauty stores.
//           </p>

//           <label htmlFor="product-search" className="sr-only">
//             Search by product, category, or store
//           </label>

//           <div className="mt-7 flex items-center gap-3 rounded-2xl border border-[#e7dcd8] bg-white p-2 shadow-sm focus-within:border-[#8b4b5a] focus-within:ring-2 focus-within:ring-[#8b4b5a]/15">
//             <span className="pl-3 text-xl text-gray-400" aria-hidden="true">
//               ⌕
//             </span>

//             <input
//               id="product-search"
//               type="search"
//               value={search}
//               onChange={(event) => setSearch(event.target.value)}
//               placeholder="Try serum, skincare, or a store name..."
//               className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none sm:text-base"
//             />

//             {search && (
//               <button
//                 type="button"
//                 onClick={() => setSearch("")}
//                 className="rounded-xl px-3 py-2 text-sm font-medium text-[#8b4b5a] hover:bg-[#f8f5f0]"
//               >
//                 Clear
//               </button>
//             )}
//           </div>

//           {!loading && !error && (
//             <p className="mt-3 text-left text-sm text-gray-500">
//               {search.trim()
//                 ? `${filteredProducts.length} result${filteredProducts.length === 1 ? "" : "s"} found`
//                 : `${products.length} product${products.length === 1 ? "" : "s"} available to explore`}
//             </p>
//           )}
//         </section>

//         {loading ? (
//           <div className="py-16 text-center" role="status">
//             <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#e7dcd8] border-t-[#8b4b5a]" />
//             <p className="text-gray-600">Finding products for you...</p>
//           </div>
//         ) : error ? (
//           <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
//             <p className="font-semibold text-red-700">{error}</p>
//             <button
//               type="button"
//               onClick={() => window.location.reload()}
//               className="mt-4 rounded-xl bg-[#8b4b5a] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
//             >
//               Try again
//             </button>
//           </div>
//         ) : filteredProducts.length === 0 ? (
//           <div className="rounded-2xl border border-[#e7dcd8] bg-white px-6 py-14 text-center">
//             <div className="mb-4 text-4xl" aria-hidden="true">
//               🔎
//             </div>
//             <h2 className="text-xl font-semibold">
//               {search.trim() ? "No matching products found" : "No products available yet"}
//             </h2>
//             <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
//               {search.trim()
//                 ? "Try another product name, category, or store name."
//                 : "Products from eligible stores will appear here when they are available."}
//             </p>
//             {search.trim() && (
//               <button
//                 type="button"
//                 onClick={() => setSearch("")}
//                 className="mt-5 rounded-xl bg-[#8b4b5a] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
//               >
//                 Show all products
//               </button>
//             )}
//             <div>
//               <Link
//                 href="/categories"
//                 className="mt-5 inline-block text-sm font-semibold text-[#8b4b5a] hover:underline"
//               >
//                 Explore categories →
//               </Link>
//             </div>
//           </div>
//         ) : (
//           <section>
//             <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
//               {filteredProducts.map((product, index) => {
//                 const image =
//                   product.images?.[0]?.imageUrl ||
//                   fallbackImages[index % fallbackImages.length];

//                 return (
//                   <article
//                     key={product.productId}
//                     className="group overflow-hidden rounded-2xl border border-[#eee5e1] bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg"
//                   >
//                     <Link
//                       href={`/products/${product.productId}`}
//                       className="block"
//                       aria-label={`View ${product.productName}`}
//                     >
//                       <div className="aspect-square overflow-hidden bg-[#f3eeea]">
//                         <img
//                           src={image}
//                           alt={product.productName}
//                           loading="lazy"
//                           className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
//                         />
//                       </div>

//                       <div className="p-3 sm:p-4">
//                         <p className="mb-1 text-xs font-medium text-[#8b4b5a]">
//                           {product.category?.categoryName || "Beauty"}
//                         </p>

//                         <h2 className="line-clamp-2 min-h-10 text-sm font-semibold sm:text-base">
//                           {product.productName}
//                         </h2>

//                         <p className="mt-2 text-sm text-gray-500">
//                           {product.store?.storeName || "Local store"}
//                         </p>

//                         <p className="mt-3 font-bold text-[#2d282b]">
//                           {Number(product.price).toLocaleString("en-US", {
//                             maximumFractionDigits: 2,
//                           })}{" "}
//                           ETB
//                         </p>

//                         <span className="mt-3 inline-block text-sm font-semibold text-[#8b4b5a]">
//                           View product →
//                         </span>
//                       </div>
//                     </Link>
//                   </article>
//                 );
//               })}
//             </div>
//           </section>
//         )}
//       </div>
//     </main>
//   );
// }


"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import HorizontalCarousel from "../components/HorizontalCarousel";
import styles from "./search.module.css";

type Product = {
  productId: string;
  productName: string;
  price: string | number;
  category?: {
    categoryName: string;
  } | null;
  store?: {
    storeName: string;
  } | null;
  images?: {
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

const suggestions = ["Skincare", "Makeup", "Haircare", "Fragrance"];

export default function SearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/marketplace/products", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load products.");
      }

      setProducts(data.products || []);
    } catch (err) {
      console.error("Marketplace search error:", err);

      setError(
        err instanceof Error
          ? "We couldn't load products right now. Please try again."
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) => {
      const name = product.productName?.toLowerCase() || "";
      const category = product.category?.categoryName?.toLowerCase() || "";
      const store = product.store?.storeName?.toLowerCase() || "";

      return (
        name.includes(term) ||
        category.includes(term) ||
        store.includes(term)
      );
    });
  }, [products, search]);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Search</span>
          </nav>

          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>
              Discover something beautiful
            </p>

            <h1 className={styles.heading}>
              Find your beauty essentials
            </h1>

            <p className={styles.description}>
              Search products, explore beauty categories, and discover
              local stores — all in one place.
            </p>

            <form
              className={styles.searchForm}
              role="search"
              onSubmit={(event) => event.preventDefault()}
            >
              <label htmlFor="marketplace-search" className="sr-only">
                Search products, categories, and stores
              </label>

              <div className={styles.searchBox}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className={styles.searchIcon}
                  aria-hidden="true"
                >
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path
                    d="m16 16 4.2 4.2"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  id="marketplace-search"
                  type="search"
                  autoComplete="off"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="What are you looking for?"
                  className={styles.searchInput}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className={styles.clearButton}
                  >
                    Clear
                  </button>
                )}
              </div>

              <p className={styles.helperText}>
                Search by product name, category, or store.
              </p>
            </form>

            <div className={styles.suggestions}>
              <span className={styles.suggestionsLabel}>
                Explore:
              </span>

              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSearch(item)}
                  className={styles.suggestion}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.container} ${styles.resultsSection}`}>
        <div className={styles.resultsHeader}>
          <div>
            <p className={styles.resultsEyebrow}>
              The BeautyMart collection
            </p>

            <h2 className={styles.resultsTitle}>
              {search.trim() ? "Search results" : "Explore products"}
            </h2>
          </div>

          {!loading && !error && (
            <p className={styles.resultsCount} aria-live="polite">
              {search.trim()
                ? `${results.length} ${
                    results.length === 1 ? "result" : "results"
                  }`
                : `${products.length} ${
                    products.length === 1 ? "product" : "products"
                  } available`}
            </p>
          )}
        </div>

        {loading ? (
          <div
            className={styles.loadingGrid}
            role="status"
            aria-label="Loading products"
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard}>
                <div className={styles.skeletonImage} />

                <div className={styles.skeletonInfo}>
                  <div
                    className={`${styles.skeletonLine} ${styles.skeletonShort}`}
                  />
                  <div
                    className={`${styles.skeletonLine} ${styles.skeletonLong}`}
                  />
                  <div
                    className={`${styles.skeletonLine} ${styles.skeletonMedium}`}
                  />
                  <div
                    className={`${styles.skeletonLine} ${styles.skeletonShort}`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.statePanel}>
            <div className={styles.stateIcon} aria-hidden="true">
              !
            </div>

            <h3 className={styles.stateTitle}>
              We couldn&apos;t load the products
            </h3>

            <p className={styles.stateDescription}>
              {error}
            </p>

            <div className={styles.stateActions}>
              <button
                type="button"
                onClick={() => void loadProducts()}
                className={styles.primaryButton}
              >
                Try again
              </button>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className={styles.statePanel}>
            <div className={styles.stateIcon} aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path
                  d="m16 16 4.2 4.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h3 className={styles.stateTitle}>
              {search.trim()
                ? "We couldn't find a match"
                : "No products available yet"}
            </h3>

            <p className={styles.stateDescription}>
              {search.trim()
                ? "Try a different product name, category, or store. You can also explore our categories."
                : "Products from eligible stores will appear here when they become available."}
            </p>

            <div className={styles.stateActions}>
              {search.trim() && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className={styles.secondaryButton}
                >
                  Clear search
                </button>
              )}

              <Link
                href="/categories"
                className={styles.primaryButton}
              >
                Browse categories
              </Link>
            </div>
          </div>
        ) : (
          <HorizontalCarousel
            className={styles.productGrid}
            label={search.trim() ? "Search results" : "Marketplace products"}
          >
            {results.map((product, index) => {
              const image =
                product.images?.find((item) => item.isPrimary)?.imageUrl ||
                product.images?.[0]?.imageUrl ||
                fallbackImages[index % fallbackImages.length];

              return (
                <article
                  key={product.productId}
                  className={styles.productCard}
                >
                  <Link
                    href={`/products/${product.productId}`}
                    className={styles.productLink}
                    aria-label={`View ${product.productName}`}
                  >
                    <div className={styles.productImageWrap}>
                      <img
                        src={image}
                        alt={product.productName}
                        loading="lazy"
                        className={styles.productImage}
                      />

                      <span className={styles.categoryBadge}>
                        {product.category?.categoryName || "Beauty"}
                      </span>
                    </div>

                    <div className={styles.productInfo}>
                      <h3 className={styles.productName}>
                        {product.productName}
                      </h3>

                      <p className={styles.storeName}>
                        {product.store?.storeName || "Local store"}
                      </p>

                      <div className={styles.productBottom}>
                        <p className={styles.productPrice}>
                          {Number(product.price).toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })}{" "}
                          <span className={styles.currency}>ETB</span>
                        </p>

                        <span className={styles.viewProduct}>
                          View product →
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </HorizontalCarousel>
        )}

        {!loading && !error && products.length > 0 && (
          <p className={styles.footerNote}>
            Discover products offered by eligible BeautyMart stores.
          </p>
        )}
      </section>
    </main>
  );
}
