// import Image from "next/image";
// import Link from "next/link";

// const categories = [
//   {
//     name: "Skincare",
//     description: "Serums, creams, cleansers & more",
//     image: "/images/beauty.png",
//   },
//   {
//     name: "Makeup",
//     description: "Makeup for every look",
//     image: "/images/first.png",
//   },
//   {
//     name: "Haircare",
//     description: "Care for healthy, beautiful hair",
//     image: "/images/perfect.png",
//   },
//   {
//     name: "Fragrance",
//     description: "Find your signature scent",
//     image: "/images/Foreign.png",
//   },
// ];

// export default function Categories() {
//   return (
//     <section className="categories-section">

//       <div className="categories-container">

//         {/* Section heading */}
//         <div className="categories-heading">

//           <div>
//             <p className="section-eyebrow">
//               EXPLORE BEAUTY
//             </p>

//             <h2>
//               Find what
//               <br />
//               <span>you love.</span>
//             </h2>
//           </div>

//           <p className="categories-intro">
//             Explore products across the beauty categories you use every day,
//             from skincare and makeup to haircare and fragrance.
//           </p>

//         </div>


//         {/* Category cards */}
//         <div className="categories-grid">

//           {categories.map((category) => (
//             <Link
//             href={`/products?category=${encodeURIComponent(category.name)}`}
//               className="category-card"
//               key={category.name}
//             >

//               <div className="category-image">

//                 <Image
//                   src={category.image}
//                   alt={category.name}
//                   fill
//                   sizes="(max-width: 700px) 100vw, 25vw"
//                 />

//                 <div className="category-image-overlay"></div>

//                 <span className="category-arrow">
//                   ↗
//                 </span>

//               </div>


//               <div className="category-content">

//                 <h3>{category.name}</h3>

//                 <p>{category.description}</p>

//                 <span className="category-link">
//                   Explore category →
//                 </span>

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
import HorizontalCarousel from "./HorizontalCarousel";

type MarketplaceProduct = {
  productId: string;
  productName: string;
  category?: {
    categoryName: string;
  } | null;
  images?: {
    productImageId: string;
    imageUrl: string;
    isPrimary: boolean;
  }[];
};

type CategoryCard = {
  name: string;
  image: string | null;
};

const descriptions: Record<string, string> = {
  Skincare: "Serums, creams, cleansers & more",
  Makeup: "Makeup for every look",
  Haircare: "Care for healthy, beautiful hair",
  Fragrance: "Find your signature scent",
};

export default function Categories() {
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch("/api/marketplace/products", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Could not load marketplace categories.");
        }

        const data = await response.json();
        const products: MarketplaceProduct[] = Array.isArray(data.products)
          ? data.products
          : [];

        const categoryMap = new Map<string, CategoryCard>();

        for (const product of products) {
          const name = product.category?.categoryName?.trim();

          if (!name || categoryMap.has(name)) {
            continue;
          }

          const primaryImage = product.images?.find(
            (image) => image.isPrimary
          );

          const image =
            primaryImage?.imageUrl || product.images?.[0]?.imageUrl || null;

          categoryMap.set(name, { name, image });
        }

        setCategories(Array.from(categoryMap.values()));
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

    loadCategories();

    return () => controller.abort();
  }, []);

  return (
    <section className="categories-section">
      <div className="categories-container">
        <div className="categories-heading">
          <div>
            <p className="section-eyebrow">EXPLORE BEAUTY</p>

            <h2>
              Find what
              <br />
              <span>you love.</span>
            </h2>
          </div>

          <p className="categories-intro">
            Explore products across the beauty categories you love, from
            skincare and makeup to haircare and fragrance.
          </p>
        </div>

        {loading ? (
          <p>Discovering beauty categories...</p>
        ) : error ? (
          <p>Categories could not be loaded. Please try again later.</p>
        ) : categories.length === 0 ? (
          <p>
            New beauty categories are coming soon. Check back as more products
            become available.
          </p>
        ) : (
          <HorizontalCarousel className="categories-grid" label="beauty categories">
            {categories.map((category) => (
              <Link
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="category-card"
                key={category.name}
              >
                <div className="category-image">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 700px) 100vw, 25vw"
                    />
                  ) : (
                    <div
                      className="category-image-placeholder"
                      aria-label={`${category.name} image unavailable`}
                    >
                      {category.name}
                    </div>
                  )}

                  <div className="category-image-overlay" />

                  <span className="category-arrow" aria-hidden="true">
                    ↗
                  </span>
                </div>

                <div className="category-content">
                  <h3>{category.name}</h3>

                  <p>
                    {descriptions[category.name] ||
                      `Discover beauty products in ${category.name.toLowerCase()}.`}
                  </p>

                  <span className="category-link">
                    Explore category →
                  </span>
                </div>
              </Link>
            ))}
          </HorizontalCarousel>
        )}
      </div>
    </section>
  );
}
