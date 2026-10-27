
import Link from "next/link";
import styles from "../info-pages.module.css";

const deliverySteps = [
  {
    number: "01",
    title: "Place your order",
    text: "Choose your products, review your order, and complete the available checkout steps.",
  },
  {
    number: "02",
    title: "The store processes it",
    text: "The store reviews the order and updates its status as it moves through the order process.",
  },
  {
    number: "03",
    title: "Follow your order",
    text: "Sign in and visit My Orders to check the order information and status available to you.",
  },
];

export default function DeliveryPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>ORDERS AND DELIVERY</span>
        <h1>From our stores <span>to you.</span></h1>
        <p>
          Learn what happens after you place an order on BeautyMart and how to
          find information about your purchase.
        </p>
      </section>

      <section className={styles.content}>
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>THE PROCESS</span>
          <h2>What happens after checkout?</h2>
        </div>

        <div className={styles.stepsGrid}>
          {deliverySteps.map((step) => (
            <article className={styles.stepCard} key={step.number}>
              <span className={styles.stepNumber}>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className={styles.notice}>
          <strong>Delivery times and arrangements</strong>
          <p>
            Delivery availability, costs, timing, and handover arrangements may
            vary by store and order. Check the information shown during
            checkout or provided by the store. BeautyMart does not promise a
            fixed delivery timeframe on this page.
          </p>
        </div>

        <div className={styles.twoColumn}>
          <article className={styles.card}>
            <h2>Need an order update?</h2>
            <p>
              Sign in to check your order status. If you need more information,
              contact BeautyMart and include your order reference.
            </p>
            <Link className={styles.button} href="/orders">View my orders</Link>
          </article>

          <article className={styles.card}>
            <h2>Have a delivery question?</h2>
            <p>
              Contact us if you need help understanding the delivery
              information for a particular order.
            </p>
            <Link className={styles.button} href="/contact">Contact us</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
