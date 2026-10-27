// "use client";

// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";

// type MarketplaceProduct = {
//   productId: string;
//   productName: string;
//   category?: {
//     categoryName: string;
//   } | null;
//   images?: {
//     imageUrl: string;
//     isPrimary?: boolean;
//   }[];
// };

// type CategoryCard = {
//   name: string;
//   count: number;
//   image: string | null;
// };

// export default function CategoriesPage() {
//   const [products, setProducts] = useState<MarketplaceProduct[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     let cancelled = false;

//     async function loadCategories() {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await fetch("/api/marketplace/products");

//         if (!response.ok) {
//           throw new Error("Unable to load categories right now.");
//         }

//         const data = await response.json();

//         if (!cancelled) {
//           setProducts(Array.isArray(data.products) ? data.products : []);
//         }
//       } catch {
//         if (!cancelled) {
//           setError("We couldn't load categories. Please try again.");
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     loadCategories();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const categories = useMemo<CategoryCard[]>(() => {
//     const grouped = new Map<string, CategoryCard>();

//     for (const product of products) {
//       const name = product.category?.categoryName?.trim();

//       if (!name) continue;

//       const existing = grouped.get(name);

//       if (existing) {
//         existing.count += 1;

//         if (!existing.image && product.images?.[0]?.imageUrl) {
//           existing.image = product.images[0].imageUrl;
//         }
//       } else {
//         grouped.set(name, {
//           name,
//           count: 1,
//           image: product.images?.[0]?.imageUrl || null,
//         });
//       }
//     }

//     return Array.from(grouped.values()).sort((a, b) =>
//       a.name.localeCompare(b.name)
//     );
//   }, [products]);

//   const filteredCategories = useMemo(() => {
//     const term = search.trim().toLowerCase();

//     if (!term) return categories;

//     return categories.filter((category) =>
//       category.name.toLowerCase().includes(term)
//     );
//   }, [categories, search]);

//   return (
//     <main className="min-h-screen bg-[#f8f5f0] text-[#2d282b]">
//       <section className="border-b border-[#e9dfd9] bg-white">
//         <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
//           <nav
//             aria-label="Breadcrumb"
//             className="mb-5 text-sm text-[#766b6d]"
//           >
//             <Link href="/" className="transition hover:text-[#8b4b5a]">
//               Home
//             </Link>
//             <span className="mx-2">/</span>
//             <span className="text-[#8b4b5a]">Categories</span>
//           </nav>

//           <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#8b4b5a]">
//             Find your beauty essentials
//           </p>

//           <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
//             Shop by category
//           </h1>

//           <p className="mt-4 max-w-2xl text-base leading-7 text-[#766b6d]">
//             Explore beauty products from local sellers. Find the products
//             you love, all in one place.
//           </p>

//           <div className="mt-8 flex flex-col gap-3 sm:flex-row">
//             <label className="sr-only" htmlFor="category-search">
//               Search categories
//             </label>
//             <input
//               id="category-search"
//               type="search"
//               value={search}
//               onChange={(event) => setSearch(event.target.value)}
//               placeholder="Search categories..."
//               className="w-full rounded-xl border border-[#e4d8d3] bg-[#fdfbf9] px-4 py-3 outline-none transition placeholder:text-[#9a8e90] focus:border-[#8b4b5a] sm:max-w-md"
//             />

//             <Link
//               href="/products"
//               className="inline-flex items-center justify-center rounded-xl bg-[#8b4b5a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#713a47]"
//             >
//               Browse all products
//             </Link>
//           </div>
//         </div>
//       </section>

//       <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
//         <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
//           <div>
//             <h2 className="font-serif text-2xl sm:text-3xl">
//               Explore collections
//             </h2>
//             <p className="mt-2 text-sm text-[#766b6d]">
//               Discover what is available in the marketplace.
//             </p>
//           </div>

//           {!loading && !error && (
//             <p className="text-sm text-[#766b6d]">
//               {filteredCategories.length}{" "}
//               {filteredCategories.length === 1 ? "category" : "categories"}
//             </p>
//           )}
//         </div>

//         {loading ? (
//           <div
//             className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
//             aria-label="Loading categories"
//           >
//             {Array.from({ length: 4 }).map((_, index) => (
//               <div
//                 key={index}
//                 className="overflow-hidden rounded-2xl border border-[#eee4df] bg-white"
//               >
//                 <div className="aspect-[4/3] animate-pulse bg-[#eee7e2]" />
//                 <div className="space-y-3 p-5">
//                   <div className="h-5 w-2/3 animate-pulse rounded bg-[#eee7e2]" />
//                   <div className="h-4 w-1/3 animate-pulse rounded bg-[#f3eeea]" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : error ? (
//           <div className="rounded-2xl border border-[#ead8d8] bg-white px-6 py-12 text-center">
//             <h3 className="font-serif text-xl">Categories unavailable</h3>
//             <p className="mt-2 text-sm text-[#766b6d]">{error}</p>
//             <button
//               type="button"
//               onClick={() => window.location.reload()}
//               className="mt-5 rounded-xl bg-[#8b4b5a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#713a47]"
//             >
//               Try again
//             </button>
//           </div>
//         ) : filteredCategories.length > 0 ? (
//           <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//             {filteredCategories.map((category) => (
//               <Link
//                 key={category.name}
//                 href={`/products?category=${encodeURIComponent(category.name)}`}
//                 className="group overflow-hidden rounded-2xl border border-[#eee4df] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#d9bfc4] hover:shadow-lg"
//               >
//                 <div className="relative aspect-[4/3] overflow-hidden bg-[#eee7e2]">
//                   {category.image ? (
//                     <img
//                       src={category.image}
//                       alt={category.name}
//                       loading="lazy"
//                       className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
//                     />
//                   ) : (
//                     <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#f4e7e6] to-[#e8d5d0]">
//                       <span className="font-serif text-5xl text-[#8b4b5a]">
//                         {category.name.charAt(0).toUpperCase()}
//                       </span>
//                     </div>
//                   )}

//                   <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-[#713a47]">
//                     {category.count}{" "}
//                     {category.count === 1 ? "product" : "products"}
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between gap-3 p-5">
//                   <div className="min-w-0">
//                     <h3 className="truncate font-serif text-xl transition group-hover:text-[#8b4b5a]">
//                       {category.name}
//                     </h3>
//                     <p className="mt-1 text-sm text-[#766b6d]">
//                       Explore the collection
//                     </p>
//                   </div>

//                   <span
//                     aria-hidden="true"
//                     className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ead8d8] text-lg text-[#8b4b5a] transition group-hover:bg-[#8b4b5a] group-hover:text-white"
//                   >
//                     →
//                   </span>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         ) : (
//           <div className="rounded-2xl border border-dashed border-[#d9c9c4] bg-white px-6 py-14 text-center">
//             <h3 className="font-serif text-2xl">
//               {search.trim() ? "No matching categories" : "Categories are coming soon"}
//             </h3>
//             <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#766b6d]">
//               {search.trim()
//                 ? "Try another search term to find a category."
//                 : "There are no products in active marketplace categories yet. Check back soon or browse all products."}
//             </p>
//             {search.trim() ? (
//               <button
//                 type="button"
//                 onClick={() => setSearch("")}
//                 className="mt-5 rounded-xl border border-[#d9c9c4] px-5 py-3 text-sm font-semibold transition hover:bg-[#f8f5f0]"
//               >
//                 Clear search
//               </button>
//             ) : (
//               <Link
//                 href="/products"
//                 className="mt-5 inline-flex rounded-xl bg-[#8b4b5a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#713a47]"
//               >
//                 Browse products
//               </Link>
//             )}
//           </div>
//         )}
//       </section>
//     </main>
//   );
// }



"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./categories.module.css";

type Product = {
  productId: string;
  productName: string;
  category?: {
    categoryName: string;
  } | null;
  images?: {
    imageUrl: string;
    isPrimary?: boolean;
  }[];
};

type Category = {
  name: string;
  count: number;
  image: string | null;
};

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const response = await fetch("/api/marketplace/products");

        if (!response.ok) {
          throw new Error("Unable to load categories.");
        }

        const data = await response.json();

        if (!cancelled) {
          setProducts(Array.isArray(data.products) ? data.products : []);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("We couldn't load the categories. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo<Category[]>(() => {
    const grouped = new Map<string, Category>();

    for (const product of products) {
      const name = product.category?.categoryName?.trim();
      if (!name) continue;

      const image = product.images?.[0]?.imageUrl || null;
      const existing = grouped.get(name.toLowerCase());

      if (existing) {
        existing.count += 1;
        if (!existing.image && image) existing.image = image;
      } else {
        grouped.set(name.toLowerCase(), {
          name,
          count: 1,
          image,
        });
      }
    }

    return Array.from(grouped.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [products]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return query
      ? categories.filter((category) =>
          category.name.toLowerCase().includes(query)
        )
      : categories;
  }, [categories, search]);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />

        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Categories</span>
          </nav>

          <div className={styles.heroContent}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>
                YOUR BEAUTY, YOUR WAY
              </span>

              <h1>
                Find your
                <br />
                <span>kind of beautiful.</span>
              </h1>

              <p>
                From everyday essentials to your next favorite discovery,
                explore beauty collections from local sellers in Ethiopia.
              </p>

              <a href="#collections" className={styles.heroButton}>
                Explore collections <span aria-hidden="true">↓</span>
              </a>

              <div className={styles.heroNote}>
                <span className={styles.noteIcon}>✦</span>
                Discover beauty. Support local.
              </div>
            </div>

            <div className={styles.heroVisual} aria-hidden="true">
              <div className={styles.visualCircle}>
                <div className={styles.visualInner}>
                  <span className={styles.visualTop}>BEAUTY</span>
                  <span className={styles.visualMain}>begins</span>
                  <span className={styles.visualBottom}>with you.</span>
                  <span className={styles.visualFlower}>✳</span>
                </div>
              </div>
              <div className={styles.visualTag}>
                <span>♡</span> A little self-care goes a long way
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="collections" className={styles.collections}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.sectionEyebrow}>FIND YOUR FAVORITES</span>
            <h2>Shop by category</h2>
            <p>
              A collection for every routine, every mood, and every you.
            </p>
          </div>

          <Link href="/products" className={styles.allProductsLink}>
            View all products <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className={styles.searchIcon}
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>
            <input
              type="search"
              placeholder="Find your category..."
              aria-label="Search categories"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className={styles.clearSearch}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>

          {!loading && !error && (
            <span className={styles.categoryCount}>
              <strong>{filteredCategories.length}</strong>{" "}
              {filteredCategories.length === 1 ? "collection" : "collections"}
            </span>
          )}
        </div>

        {loading ? (
          <div className={styles.grid}>
            {[1, 2, 3, 4].map((item) => (
              <div className={styles.skeletonCard} key={item}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonText} />
                <div className={styles.skeletonLine} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>✳</span>
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button
              className={styles.primaryButton}
              onClick={() => window.location.reload()}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className={styles.grid}>
            {filteredCategories.map((category, index) => (
              <Link
                href={`/products?category=${encodeURIComponent(category.name)}`}
                key={category.name}
                className={styles.card}
              >
                <div className={styles.cardImage}>
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={`${category.name} products`}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.imageFallback}>
                      <span>{category.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}

                  <span className={styles.cardNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className={styles.imageArrow} aria-hidden="true">
                    ↗
                  </span>
                </div>

                <div className={styles.cardContent}>
                  <div>
                    <h3>{category.name}</h3>
                    <p>
                      {category.count}{" "}
                      {category.count === 1 ? "product" : "products"} to explore
                    </p>
                  </div>

                  <span className={styles.cardArrow} aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>♡</span>
            <h3>
              {search.trim()
                ? "No collections found"
                : "Your next favorite is on its way"}
            </h3>
            <p>
              {search.trim()
                ? "Try a different search term."
                : "There are no products in the active marketplace yet. Check back soon."}
            </p>
            {search.trim() ? (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            ) : (
              <Link href="/products" className={styles.primaryButton}>
                Browse products
              </Link>
            )}
          </div>
        )}

        <div className={styles.bottomBanner}>
          <div className={styles.bannerDecoration} aria-hidden="true">
            ✳
          </div>
          <div>
            <span className={styles.bannerEyebrow}>LOVE BEAUTY?</span>
            <h2>Your next favorite is waiting.</h2>
            <p>Explore the marketplace and discover something special.</p>
          </div>
          <Link href="/products" className={styles.bannerButton}>
            Discover products <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
