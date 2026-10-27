// import Image from "next/image";
// import Link from "next/link";

// const stores = [
//   {
//     slug: "mimi-beauty",
//     name: "Mimi Beauty",
//     category: "Skincare & Beauty",
//     location: "Addis Ababa",
//     description:
//       "Skincare and beauty products selected for everyday routines.",
//     image: "/images/secondPerfect.png",
//   },
//   {
//     slug: "natural-glow",
//     name: "Natural Glow",
//     category: "Organic Beauty",
//     location: "Bahir Dar",
//     description:
//       "Natural beauty products inspired by simple and healthy routines.",
//     image: "/images/africanB.png",
//   },
//   {
//     slug: "nile-cosmetics",
//     name: "Nile Cosmetics",
//     category: "Makeup & Cosmetics",
//     location: "Addis Ababa",
//     description:
//       "Makeup essentials for everyday looks and special occasions.",
//     image: "/images/beauty.png",
//   },
// ];

// export default function StoresPage() {
//   return (
//     <main className="stores-page">

//       <section className="stores-page-hero">
//         <div className="stores-page-container">

//           <p className="section-eyebrow">
//             BEAUTYMART STORES
//           </p>

//           <h1>
//             Discover the businesses
//             <br />
//             <span>behind the beauty.</span>
//           </h1>

//           <p>
//             Explore independent beauty businesses and discover products
//             from brands and stores across Ethiopia.
//           </p>

//         </div>
//       </section>

//       <section className="stores-list-section">
//         <div className="stores-page-container">

//           <div className="stores-list-heading">
//             <div>
//               <p className="section-eyebrow">
//                 EXPLORE STORES
//               </p>

//               <h2>
//                 Find a store
//                 <br />
//                 <span>you love.</span>
//               </h2>
//             </div>

//             <span className="stores-count">
//               {stores.length} stores
//             </span>
//           </div>

//           <div className="stores-list-grid">

//             {stores.map((store) => (
//               <Link
//                 href={`/stores/${store.slug}`}
//                 className="store-page-card"
//                 key={store.slug}
//               >
//                 <div className="store-page-image">

//                   <Image
//                     src={store.image}
//                     alt={store.name}
//                     fill
//                     sizes="(max-width: 700px) 100vw, 33vw"
//                   />

//                   <span className="store-page-badge">
//                     BEAUTYMART STORE
//                   </span>

//                   <span className="store-page-arrow">
//                     ↗
//                   </span>

//                 </div>

//                 <div className="store-page-info">

//                   <div>
//                     <p>{store.category}</p>

//                     <h3>{store.name}</h3>

//                     <span>{store.location}</span>
//                   </div>

//                   <span className="store-page-link">
//                     Visit store →
//                   </span>

//                 </div>

//                 <p className="store-page-description">
//                   {store.description}
//                 </p>

//               </Link>
//             ))}

//           </div>

//         </div>
//       </section>

//     </main>
//   );
// }

import Image from "next/image";
import Link from "next/link";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function StoresPage() {
  const stores = await prisma.store.findMany({
    where: {
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
      products: {
        where: { isActive: true },
        select: { productId: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="stores-page">
      <section className="stores-page-hero">
        <div className="stores-page-container">
          <p className="section-eyebrow">BEAUTYMART STORES</p>
          <h1>
            Discover the businesses
            <br />
            <span>behind the beauty.</span>
          </h1>
          <p>
            Explore independent beauty businesses and discover products
            from stores across Ethiopia.
          </p>
        </div>
      </section>

      <section className="stores-list-section">
        <div className="stores-page-container">
          <div className="stores-list-heading">
            <div>
              <p className="section-eyebrow">EXPLORE STORES</p>
              <h2>
                Find a store
                <br />
                <span>you love.</span>
              </h2>
            </div>
            <span className="stores-count">
              {stores.length} {stores.length === 1 ? "store" : "stores"}
            </span>
          </div>

          {stores.length === 0 ? (
            <div className="stores-empty-state">
              <h3>New beauty businesses are on their way.</h3>
              <p>
                There are no active stores available to explore right now.
                Please check back soon.
              </p>
              <Link href="/products">Explore products →</Link>
            </div>
          ) : (
            <div className="stores-list-grid">
              {stores.map((store) => {
                const image = store.bannerUrl || store.logoUrl;

                return (
                  <Link
                    href={`/stores/${store.storeId}`}
                    className="store-page-card"
                    key={store.storeId}
                  >
                    <div className="store-page-image">
                      {image ? (
                        <Image
                          src={image}
                          alt={`${store.storeName} store`}
                          fill
                          sizes="(max-width: 700px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="store-image-placeholder">
                          <span>BEAUTYMART</span>
                          <strong>{store.storeName}</strong>
                        </div>
                      )}

                      <span className="store-page-badge">
                        BEAUTYMART STORE
                      </span>
                      <span className="store-page-arrow">↗</span>
                    </div>

                    <div className="store-page-info">
                      <div>
                        <p>Beauty &amp; personal care</p>
                        <h3>{store.storeName}</h3>
                        <span>{store.address || "Ethiopia"}</span>
                      </div>
                      <span className="store-page-link">Visit store →</span>
                    </div>

                    <p className="store-page-description">
                      {store.description ||
                        "Discover products from this BeautyMart business."}
                    </p>

                    <p className="store-page-product-count">
                      {store.products.length}{" "}
                      {store.products.length === 1 ? "product" : "products"}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
