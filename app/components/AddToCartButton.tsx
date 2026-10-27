"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AddToCartButtonProps = {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    store: string;
    storeId: string;
  };
};

export default function AddToCartButton({
  product,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = () => {
    setAdding(true);

    const existingCart = localStorage.getItem("beautymart-cart");

    const cart = existingCart ? JSON.parse(existingCart) : [];

    const existingItem = cart.find(
      (item: { id: string }) => item.id === product.id
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }

    localStorage.setItem("beautymart-cart", JSON.stringify(cart));

    // Tell the Navbar that the cart changed
    window.dispatchEvent(new Event("cartUpdated"));

    // Give the user a short visual confirmation
    setTimeout(() => {
      router.push("/cart");
    }, 500);
  };

  return (
    <button
      type="button"
      className="add-to-cart-button"
      onClick={handleAddToCart}
      disabled={adding}
    >
      {adding ? "Adding..." : "Add to cart"}
      <span>{adding ? "" : "→"}</span>
    </button>
  );
}