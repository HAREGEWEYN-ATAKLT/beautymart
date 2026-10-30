"use client";


import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  store: string;
  storeId: string;
  quantity: number;
};

type AwaitingPaymentOrder = { orderId: string; lines: CartItem[] };

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [awaitingOrders, setAwaitingOrders] = useState<AwaitingPaymentOrder[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("beautymart-cart");

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const savedAwaiting = localStorage.getItem("beautymart-awaiting-payment-orders");
    if (savedAwaiting) {
      setAwaitingOrders(JSON.parse(savedAwaiting));
    }

    setLoaded(true);
  }, []);

  const updateCart = (id: string, change: number) => {
    const updatedCart = cart
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + change),
            }
          : item
      );

    setCart(updatedCart);
    localStorage.setItem("beautymart-cart", JSON.stringify(updatedCart));
  };

  const removeItem = (id: string) => {
    const updatedCart = cart.filter((item) => item.id !== id);

    setCart(updatedCart);
    localStorage.setItem("beautymart-cart", JSON.stringify(updatedCart));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!loaded) {
    return (
      <main className="cart-page">
        <div className="cart-loading">
          <p>Loading your cart...</p>
        </div>
      </main>
    );
  }

  if (cart.length === 0 && awaitingOrders.length === 0) {
    return (
      <main className="cart-page">
        <section className="cart-empty">
          <p className="section-eyebrow">YOUR BEAUTYMART BAG</p>

          <h1>
            Your bag is
            <br />
            <span>empty.</span>
          </h1>

          <p>
            Discover beauty products from independent businesses
            across Ethiopia and add something you love.
          </p>

          <Link href="/products" className="cart-empty-button">
            Explore products →
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <section className="cart-header">
        <div className="cart-container">
          <p className="section-eyebrow">YOUR BEAUTYMART BAG</p>

          <h1>
            Your beauty
            <br />
            <span>selections.</span>
          </h1>

          <p>
            Review your products before continuing to checkout.
          </p>
        </div>
      </section>

      <section className="cart-section">
        <div className="cart-container">
          <div className="cart-layout">
            <div className="cart-items">
              <div className="cart-items-header">
                <h2>Cart items</h2>
                <span>
                  {cart.length} {cart.length === 1 ? "item" : "items"}
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="cart-awaiting-payment">
                  <strong>Your bag is ready for new products.</strong>
                  <span>Items awaiting payment are listed below and are not included in a new checkout.</span>
                </div>
              ) : cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <Link
                    href={`/products/${item.id}`}
                    className="cart-item-image"
                  >
                   <img
  src={item.image}
  alt={item.name}
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }}
/>
                  </Link>

                  <div className="cart-item-info">
                    <p>{item.store}</p>

                    <Link href={`/products/${item.id}`}>
                      <h3>{item.name}</h3>
                    </Link>

                    <span>
                      {item.price.toLocaleString()} ETB
                    </span>

                    <div className="cart-item-actions">
                      <div className="cart-quantity">
                        <button
                          type="button"
                          onClick={() => updateCart(item.id, -1)}
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          −
                        </button>

                        <strong>{item.quantity}</strong>

                        <button
                          type="button"
                          onClick={() => updateCart(item.id, 1)}
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="remove-item"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <strong className="cart-item-total">
                    {(item.price * item.quantity).toLocaleString()} ETB
                  </strong>
                </div>
              ))}

              {awaitingOrders.length > 0 && (
                <section className="cart-awaiting-payment">
                  <div className="cart-awaiting-payment-heading">
                    <span className="cart-awaiting-payment-icon" aria-hidden="true">!</span>
                    <div>
                      <p className="section-eyebrow">AWAITING PAYMENT</p>
                      <h2>Orders awaiting Chapa verification</h2>
                    </div>
                    <span className="cart-awaiting-payment-count" aria-label={`${awaitingOrders.length} orders awaiting payment`}>
                      {awaitingOrders.length}
                    </span>
                  </div>
                  <p className="cart-awaiting-payment-description">
                    These items are safely separated from your new cart. Open an order to check its payment status before paying again.
                  </p>
                  {awaitingOrders.map((pending) => (
                    <div className="cart-awaiting-order" key={pending.orderId}>
                      <div className="cart-awaiting-order-details">
                        <span className="cart-awaiting-order-label">Payment needs checking</span>
                        <strong>{pending.lines.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</strong>
                        <span className="cart-awaiting-order-total">{pending.lines.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()} ETB</span>
                      </div>
                      <Link href={`/orders/${pending.orderId}`} className="cart-awaiting-order-action">
                        View order <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  ))}
                </section>
              )}
            </div>

            <aside className="cart-summary">
              <p className="section-eyebrow">ORDER SUMMARY</p>

              <h2>Your order</h2>

              <div className="cart-summary-row">
                <span>Subtotal</span>
                <strong>{total.toLocaleString()} ETB</strong>
              </div>

              <div className="cart-summary-row">
                <span>Delivery</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="cart-summary-divider"></div>

              <div className="cart-summary-total">
                <span>Estimated total</span>
                <strong>{total.toLocaleString()} ETB</strong>
              </div>

              {cart.length > 0 ? (
                <Link href="/checkout" className="checkout-button">
                  Continue to checkout
                  <span>→</span>
                </Link>
              ) : (
                <Link href="/products" className="checkout-button">
                  Add new products
                  <span>→</span>
                </Link>
              )}

              <Link href="/products" className="continue-shopping">
                ← Continue shopping
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
