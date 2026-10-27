
import Link from "next/link";
import styles from "./store-setup.module.css";

const steps = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Register on BeautyMart and choose the Store Owner account type to start selling.",
  },
  {
    number: "02",
    title: "Set up your store",
    description:
      "Add your store name, contact information, description, and address so customers can learn about your business.",
  },
  {
    number: "03",
    title: "Add your products",
    description:
      "Create product categories, add prices and descriptions, and upload product photos.",
  },
  {
    number: "04",
    title: "Manage your business",
    description:
      "Use your dashboard to manage products, track orders, and monitor your store's performance.",
  },
];

const requirements = [
  "An email address and phone number",
  "A store name and business details",
  "Product names, prices, descriptions, and photos",
  "A way to receive and manage customer orders",
];

export default function StoreSetupPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>YOUR BUSINESS STARTS HERE</span>

          <h1>
            Set up your store.
            <br />
            <span>Start growing.</span>
          </h1>

          <p className={styles.heroText}>
            Bring your beauty business online with BeautyMart. Set up your
            storefront, showcase your products, and manage your business from
            one place.
          </p>

          <div className={styles.heroActions}>
            <Link href="/register" className={styles.primaryButton}>
              Create a seller account
            </Link>
            <Link href="/pricing" className={styles.secondaryButton}>
              Explore plans
            </Link>
          </div>

          <p className={styles.heroNote}>
            Start with a one-month trial. No subscription payment is required
            from customers.
          </p>
        </div>

        <div className={styles.heroCard}>
          <span className={styles.cardLabel}>YOUR SELLER JOURNEY</span>
          <div className={styles.journey}>
            <div className={styles.journeyItem}>
              <span className={styles.journeyNumber}>1</span>
              <div>
                <strong>Create your store</strong>
                <p>Introduce your business</p>
              </div>
            </div>
            <div className={styles.journeyLine} />
            <div className={styles.journeyItem}>
              <span className={styles.journeyNumber}>2</span>
              <div>
                <strong>Showcase products</strong>
                <p>Add photos and prices</p>
              </div>
            </div>
            <div className={styles.journeyLine} />
            <div className={styles.journeyItem}>
              <span className={styles.journeyNumber}>3</span>
              <div>
                <strong>Manage orders</strong>
                <p>Run your store online</p>
              </div>
            </div>
          </div>
          <Link href="/sell" className={styles.textLink}>
            Learn about selling on BeautyMart →
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>FOUR SIMPLE STEPS</span>
          <h2>How store setup works</h2>
          <p>
            Follow these steps to prepare your business for the BeautyMart
            marketplace.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          {steps.map((step) => (
            <article className={styles.stepCard} key={step.number}>
              <span className={styles.stepNumber}>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.detailsSection}>
        <div className={styles.detailsGrid}>
          <div>
            <span className={styles.eyebrow}>BEFORE YOU BEGIN</span>
            <h2>Get your store ready</h2>
            <p className={styles.detailsIntro}>
              Prepare a few details before creating your store. This makes it
              easier to build a complete and trustworthy storefront.
            </p>
          </div>

          <div className={styles.checklist}>
            {requirements.map((requirement) => (
              <div className={styles.checkItem} key={requirement}>
                <span className={styles.checkIcon}>✓</span>
                <span>{requirement}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.planSection}>
        <span className={styles.eyebrow}>SIMPLE SUBSCRIPTIONS</span>
        <h2>Start with a one-month trial</h2>
        <p>
          Every new store receives a one-month trial. After that, choose a
          subscription to continue managing your store.
        </p>

        <div className={styles.planCards}>
          <article className={styles.planCard}>
            <h3>Starter</h3>
            <p className={styles.planPrice}>
              3,000 <span>ETB</span>
            </p>
            <p>For 6 months</p>
            <Link href="/pricing" className={styles.planLink}>
              View plan details →
            </Link>
          </article>

          <article className={`${styles.planCard} ${styles.featuredPlan}`}>
            <span className={styles.planBadge}>LONGER COVERAGE</span>
            <h3>Standard</h3>
            <p className={styles.planPrice}>
              5,000 <span>ETB</span>
            </p>
            <p>For 12 months</p>
            <Link href="/pricing" className={styles.planLink}>
              View plan details →
            </Link>
          </article>
        </div>

        <p className={styles.importantNote}>
          When a paid subscription is successfully verified, its period starts
          immediately. Any unused trial time is not added to the paid period.
          If a subscription expires without renewal, store management is
          restricted.
        </p>
      </section>

      <section className={styles.finalCta}>
        <span className={styles.eyebrow}>READY TO GET STARTED?</span>
        <h2>Your next step starts here.</h2>
        <p>
          Create a seller account and follow the store setup process to bring
          your beauty business online.
        </p>
        <div className={styles.heroActions}>
          <Link href="/register" className={styles.primaryButton}>
            Register as a seller
          </Link>
          <Link href="/login" className={styles.secondaryButton}>
            Already have an account?
          </Link>
        </div>
      </section>
    </main>
  );
}
