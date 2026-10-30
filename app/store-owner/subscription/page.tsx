
"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "./subscription.css"
type Subscription = {
  planType: "TRIAL" | "STARTER" | "STANDARD";
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED" | "CANCELLED";
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type Store = {
  storeId: string;
  storeName: string;
  subscription: Subscription | null;
};
type SubscriptionPayment = {
  subscriptionPaymentId: string;
  planType: "TRIAL" | "STARTER" | "STANDARD";
  provider: string;
  amount: string;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
  paidAt: string | null;
};
function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getEthiopianDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Addis_Ababa",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

function getDaysRemaining(endDate: string): number {
  const today = getEthiopianDateKey(new Date());
  const expiry = getEthiopianDateKey(new Date(endDate));

  const toUtcDay = (dateKey: string) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };

  return Math.round(
    (toUtcDay(expiry) - toUtcDay(today)) / (24 * 60 * 60 * 1000)
  );
}

function SubscriptionContent() {
 const [store, setStore] = useState<Store | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const searchParams = useSearchParams();
const router = useRouter();

const paymentResult = searchParams.get("subscription_payment");

const [paymentMessage, setPaymentMessage] = useState("");
const [startingPlan, setStartingPlan] = useState<
  "STARTER" | "STANDARD" | null
>(null);

async function startSubscriptionPayment(
  planType: "STARTER" | "STANDARD"
) {
  if (startingPlan) return;

  setStartingPlan(planType);
  setPaymentMessage("");

  try {
    const response = await fetch("/api/subscriptions/chapa/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planType }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to start payment. Please try again."
      );
    }

    const checkoutUrl = data.checkoutUrl;

    if (
      typeof checkoutUrl !== "string" ||
      !/^https:\/\/[^/]*chapa\.co(\/|$)/i.test(checkoutUrl)
    ) {
      throw new Error(
        "The payment provider returned an invalid checkout URL."
      );
    }

    window.location.assign(checkoutUrl);
  } catch (err) {
    setPaymentMessage(
      err instanceof Error
        ? err.message
        : "Unable to start payment. Please try again."
    );
    setStartingPlan(null);
  }
}
const [paymentHistory, setPaymentHistory] = useState<
  SubscriptionPayment[]
>([]);
const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(true);
const [paymentHistoryError, setPaymentHistoryError] = useState("");
useEffect(() => {
  if (paymentResult === "success") {
    setPaymentMessage(
      "Payment verified. Your subscription details are loading."
    );
  } else if (paymentResult === "failed") {
    setPaymentMessage(
      "The payment could not be confirmed. Check your payment status before trying again."
    );
  } else if (paymentResult === "pending") {
    setPaymentMessage(
      "Payment verification is still pending. Please do not start another payment yet."
    );
  }

  if (paymentResult) {
    router.replace("/store-owner/subscription");
  }
}, [paymentResult, router]);
  useEffect(() => {
    async function loadSubscription() {
      try {
        const response = await fetch("/api/stores", {
          cache: "no-store",
        });

        const data = await response.json();

       
if (!response.ok) {
  throw new Error(
    data.message || "Unable to load your store."
  );
}


        const stores = data.stores ?? [];
        const currentStore = stores[0];

        if (!currentStore) {
          setError("No store was found for your account.");
          return;
        }

        setStore(currentStore);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading your subscription."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, []);
          useEffect(() => {
  let cancelled = false;

  async function loadPaymentHistory() {
    try {
      const response = await fetch(
        "/api/subscriptions/payment-status",
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load payment history."
        );
      }

      if (!cancelled) {
        setPaymentHistory(data.payments ?? []);
      }
    } catch (err) {
      if (!cancelled) {
        setPaymentHistoryError(
          err instanceof Error
            ? err.message
            : "Unable to load payment history."
        );
      }
    } finally {
      if (!cancelled) {
        setPaymentHistoryLoading(false);
      }
    }
  }
loadPaymentHistory();

    return () => {
      cancelled = true;
    };
  }, []);

 const subscription = store?.subscription;

const isPastEndDate = subscription
  ? new Date(subscription.endDate).getTime() <= new Date().getTime()
  : false;
  const isCurrent =
    subscription?.status === "ACTIVE" &&
    subscription.isActive &&
    !isPastEndDate;

  const displayStatus = subscription
    ? isPastEndDate && subscription.status === "ACTIVE"
      ? "EXPIRED"
      : subscription.status
    : "NO SUBSCRIPTION";

  const planName =
    subscription?.planType === "TRIAL"
      ? "Free Trial"
      : subscription?.planType === "STARTER"
        ? "6-Month Plan"
        : subscription?.planType === "STANDARD"
          ? "1-Year Plan"
          : "No Plan";
const daysRemaining = subscription
  ? getDaysRemaining(subscription.endDate)
  : null;

const reminderThreshold =
  subscription?.planType === "TRIAL"
    ? 5
    : subscription?.planType === "STARTER"
      ? 10
      : subscription?.planType === "STANDARD"
        ? 15
        : 0;

const showExpiryWarning =
  isCurrent &&
  daysRemaining !== null &&
  daysRemaining >= 0 &&
  daysRemaining <= reminderThreshold;
  return (
    <main className="subscription-page">
        {paymentMessage && (
  <div
    role="status"
    aria-live="polite"
    className="subscription-payment-message"
  >
    {paymentMessage}
  </div>
)}
      <header className="subscription-page-header">
        <Link
          href="/store-owner"
          className="subscription-back-link"
        >
          ← Back to Dashboard
        </Link>

        <p className="subscription-eyebrow">
          STORE MANAGEMENT
        </p>

        <h1>Your Subscription</h1>

        <p className="subscription-page-description">
          Manage your store plan, check your trial period,
          and explore available subscription plans.
        </p>
      </header>

      {loading ? (
        <section className="subscription-panel">
          Loading your subscription...
        </section>
      ) : error ? (
        <section className="subscription-panel">
          <h2>Unable to load subscription</h2>
          <p>{error}</p>
          <button
            className="subscription-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </section>
      ) : (
        <>
          <section className="subscription-panel">
            <div className="subscription-panel-top">
              <div>
                <p className="subscription-muted">
                  CURRENT STORE
                </p>
                <h2>{store?.storeName}</h2>
                <p className="subscription-muted">
                  Your current subscription details
                </p>
              </div>

              <span
                className={`subscription-pill ${
                  isCurrent
                    ? "subscription-pill-active"
                    : "subscription-pill-inactive"
                }`}
              >
                {displayStatus}
              </span>
            </div>

            {subscription ? (
              <>
                <div className="subscription-info-grid">
                  <div className="subscription-info-item">
                    <span>Current plan</span>
                    <strong>{planName}</strong>
                  </div>

                  <div className="subscription-info-item">
                    <span>Start date</span>
                    <strong>
                      {formatDate(subscription.startDate)}
                    </strong>
                  </div>

                  <div className="subscription-info-item">
                    <span>
                      {isPastEndDate ? "Ended on" : "Expires on"}
                    </span>
                    <strong>
                      {formatDate(subscription.endDate)}
                    </strong>
                  </div>
                </div>

{showExpiryWarning && daysRemaining !== null && subscription && (
  <div
    className="subscription-expiry-warning"
    role="status"
    aria-live="polite"
  >
    <strong>
      {daysRemaining === 0
        ? "Your subscription expires today"
        : `Your subscription expires in ${daysRemaining} ${
            daysRemaining === 1 ? "day" : "days"
          }`}
    </strong>

    <p>
      Your {planName.toLowerCase()} ends on{" "}
      {formatDate(subscription.endDate)}. Plan ahead to avoid
      interruption to your store management.
    </p>
  </div>
)}

                <div className="subscription-message">
                  <strong>
                    {subscription.status === "SUSPENDED"
                      ? "Your subscription is suspended"
                      : subscription.status === "CANCELLED"
                        ? "Your subscription is cancelled"
                        : isPastEndDate
                          ? "Your subscription period has ended"
                          : isCurrent
                            ? subscription.planType === "TRIAL"
                              ? "Your free trial is active"
                              : "Your subscription is active"
                            : "Your subscription needs attention"}
                  </strong>

                  <p>
                    {isCurrent
                      ? "Review the plans below to understand your options before your current subscription ends."
                      : "Please contact BeautyMart support for help with your subscription status."}
                  </p>
                </div>
              </>
            ) : (
              <div className="subscription-message">
                <strong>No subscription record found</strong>
                <p>
                  Your store does not have a subscription record.
                  Please contact BeautyMart support.
                </p>
              </div>
            )}
          </section>
<section className="subscription-panel">
  <div className="subscription-panel-top">
    <div>
      <p className="subscription-muted">PAYMENT RECORDS</p>
      <h2>Payment History</h2>
      <p className="subscription-muted">
        Review your subscription payment attempts and their status.
      </p>
    </div>
  </div>

  {paymentHistoryLoading ? (
    <p>Loading payment history...</p>
  ) : paymentHistoryError ? (
    <p role="alert">{paymentHistoryError}</p>
  ) : paymentHistory.length === 0 ? (
    <p className="subscription-muted">
      No subscription payment records found.
    </p>
  ) : (
    <div className="subscription-info-grid">
      {paymentHistory.map((payment) => (
        <article
          className="subscription-info-item"
          key={payment.subscriptionPaymentId}
        >
          <span>
            {payment.planType === "STARTER"
              ? "6-Month Plan"
              : payment.planType === "STANDARD"
                ? "1-Year Plan"
                : "Free Trial"}
          </span>

          <strong>
            {Number(payment.amount).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {payment.currency}
          </strong>

          <span>
            Status: {payment.status}
          </span>

          <span>
            Provider: {payment.provider}
          </span>

          <span>
            Created: {formatDate(payment.createdAt)}
          </span>

          {payment.paidAt && (
            <span>
              Paid on: {formatDate(payment.paidAt)}
            </span>
          )}
        </article>
      ))}
    </div>
  )}
</section>
          <section className="subscription-plans-section">
            <div className="subscription-section-heading">
              <p className="subscription-eyebrow">
                SUBSCRIPTION OPTIONS
              </p>
              <h2>Plans for your business</h2>
              <p>
                Choose a plan to continue managing your store
                after your free trial.
              </p>
            </div>

            <div className="subscription-plans-grid">
              <article className="subscription-plan-card">
                <p className="subscription-plan-label">
                  STARTER
                </p>
                <h3>6-Month Plan</h3>
                <p className="subscription-price">
                  3,000 <span>ETB</span>
                </p>
                <p className="subscription-plan-duration">
                  For 6 months
                </p>
                <div className="subscription-plan-divider" />
                <p className="subscription-plan-description">
                  Six months of subscription for your beauty
                  business.
                </p>
               <button
  type="button"
  className="subscription-button subscription-button-secondary"
  onClick={() => startSubscriptionPayment("STARTER")}
disabled={
  startingPlan !== null ||
  (isCurrent &&
    (subscription?.planType === "STARTER" ||
      subscription?.planType === "STANDARD"))
}
>
  {startingPlan === "STARTER" ? "Connecting to Chapa..." : "Continue to Chapa — 3,000 ETB"}
</button>
              </article>

              <article className="subscription-plan-card subscription-plan-featured">
                <span className="subscription-recommended">
                  LONG-TERM PLAN
                </span>
                <p className="subscription-plan-label">
                  STANDARD
                </p>
                <h3>1-Year Plan</h3>
                <p className="subscription-price">
                  5,000 <span>ETB</span>
                </p>
                <p className="subscription-plan-duration">
                  For 12 months
                </p>
                <div className="subscription-plan-divider" />
                <p className="subscription-plan-description">
                  One year of subscription for your beauty
                  business.
                </p>
               <button
  type="button"
  className="subscription-button"
  onClick={() => startSubscriptionPayment("STANDARD")}
 disabled={
  startingPlan !== null ||
  (isCurrent &&
    (subscription?.planType === "STARTER" ||
      subscription?.planType === "STANDARD"))
}
>
  {startingPlan === "STANDARD" ? "Connecting to Chapa..." : "Continue to Chapa — 5,000 ETB"}
</button>
              </article>
            </div>

           <p className="subscription-payment-note">
  Subscription payments are available to store owners only. Chapa shows only
  the payment options enabled for BeautyMart, such as Telebirr or supported
  bank methods. Your plan activates only after BeautyMart verifies payment
  with Chapa.
</p>
          </section>
        </>
      )}
        </main>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <main className="subscription-page">
          Loading subscription...
        </main>
      }
    >
      <SubscriptionContent />
    </Suspense>
  );
}
