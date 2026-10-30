// import Image from "next/image";
// import Link from "next/link";

// const stores = [
//   {
//     slug: "mimi-beauty",
//     name: "Mimi Beauty",
//     category: "Skincare & Beauty",
//     location: "Addis Ababa",
//     image: "/images/secondPerfect.png",
//   },
//   {
//     slug: "natural-glow",
//     name: "Natural Glow",
//     category: "Organic Beauty",
//     location: "Bahir Dar",
//     image: "/images/africanB.png",
//   },
//   {
//     slug: "nile-cosmetics",
//     name: "Nile Cosmetics",
//     category: "Makeup & Cosmetics",
//     location: "Addis Ababa",
//     image: "/images/beauty.png",
//   },
// ];

// export default function FeaturedStores() {
//   return (
//     <section className="stores-section" id="stores">

//       <div className="stores-container">

//         {/* Heading */}
//         <div className="stores-heading">

//           <div>
//             <p className="section-eyebrow">
//               DISCOVER LOCAL BUSINESSES
//             </p>

//             <h2>
//               Meet the brands
//               <br />
//               <span>behind the beauty.</span>
//             </h2>
//           </div>

//           <Link href="/stores" className="stores-view-all">
//             Explore all stores →
//           </Link>

//         </div>


//         {/* Store cards */}
//         <div className="stores-grid">

//           {stores.map((store) => (
//             <Link
//   href={`/stores/${store.slug}`}
//   className="store-card"
//   key={store.name}
// >

//               <div className="store-image">

//                 <Image
//                   src={store.image}
//                   alt={store.name}
//                   fill
//                   sizes="(max-width: 700px) 100vw, 33vw"
//                 />

//                 <div className="store-image-overlay"></div>

//                 <span className="store-badge">
//                   BEAUTYMART STORE
//                 </span>

//               </div>


//               <div className="store-info">

//                 <div>
//                   <h3>{store.name}</h3>

//                   <p>{store.category}</p>

//                   <span className="store-location">
//                     {store.location}
//                   </span>
//                 </div>

//                 <span className="store-arrow">
//                   ↗
//                 </span>

//               </div>

//             </Link>
//           ))}

//         </div>

//       </div>

//     </section>
//   );
// }


import Image from "next/image";
import Link from "next/link";
import { prisma } from "../../lib/prisma";
import HorizontalCarousel from "./HorizontalCarousel";

export const dynamic = "force-dynamic";

export default async function FeaturedStores() {
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
    take: 12,
  });

  return (
    <section className="stores-section" id="stores">
      <div className="stores-container">
        <div className="stores-heading">
          <div>
            <p className="section-eyebrow">
              DISCOVER LOCAL BUSINESSES
            </p>
            <h2>
              Meet the brands
              <br />
              <span>behind the beauty.</span>
            </h2>
          </div>

          <Link href="/stores" className="stores-view-all">
            Explore all stores →
          </Link>
        </div>

        {stores.length === 0 ? (
          <div className="stores-empty-state">
            <h3>Local beauty businesses are on their way.</h3>
            <p>
              Active stores will appear here as they become available.
            </p>
            <Link href="/products">Explore products →</Link>
          </div>
        ) : (
          <HorizontalCarousel className="stores-grid" label="local beauty stores">
            {stores.map((store) => {
              const image = store.bannerUrl || store.logoUrl;

              return (
                <Link
                  href={`/stores/${store.storeId}`}
                  className="store-card"
                  key={store.storeId}
                >
                  <div className="store-image">
                    {image ? (
                      <Image
                        src={image}
                        alt={store.storeName}
                        fill
                        sizes="(max-width: 700px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="store-image-placeholder">
                        <span>BEAUTYMART</span>
                        <strong>{store.storeName}</strong>
                      </div>
                    )}

                    <div className="store-image-overlay" />

                    <span className="store-badge">
                      BEAUTYMART STORE
                    </span>
                  </div>

                  <div className="store-info">
                    <div>
                      <h3>{store.storeName}</h3>
                      <p>
                        {store.description || "Beauty & personal care"}
                      </p>
                      <span className="store-location">
                        {store.address || "Ethiopia"}
                      </span>
                    </div>

                    <span className="store-arrow">↗</span>
                  </div>
                </Link>
              );
            })}
          </HorizontalCarousel>
        )}
      </div>
    </section>
  );
}
