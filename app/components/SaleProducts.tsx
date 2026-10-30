"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import HorizontalCarousel from "./HorizontalCarousel";

type Product = {
  productId: string;
  productName: string;
  price: string | number;
  store?: { storeName: string } | null;
  images?: { imageUrl: string }[];
  productDiscounts?: {
    discount: {
      isActive: boolean;
      startDate: string;
      endDate: string;
      discountType: "PERCENTAGE" | "FIXED_AMOUNT";
      discountValue: string | number;
    };
  }[];
};

type SaleProduct = Product & { salePrice: number; saving: number };

function findSale(product: Product): SaleProduct | null {
  const now = new Date();
  const discount = product.productDiscounts?.find(({ discount }) =>
    discount.isActive && new Date(discount.startDate) <= now && new Date(discount.endDate) >= now
  )?.discount;
  if (!discount) return null;

  const price = Number(product.price);
  const rawSaving = discount.discountType === "PERCENTAGE"
    ? (price * Number(discount.discountValue)) / 100
    : Number(discount.discountValue);
  const saving = Math.min(Math.max(rawSaving, 0), price);
  if (saving <= 0) return null;
  return { ...product, saving, salePrice: price - saving };
}

export default function SaleProducts() {
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/marketplace/products", { signal: controller.signal })
      .then(async (response) => response.ok ? response.json() : { products: [] })
      .then((data) => {
        const marketplaceProducts: Product[] = Array.isArray(data.products)
          ? data.products as Product[]
          : [];
        const saleProducts = marketplaceProducts
          .map(findSale)
          .filter((product): product is SaleProduct => product !== null)
          .slice(0, 12);
        setProducts(saleProducts);
      })
      .catch((error: unknown) => {
        if (!(error instanceof Error && error.name === "AbortError")) setProducts([]);
      })
      .finally(() => { if (!controller.signal.aborted) setReady(true); });
    return () => controller.abort();
  }, []);

  // A home page should not show an empty sale section when no real offers exist.
  if (!ready || products.length === 0) return null;

  return (
    <section className="sale-section" aria-labelledby="sale-heading">
      <div className="sale-container">
        <div className="sale-heading">
          <div>
            <p className="section-eyebrow">LIMITED-TIME OFFERS</p>
            <h2 id="sale-heading">Beauty deals, <span>chosen for you.</span></h2>
            <p>Real discounts from active BeautyMart stores.</p>
          </div>
          <Link href="/products" className="sale-view-all">Shop all offers →</Link>
        </div>
        <HorizontalCarousel className="sale-grid" label="limited-time offers">
          {products.map((product) => {
            const image = product.images?.[0]?.imageUrl;
            return (
              <Link key={product.productId} href={`/products/${product.productId}`} className="sale-card">
                <div className="sale-image">
                  {image ? <Image src={image} alt={product.productName} fill sizes="(max-width: 700px) 82vw, 25vw" /> : <div className="sale-placeholder">BeautyMart</div>}
                  <span className="sale-badge">SAVE {Math.round(product.saving).toLocaleString()} ETB</span>
                </div>
                <div className="sale-info">
                  <p>{product.store?.storeName || "BeautyMart Store"}</p>
                  <h3>{product.productName}</h3>
                  <div className="sale-prices">
                    <strong>{product.salePrice.toLocaleString()} ETB</strong>
                    <span>{Number(product.price).toLocaleString()} ETB</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </HorizontalCarousel>
      </div>
    </section>
  );
}
