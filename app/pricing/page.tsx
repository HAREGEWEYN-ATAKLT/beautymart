
import Link from "next/link";
import styles from "./pricing.module.css";

const features = [
  "Your own BeautyMart storefront",
  "Product listings and image uploads",
  "Product categories and inventory management",
  "Customer order management",
  "Store dashboard and settings",
];

const faqs = [
  {
    question: "Who pays the subscription?",
    answer:
      "The subscription is for store owners. Customers can browse the marketplace and purchase products without buying a seller subscription.",
  },
  {
    question: "How does the one-month trial work?",
    answer:
      "Every new store starts with a one-month trial. You can choose a paid plan before the trial ends. When a paid subscription is successfully activated, its period starts immediately and unused trial time is not saved.",
  },
  {
    question: "What happens when my trial expires?",
    answer:
      "If your trial expires without an eligible paid subscription, store management is restricted until you obtain an eligible paid plan. This restriction applies to that store, not other stores.",
  },
  {
    question: "Can I change from Starter to Standard?",
    answer:
      "Use your store subscription page to review the available plans and follow the supported payment process. Check the terms shown there before making a payment.",
  },
  {
    question: "How do I pay?",
    answer:
      "Sign in as a store owner and use the subscription page to select an available plan and follow the payment instructions. A plan should be treated as paid only after the payment has been verified successfully.",
  },
];

export default function PricingPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link href="/" className={styles.breadcrumb}>
            BeautyMart <span>/</span> Pricing
          </Link>

          <p className={styles.eyebrow}>SIMPLE, TRANSPARENT PRICING</p>

          <h1>
            Room to grow.
            <br />
            <em>A plan for your business.</em>
          </h1>

          <p className={styles.heroDescription}>
            Start with a one-month trial, explore your store dashboard, and
            choose a subscription that fits your beauty business.
          </p>

          <a href="#plans" className={styles.heroButton}>
            Explore plans <span aria-hidden="true">↓</span>
          </a>

          <p className={styles.trialNote}>
            <span aria-hidden="true">✦</span>
            Every new store starts with a one-month trial.
          </p>
        </div>
      </section>

      <section className={styles.plansSection} id="plans">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>CHOOSE YOUR SUBSCRIPTION</p>
          <h2>
            Two plans.
            <br />
            <em>Your next step.</em>
          </h2>
          <p>
            Both plans are for store owners and use the existing BeautyMart
            subscription system.
          </p>
        </div>

        <div className={styles.planGrid}>
          <article className={styles.planCard}>
            <span className={styles.planEyebrow}>FLEXIBLE START</span>
            <h3>Starter</h3>
            <p className={styles.planDescription}>
              A six-month subscription for your beauty business.
            </p>

            <div className={styles.price}>
              <strong>3,000</strong>
              <span>ETB</span>
            </div>
            <p className={styles.duration}>6 months</p>

            <div className={styles.divider} />

            <p className={styles.includedTitle}>Store management includes</p>
            <ul>
              {features.map((feature) => (
                <li key={feature}>
                  <span aria-hidden="true">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/register" className={styles.planButton}>
              Get started <span aria-hidden="true">→</span>
            </Link>
          </article>

          <article className={`${styles.planCard} ${styles.standardCard}`}>
            <span className={styles.recommended}>LONGER SUBSCRIPTION</span>
            <span className={styles.planEyebrow}>12-MONTH PLAN</span>
            <h3>Standard</h3>
            <p className={styles.planDescription}>
              A twelve-month subscription for your growing business.
            </p>

            <div className={styles.price}>
              <strong>5,000</strong>
              <span>ETB</span>
            </div>
            <p className={styles.duration}>12 months</p>

            <div className={styles.divider} />

            <p className={styles.includedTitle}>Store management includes</p>
            <ul>
              {features.map((feature) => (
                <li key={feature}>
                  <span aria-hidden="true">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/register" className={styles.planButtonPrimary}>
              Get started <span aria-hidden="true">→</span>
            </Link>
          </article>
        </div>

        <p className={styles.planNote}>
          These are store subscription prices, not product prices or customer
          fees. Plan activation is subject to successful payment verification.
          A paid plan starts at activation; unused trial time is not carried
          forward.
        </p>
      </section>

      <section className={styles.trialSection}>
        <div className={styles.trialIcon} aria-hidden="true">✦</div>
        <div>
          <p className={styles.eyebrow}>NEW TO BEAUTYMART?</p>
          <h2>Your first month starts with a trial.</h2>
          <p>
            Create a Business Owner account and set up your store. You can
            review the available paid plans through your subscription page.
          </p>
        </div>
        <Link href="/register" className={styles.trialButton}>
          Create an account <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>BUILT FOR YOUR WORKFLOW</p>
          <h2>
            More than a listing.
            <br />
            <em>A place to manage your store.</em>
          </h2>
        </div>

        <div className={styles.featureGrid}>
          <article>
            <span>01</span>
            <h3>Showcase products</h3>
            <p>
              Add product details, images, prices, and categories for customers
              to discover.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Manage operations</h3>
            <p>
              Work with your store products, inventory, and customer orders
              through the dashboard.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Control your subscription</h3>
            <p>
              Review your current plan and use the supported subscription
              payment flow to maintain store management access.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqIntro}>
          <p className={styles.eyebrow}>PRICING QUESTIONS</p>
          <h2>
            Know before
            <br />
            <em>you begin.</em>
          </h2>
          <p>
            Understand the trial, payment, and store subscription rules before
            choosing your plan.
          </p>
          <Link href="/contact">Need more help? Contact us →</Link>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <details key={faq.question} className={styles.faqItem}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <p className={styles.eyebrow}>YOUR BUSINESS, YOUR NEXT STEP</p>
        <h2>
          Ready to build your
          <br />
          beauty business <em>online?</em>
        </h2>
        <p>
          Register as a Business Owner to begin your BeautyMart journey.
        </p>
        <div className={styles.finalActions}>
          <Link href="/register" className={styles.finalButton}>
            Start selling on BeautyMart →
          </Link>
          <Link href="/sell" className={styles.backLink}>
            Learn about selling first
          </Link>
        </div>
      </section>
    </main>
  );
}
