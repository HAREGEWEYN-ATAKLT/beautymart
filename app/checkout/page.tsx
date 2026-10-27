"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  store: string;
  storeId: string;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
const [region, setRegion] = useState("");
const [city, setCity] = useState("");
const [subCity, setSubCity] = useState("");
const [woreda, setWoreda] = useState("");
const [houseNumber, setHouseNumber] = useState("");
const [paymentMethod, setPaymentMethod] = useState("Telebirr");
const [isPlacingOrder, setIsPlacingOrder] = useState(false);
const [pendingChapaOrderId, setPendingChapaOrderId] = useState<string | null>(null);
const [chapaAttemptUncertain, setChapaAttemptUncertain] = useState(false);
  const router = useRouter();
 const { data: session, status } = useSession();
    useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);
  useEffect(() => {
    const savedCart = localStorage.getItem("beautymart-cart");

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    setLoaded(true);
  }, []);

useEffect(() => {
  const savedOrderId = localStorage.getItem(
    "beautymart-pending-chapa-order"
  );

  const savedUncertainStatus = localStorage.getItem(
    "beautymart-chapa-attempt-uncertain"
  );

  if (savedOrderId) {
    setPendingChapaOrderId(savedOrderId);
  }

  if (savedUncertainStatus === "true") {
    setChapaAttemptUncertain(true);
  }
}, []);





const handleCheckChapaStatus = async () => {
  const txRef = localStorage.getItem("beautymart-chapa-tx-ref");
  const orderId =
    pendingChapaOrderId ??
    localStorage.getItem("beautymart-pending-chapa-order");

  if (!txRef && !orderId) {
    alert("No existing order was found. Please check your orders.");
    return;
  }


  setIsPlacingOrder(true);

  try {
   
const statusUrl = txRef
  ? `/api/payments/chapa/status?txRef=${encodeURIComponent(txRef)}`
  : `/api/payments/chapa/status?orderId=${encodeURIComponent(orderId!)}`;

const response = await fetch(statusUrl, {
  cache: "no-store",
});


    const data = await response.json().catch(() => null);

    if (data?.status === "PAID") {
      localStorage.removeItem("beautymart-chapa-attempt-uncertain");
      localStorage.removeItem("beautymart-chapa-tx-ref");
      localStorage.removeItem("beautymart-pending-chapa-order");
      localStorage.removeItem("beautymart-cart");

      setChapaAttemptUncertain(false);
      setPendingChapaOrderId(null);
      setCart([]);

      window.dispatchEvent(new Event("cartUpdated"));

      alert("Payment confirmed successfully.");
      router.push("/products");
      return;
    }

    if (data?.status === "FAILED" && data?.retryable === true) {
      localStorage.removeItem("beautymart-chapa-attempt-uncertain");
      localStorage.removeItem("beautymart-chapa-tx-ref");

      setChapaAttemptUncertain(false);

      alert(
        "Chapa confirmed that the previous attempt failed. " +
          "You can safely retry payment using your existing order."
      );
      return;
    }

    alert(
      data?.message ||
        "The payment is not confirmed yet. Do not retry until its status is resolved."
    );
  } catch (error) {
    console.error("Check Chapa status error:", error);

    alert(
      "Could not check payment status. Your order is preserved. " +
        "Please try checking again."
    );
  } finally {
    setIsPlacingOrder(false);
  }
};

const handlePlaceOrder = async () => {
  if (isPlacingOrder) return;

  if (chapaAttemptUncertain) {
    alert(
      "The existing Chapa payment attempt has an uncertain status. " +
        "Check its status before trying again. Do not place another order."
    );
    return;
  }

  if (cart.length === 0 && !pendingChapaOrderId) {
    alert("Your cart is empty.");
    return;
  }

  setIsPlacingOrder(true);

  try {
    let orderId = pendingChapaOrderId;

    // Create an order only when there is no existing Chapa order to retry.
    if (!orderId) {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          region,
          city,
          subCity,
          woreda,
          houseNumber,
          paymentMethod,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        alert(data?.message || "Failed to place order.");
        return;
      }

      const order = data?.orders?.[0];

      if (!order?.orderId) {
        alert(
          "The order response did not include an order ID. " +
            "Check your orders before trying again."
        );
        return;
      }

orderId = order.orderId;

if (paymentMethod === "Chapa") {
  // The order ID has been validated above.
  const createdOrderId = order.orderId;

  setPendingChapaOrderId(createdOrderId);

  localStorage.setItem(
    "beautymart-pending-chapa-order",
    createdOrderId
  );
}
} // Closes: if (!orderId)

if (paymentMethod === "Chapa") {
      const chapaResponse = await fetch("/api/payments/chapa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });


const chapaData = await chapaResponse.json().catch(() => null);
const txRef =
  chapaData?.transactionReference ?? chapaData?.txRef;

if (!chapaResponse.ok) {
  // Only allow a retry when the server confirms the failed
  // initialization attempt has been released.
  const safeToRetry =
    chapaResponse.status === 400 &&
    typeof chapaData?.message === "string" &&
    chapaData.message.toLowerCase().includes("released");

  if (safeToRetry) {
    localStorage.removeItem("beautymart-chapa-attempt-uncertain");
    localStorage.removeItem("beautymart-chapa-tx-ref");

    setChapaAttemptUncertain(false);

    alert(
      chapaData.message +
        "\nYour existing order is preserved. You can retry payment."
    );
  } else {
    setChapaAttemptUncertain(true);

    localStorage.setItem(
      "beautymart-chapa-attempt-uncertain",
      "true"
    );

    if (typeof txRef === "string" && txRef.length > 0) {
      localStorage.setItem("beautymart-chapa-tx-ref", txRef);
    }

    alert(
      (chapaData?.message || "Unable to start Chapa payment.") +
        "\n\nYour existing order is preserved. Check the payment status before retrying."
    );
  }

  return;
}

const checkoutUrl = chapaData?.checkoutUrl;
let validCheckoutUrl = false;

if (typeof checkoutUrl === "string") {
  try {
    const parsedUrl = new URL(checkoutUrl);

    validCheckoutUrl =
      parsedUrl.protocol === "https:" &&
      (parsedUrl.hostname === "chapa.co" ||
        parsedUrl.hostname.endsWith(".chapa.co"));
  } catch {
    validCheckoutUrl = false;
  }
}

if (!validCheckoutUrl) {
  setChapaAttemptUncertain(true);

  localStorage.setItem(
    "beautymart-chapa-attempt-uncertain",
    "true"
  );

  if (typeof txRef === "string" && txRef.length > 0) {
    localStorage.setItem("beautymart-chapa-tx-ref", txRef);
  }

  console.error("Invalid Chapa checkout URL:", checkoutUrl);

  alert(
    "Chapa did not return a valid checkout link. " +
      "Your order is preserved. Check the existing payment attempt " +
      "before doing anything else."
  );

  return;
}

if (typeof txRef === "string" && txRef.length > 0) {
  localStorage.setItem("beautymart-chapa-tx-ref", txRef);
}

window.location.assign(checkoutUrl);
return;
}

// Preserve existing behavior for non-Chapa payments.
localStorage.removeItem("beautymart-cart");
window.dispatchEvent(new Event("cartUpdated"));
router.push("/products");
}  catch (error) {
  console.error("Place order error:", error);

  const savedOrderId = localStorage.getItem(
    "beautymart-pending-chapa-order"
  );

  if (paymentMethod === "Chapa" && savedOrderId) {
    setChapaAttemptUncertain(true);

    localStorage.setItem(
      "beautymart-chapa-attempt-uncertain",
      "true"
    );

    alert(
      "We could not confirm the Chapa request. Your order is preserved. " +
        "Check the existing payment status before trying again."
    );
  } else {
    alert(
      "The request could not be completed. Check your orders before trying again."
    );
  }
} finally {
  setIsPlacingOrder(false);
}
};



  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
if (status === "loading" || status === "unauthenticated") {
  return (
    <main className="checkout-page">
      <div className="checkout-loading">
        Checking your account...
      </div>
    </main>
  );
}
  if (!loaded) {
    return (
      <main className="checkout-page">
        <div className="checkout-loading">
          Loading checkout...
        </div>
      </main>
    );
  }

if (cart.length === 0 && !pendingChapaOrderId) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <p className="section-eyebrow">CHECKOUT</p>

          <h1>
            Your bag is
            <br />
            <span>empty.</span>
          </h1>

          <p>
            Add products to your cart before continuing to checkout.
          </p>

          <Link href="/products" className="checkout-empty-button">
            Explore products →
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-header">
        <div className="checkout-container">
          <Link href="/cart" className="checkout-back">
            ← Back to cart
          </Link>

          <p className="section-eyebrow">BEAUTYMART CHECKOUT</p>

          <h1>
            Complete your
            <br />
            <span>order.</span>
          </h1>
        </div>
      </section>

      <section className="checkout-section">
        <div className="checkout-container">
          <div className="checkout-layout">

            {/* CUSTOMER INFORMATION */}

            <div className="checkout-form">

              <div className="checkout-form-section">
                <div className="checkout-section-heading">
                  <span>01</span>
                  <div>
                    <p className="section-eyebrow">
                      CUSTOMER INFORMATION
                    </p>
                    <h2>Your details</h2>
                  </div>
                </div>

                <div className="checkout-fields">

                  <div className="checkout-field">
                    <label htmlFor="fullName">
                      Full name
                    </label>

                   <input
  id="fullName"
  type="text"
  placeholder="Enter your full name"
  defaultValue={session?.user?.name ?? ""}
/>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="phone">
                      Phone number
                    </label>

                    <input
  id="phone"
  type="tel"
  placeholder="+251 9XX XXX XXX"
  defaultValue={session?.user?.phoneNumber ?? ""}
/>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="email">
                      Email address
                    </label>

                   <input
  id="email"
  type="email"
  placeholder="you@example.com"
  defaultValue={session?.user?.email ?? ""}
/>
                  </div>

                </div>
              </div>


              {/* DELIVERY ADDRESS */}

              <div className="checkout-form-section">
                <div className="checkout-section-heading">
                  <span>02</span>
                  <div>
                    <p className="section-eyebrow">
                      DELIVERY ADDRESS
                    </p>
                    <h2>Where should we deliver?</h2>
                  </div>
                </div>

                <div className="checkout-fields">

                  <div className="checkout-field">
                    <label htmlFor="region">
                      Region
                    </label>

                   <input
  id="region"
  type="text"
  placeholder="e.g. Amhara"
  value={region}
  onChange={(e) => setRegion(e.target.value)}
/>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="city">
                      City
                    </label>

                   <input
  id="city"
  type="text"
  placeholder="e.g. Bahir Dar"
  value={city}
  onChange={(e) => setCity(e.target.value)}
/>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="subCity">
                      Sub-city
                    </label>

                   <input
  id="subCity"
  type="text"
  placeholder="Enter sub-city"
  value={subCity}
  onChange={(e) => setSubCity(e.target.value)}
/>
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="woreda">
                      Woreda
                    </label>

                    <input
  id="woreda"
  type="text"
  placeholder="Enter woreda"
  value={woreda}
  onChange={(e) => setWoreda(e.target.value)}
/>
                  </div>

                  <div className="checkout-field checkout-field-full">
                    <label htmlFor="houseNumber">
                      House number / Delivery details
                    </label>

                  <input
  id="houseNumber"
  type="text"
  placeholder="House number, landmark, or additional directions"
  value={houseNumber}
  onChange={(e) => setHouseNumber(e.target.value)}
/>
                  </div>

                </div>
              </div>


              {/* PAYMENT */}

              <div className="checkout-form-section">
                <div className="checkout-section-heading">
                  <span>03</span>
                  <div>
                    <p className="section-eyebrow">
                      PAYMENT
                    </p>
                    <h2>Choose payment method</h2>
                  </div>
                </div>

                <div className="payment-options">

                  <label className="payment-option">
                  <input
  type="radio"
  name="payment"
  value="Telebirr"
  checked={paymentMethod === "Telebirr"}
  onChange={(e) => setPaymentMethod(e.target.value)}
/>

                    <div>
                      <strong>Telebirr</strong>
                      <span>
                        Pay securely using Telebirr
                      </span>
                    </div>
                  </label>

                  <label className="payment-option">
                   <input
  type="radio"
  name="payment"
  value="Chapa"
  checked={paymentMethod === "Chapa"}
  onChange={(e) => setPaymentMethod(e.target.value)}
/>

                    <div>
                      <strong>Chapa</strong>
                      <span>
                        Pay using a supported Chapa method
                      </span>
                    </div>
                  </label>

                  <label className="payment-option">
                  <input
  type="radio"
  name="payment"
  value="Bank"
  checked={paymentMethod === "Bank"}
  onChange={(e) => setPaymentMethod(e.target.value)}
/>
                    <div>
                      <strong>Bank payment</strong>
                      <span>
                        Use a supported bank payment option
                      </span>
                    </div>
                  </label>

                </div>
              </div>

            </div>


            {/* ORDER SUMMARY */}

            <aside className="checkout-summary">

              <p className="section-eyebrow">
                YOUR ORDER
              </p>

              <h2>Order summary</h2>

              <div className="checkout-products">

                {cart.map((item) => (
                  <div
                    className="checkout-product"
                    key={item.id}
                  >
                    <div>
                      <strong>{item.name}</strong>

                      <span>
                        {item.store} · Qty {item.quantity}
                      </span>
                    </div>

                    <strong>
                      {(item.price * item.quantity).toLocaleString()} ETB
                    </strong>
                  </div>
                ))}

              </div>

              <div className="checkout-summary-divider"></div>

              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <strong>
                  {subtotal.toLocaleString()} ETB
                </strong>
              </div>

              <div className="checkout-summary-row">
                <span>Delivery</span>
                <span>Calculated by store</span>
              </div>

              <div className="checkout-summary-divider"></div>

              <div className="checkout-total">
                <span>Total</span>

                <strong>
                  {subtotal.toLocaleString()} ETB
                </strong>
              </div>

              {/* <button
  type="button"
  className="place-order-button"
  onClick={handlePlaceOrder}
>
  Place order
  <span>→</span>
</button> */}
{/* <button
  type="button"
  className="place-order-button"
  onClick={handlePlaceOrder}
  disabled={isPlacingOrder || chapaAttemptUncertain}
>
  {isPlacingOrder
    ? "Processing..."
    : pendingChapaOrderId
      ? "Retry payment"
      : "Place order"}
  {!isPlacingOrder && <span>→</span>}
</button> */}
{chapaAttemptUncertain && (
  <button
    type="button"
    className="place-order-button"
    onClick={handleCheckChapaStatus}
    disabled={isPlacingOrder}
  >
    {isPlacingOrder ? "Checking..." : "Check payment status"}
  </button>
)}

{!chapaAttemptUncertain && (
  <button
    type="button"
    className="place-order-button"
    onClick={handlePlaceOrder}
    disabled={isPlacingOrder}
  >
    {isPlacingOrder
      ? "Processing..."
      : pendingChapaOrderId
        ? "Retry payment"
        : "Place order"}
    {!isPlacingOrder && <span>→</span>}
  </button>
)}
              <p className="checkout-note">
                Your payment is made directly through the
                selected payment method. BeautyMart does not
                hold your payment.
              </p>

            </aside>

          </div>
        </div>
      </section>
    </main>
  );
}