// import Image from "next/image";
// import Link from "next/link";

// const stores = {
//   "mimi-beauty": {
//     name: "Mimi Beauty",
//     category: "Skincare & Beauty",
//     location: "Addis Ababa, Ethiopia",
//     description:
//       "Discover carefully selected skincare and beauty products designed for everyday routines.",
//     image: "/images/secondPerfect.png",
//   },

//   "natural-glow": {
//     name: "Natural Glow",
//     category: "Organic Beauty",
//     location: "Bahir Dar, Ethiopia",
//     description:
//       "Natural beauty products inspired by simple routines and healthier beauty choices.",
//     image: "/images/africanB.png",
//   },

//   "nile-cosmetics": {
//     name: "Nile Cosmetics",
//     category: "Makeup & Cosmetics",
//     location: "Addis Ababa, Ethiopia",
//     description:
//       "Makeup essentials for everyday looks, special occasions, and everything in between.",
//     image: "/images/beauty.png",
//   },
// };

// const products = [
//   {
//     id: "radiance-glow-serum",
//     name: "Radiance Glow Serum",
//     category: "Skincare",
//     price: "850 ETB",
//     image: "/images/beauty.png",
//   },
//   {
//     id: "velvet-matte-lipstick",
//     name: "Velvet Matte Lipstick",
//     category: "Makeup",
//     price: "650 ETB",
//     image: "/images/first.png",
//   },
//   {
//     id: "natural-hair-treatment",
//     name: "Natural Hair Treatment",
//     category: "Haircare",
//     price: "950 ETB",
//     image: "/images/perfect.png",
//   },
//   {
//     id: "signature-bloom-perfume",
//     name: "Signature Bloom Perfume",
//     category: "Fragrance",
//     price: "1,450 ETB",
//     image: "/images/Foreign.png",
//   },
// ];

// export default async function StorePage({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params;

//   const store = stores[slug as keyof typeof stores];

//   if (!store) {
//     return (
//       <main className="store-not-found">
//         <div>
//           <p className="section-eyebrow">BEAUTYMART</p>

//           <h1>Store not found.</h1>

//           <p>
//             The store you are looking for does not exist or is no longer
//             available.
//           </p>

//           <Link href="/stores">
//             ← Back to stores
//           </Link>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="individual-store-page">

//       {/* Store Header */}

//       <section className="individual-store-hero">

//         <div className="individual-store-hero-image">
//           <Image
//             src={store.image}
//             alt={store.name}
//             fill
//             priority
//             sizes="100vw"
//           />

//           <div className="individual-store-hero-overlay"></div>
//         </div>

//         <div className="individual-store-hero-content">

//           <Link
//             href="/stores"
//             className="back-to-stores"
//           >
//             ← All stores
//           </Link>

//           <div>
//             <p className="store-hero-category">
//               {store.category}
//             </p>

//             <h1>{store.name}</h1>

//             <p className="store-hero-location">
//               {store.location}
//             </p>
//           </div>

//         </div>

//       </section>

//       {/* Store Information */}

//       <section className="store-information">

//         <div className="store-information-container">

//           <div className="store-about">

//             <p className="section-eyebrow">
//               ABOUT THE STORE
//             </p>

//             <h2>
//               Beauty products
//               <br />
//               <span>worth discovering.</span>
//             </h2>

//           </div>

//           <div className="store-about-description">

//             <p>
//               {store.description}
//             </p>

//             <div className="store-details">

//               <div>
//                 <span>LOCATION</span>
//                 <strong>{store.location}</strong>
//               </div>

//               <div>
//                 <span>CATEGORY</span>
//                 <strong>{store.category}</strong>
//               </div>

//               <div>
//                 <span>SHOPPING</span>
//                 <strong>Online ordering</strong>
//               </div>

//             </div>

//           </div>

//         </div>

//       </section>

//       {/* Products */}

//       <section className="store-products">

//         <div className="store-products-container">

//           <div className="store-products-heading">

//             <div>
//               <p className="section-eyebrow">
//                 FROM {store.name.toUpperCase()}
//               </p>

//               <h2>
//                 Explore the
//                 <br />
//                 <span>collection.</span>
//               </h2>
//             </div>

//             <span>
//               {products.length} products
//             </span>

//           </div>

//           <div className="store-products-grid">

//             {products.map((product) => (
//               <Link
//                 href={`/products/${product.id}`}
//                 className="store-product-card"
//                 key={product.id}
//               >

//                 <div className="store-product-image">

//                   <Image
//                     src={product.image}
//                     alt={product.name}
//                     fill
//                     sizes="(max-width: 700px) 100vw, 25vw"
//                   />

//                   <span className="store-product-wishlist">
//                     ♡
//                   </span>

//                   <div className="store-product-overlay">
//                     <span>
//                       View product →
//                     </span>
//                   </div>

//                 </div>

//                 <div className="store-product-info">

//                   <p>{product.category}</p>

//                   <h3>{product.name}</h3>

//                   <strong>{product.price}</strong>

//                 </div>

//               </Link>
//             ))}

//           </div>

//         </div>

//       </section>

//       {/* Store CTA */}

//       <section className="store-bottom-cta">

//         <div>

//           <p className="section-eyebrow">
//             SHOP WITH {store.name.toUpperCase()}
//           </p>

//           <h2>
//             Find something
//             <br />
//             <span>beautiful.</span>
//           </h2>

//           <Link href="/products">
//             Explore all products →
//           </Link>

//         </div>

//       </section>

//     </main>
//   );
// }

import Image from "next/image";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import HorizontalCarousel from "../../components/HorizontalCarousel";

export const dynamic = "force-dynamic";

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const store = await prisma.store.findFirst({
    where: {
      storeId: slug,
      status: "ACTIVE",
      subscription: {
        is: {
          status: "ACTIVE",
          isActive: true,
          endDate: { gt: new Date() },
        },
      },
    },
    select: {
      storeId: true,
      storeName: true,
      description: true,
      address: true,
      logoUrl: true,
      bannerUrl: true,
      categories: {
        select: {
          categoryName: true,
        },
      },
      products: {
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          productId: true,
          productName: true,
          price: true,
          category: {
            select: {
              categoryName: true,
            },
          },
          images: {
            where: {
              isPrimary: true,
            },
            take: 1,
            select: {
              productImageId: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  if (!store) {
    return (
      <main className="store-not-found">
        <div>
          <p className="section-eyebrow">BEAUTYMART</p>
          <h1>Store not found.</h1>
          <p>
            This store does not exist or is no longer available.
          </p>
          <Link href="/stores">← Back to stores</Link>
        </div>
      </main>
    );
  }

  const storeImage = store.bannerUrl || store.logoUrl;
  const storeCategory =
    store.categories.map((category) => category.categoryName).filter(Boolean).join(" · ") ||
    "Beauty & Personal Care";

  return (
    <main className="individual-store-page">
      <section className="individual-store-hero">
        <div className="individual-store-hero-image">
          {storeImage ? (
            <Image
              src={storeImage}
              alt={store.storeName}
              fill
              priority
              sizes="100vw"
            />
          ) : (
            <div className="store-image-placeholder">
              <span>BEAUTYMART</span>
              <strong>{store.storeName}</strong>
            </div>
          )}
          <div className="individual-store-hero-overlay" />
        </div>

        <div className="individual-store-hero-content">
          <Link href="/stores" className="back-to-stores">
            ← All stores
          </Link>

          <div>
            <p className="store-hero-category">{storeCategory}</p>
            <h1>{store.storeName}</h1>
            <p className="store-hero-location">
              {store.address || "Ethiopia"}
            </p>
          </div>
        </div>
      </section>

      <section className="store-information">
        <div className="store-information-container">
          <div className="store-about">
            <p className="section-eyebrow">ABOUT THE STORE</p>
            <h2>
              Beauty products
              <br />
              <span>worth discovering.</span>
            </h2>
          </div>

          <div className="store-about-description">
            <p>
              {store.description ||
                `Discover beauty and personal care products from ${store.storeName}.`}
            </p>

            <div className="store-details">
              <div>
                <span>LOCATION</span>
                <strong>{store.address || "Ethiopia"}</strong>
              </div>

              <div>
                <span>CATEGORY</span>
                <strong>{storeCategory}</strong>
              </div>

              <div>
                <span>SHOPPING</span>
                <strong>Online ordering</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="store-products">
        <div className="store-products-container">
          <div className="store-products-heading">
            <div>
              <p className="section-eyebrow">
                FROM {store.storeName.toUpperCase()}
              </p>
              <h2>
                Explore the
                <br />
                <span>collection.</span>
              </h2>
            </div>

            <span>
              {store.products.length}{" "}
              {store.products.length === 1 ? "product" : "products"}
            </span>
          </div>

          {store.products.length === 0 ? (
            <div className="stores-empty-state">
              <h3>Products are coming soon.</h3>
              <p>
                This store has no active products available right now.
                Please check back soon.
              </p>
              <Link href="/products">Explore other products →</Link>
            </div>
          ) : (
            <HorizontalCarousel
              className="store-products-grid"
              label={`${store.storeName} products`}
            >
              {store.products.map((product) => {
                const productImage = product.images[0]?.imageUrl;

                return (
                  <Link
                    href={`/products/${product.productId}`}
                    className="store-product-card"
                    key={product.productId}
                  >
                    <div className="store-product-image">
                      {productImage ? (
                        <Image
                          src={productImage}
                          alt={product.productName}
                          fill
                          sizes="(max-width: 700px) 100vw, 25vw"
                        />
                      ) : (
                        <div className="store-image-placeholder">
                          <span>BEAUTYMART</span>
                          <strong>{product.productName}</strong>
                        </div>
                      )}

                      <span className="store-product-wishlist">♡</span>

                      <div className="store-product-overlay">
                        <span>View product →</span>
                      </div>
                    </div>

                    <div className="store-product-info">
                      <p>
                        {product.category?.categoryName || "Beauty"}
                      </p>
                      <h3>{product.productName}</h3>
                      <strong>
                        {Number(product.price).toLocaleString("en-US")} ETB
                      </strong>
                    </div>
                  </Link>
                );
              })}
            </HorizontalCarousel>
          )}
        </div>
      </section>

      <section className="store-bottom-cta">
        <div>
          <p className="section-eyebrow">
            SHOP WITH {store.storeName.toUpperCase()}
          </p>
          <h2>
            Find something
            <br />
            <span>beautiful.</span>
          </h2>
          <Link href="/products">Explore all products →</Link>
        </div>
      </section>
    </main>
  );
}
