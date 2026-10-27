
import Link from "next/link";
import styles from "../info-pages.module.css";

const paymentSteps = [
  {
    number: "01",
    title: "Review your checkout",
    text: "Check the items, quantities, prices, and total before placing your order.",
  },
  {
    number: "02",
    title: "Choose an available method",
    text: "Use a payment option actually displayed by BeautyMart during your checkout.",
  },
  {
    number: "03",
    title: "Follow payment instructions",
    text: "Complete the payment through the displayed provider flow. Wait for confirmation rather than assuming a payment succeeded.",
  },
  {
    number: "04",
    title: "Check your order status",
    text: "Return to your orders and check the status. If the payment result is unclear, contact support before trying repeatedly.",
  },
];

export default function PaymentsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>PAYMENT INFORMATION</span>
        <h1>Pay with <span>confidence.</span></h1>
        <p>
          Understand the checkout process and how to check whether your
          payment and order have been confirmed.
        </p>
      </section>

      <section className={styles.content}>
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>HOW PAYMENT WORKS</span>
          <h2>Follow these steps</h2>
        </div>

        <div className={styles.stepsGrid}>
          {paymentSteps.map((step) => (
            <article className={styles.stepCard} key={step.number}>
              <span className={styles.stepNumber}>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className={styles.notice}>
          <strong>Which payment methods are available?</strong>
          <p>
            The methods offered at checkout are the ones to rely on for your
            order. Availability can depend on the payment integrations enabled
            for the platform. Do not send money to a personal account or use an
            off-platform payment method unless BeautyMart explicitly provides
            and verifies that option.
          </p>
        </div>

        <div className={styles.twoColumn}>
          <article className={styles.card}>
            <h2>Payment still pending?</h2>
            <p>
              A pending result does not necessarily mean payment has succeeded
              or failed. Check the latest order status before attempting
              another payment.
            </p>
          </article>
          <article className={styles.card}>
            <h2>Need payment support?</h2>
            <p>
              Include your order reference and a description of the issue.
              Never send your password, payment PIN, or one-time verification
              code.
            </p>
            <Link className={styles.button} href="/contact">Contact support</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
