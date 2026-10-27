
import Link from "next/link";
import styles from "./sell.module.css";

const benefits = [
  {
    number: "01",
    title: "Showcase your products",
    description:
      "Create product listings with photos, prices, categories, and descriptions so customers can discover what you offer.",
    icon: "◇",
  },
  {
    number: "02",
    title: "Manage your business",
    description:
      "Use your store dashboard to manage products, inventory, customer orders, and store information.",
    icon: "▤",
  },
  {
    number: "03",
    title: "Reach more customers",
    description:
      "Give your beauty business an online storefront on a marketplace built for beauty shopping in Ethiopia.",
    icon: "↗",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Register on BeautyMart and choose Business Owner as your account type.",
  },
  {
    number: "02",
    title: "Set up your store",
    description:
      "Add your store name, contact details, address, and a description of your business.",
  },
  {
    number: "03",
    title: "Add your products",
    description:
      "Upload product images, set prices, select categories, and prepare your listings.",
  },
  {
    number: "04",
    title: "Manage your orders",
    description:
      "Use your store dashboard to manage your products and handle incoming customer orders.",
  },
];

const faqs = [
  {
    question: "Who can sell on BeautyMart?",
    answer:
      "Beauty businesses selling eligible beauty products can register as Business Owners and create a store, subject to BeautyMart's registration requirements.",
  },
  {
    question: "Does it cost money to start?",
    answer:
      "New stores receive a one-month trial. After the trial, a paid subscription is needed to continue managing the store if you do not purchase a plan sooner.",
  },
  {
    question: "What subscription plans are available?",
    answer:
      "Starter costs 3,000 ETB for six months. Standard costs 5,000 ETB for twelve months. The subscription belongs to the store owner, not the customer.",
  },
  {
    question: "Do I need an account before creating a store?",
    answer:
      "Yes. Register using the Business Owner account type, then sign in to continue to the store creation process.",
  },
  {
    question: "Can customers shop without becoming sellers?",
    answer:
      "Yes. Customers can create a regular customer account to browse products and place orders. They do not need a seller subscription.",
  },
];

export default function SellPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <Link href="/" className={styles.breadcrumb}>
              BeautyMart <span>/</span> Sell with us
            </Link>

            <p className={styles.eyebrow}>FOR ETHIOPIAN BEAUTY BUSINESSES</p>

            <h1>
              Your beauty business
              <br />
              belongs <em>online.</em>
            </h1>

            <p className={styles.heroDescription}>
              Bring your products to a marketplace made for beauty. Build your
              storefront, connect with customers, and manage your business from
              one place.
            </p>

            <div className={styles.heroActions}>
              <Link href="/register" className={styles.primaryButton}>
                Start your store <span aria-hidden="true">→</span>
              </Link>
              <a href="#how-it-works" className={styles.secondaryButton}>
                See how it works
              </a>
            </div>

            <p className={styles.trialNote}>
              <span aria-hidden="true">✦</span> Start with a one-month trial
            </p>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualTop}>
              <span className={styles.visualDot} />
              <span className={styles.visualLabel}>YOUR BEAUTY BUSINESS</span>
              <span className={styles.visualMenu}>•••</span>
            </div>

            <div className={styles.visualArtwork}>
              <div className={styles.artCircle} />
              <div className={styles.artBottle}>
                <div className={styles.bottleCap} />
                <div className={styles.bottleLabel}>
                  <span>YOUR</span>
                  <strong>BRAND</strong>
                </div>
              </div>
              <div className={styles.artJar}>
                <div className={styles.jarLid} />
                <div className={styles.jarLabel}>BEAUTY</div>
              </div>
              <div className={styles.artLeaf}>✳</div>
            </div>

            <div className={styles.visualFooter}>
              <div>
                <span className={styles.visualSmall}>MADE FOR</span>
                <strong>Independent beauty brands</strong>
              </div>
              <span className={styles.visualArrow}>↗</span>
            </div>

            <div className={styles.floatingNote}>
              <span className={styles.floatingIcon}>✓</span>
              <span>
                <strong>Your store, your way</strong>
                <small>Products · Orders · Inventory</small>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.heroBottom}>
          <span>BUILT FOR BEAUTY BUSINESSES</span>
          <span>MADE FOR ETHIOPIA</span>
          <span>ONE PLACE TO GROW</span>
        </div>
      </section>

      <section className={styles.benefitsSection}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>MORE THAN A STOREFRONT</p>
          <h2>
            Everything starts with
            <br />
            <em>your business.</em>
          </h2>
          <p>
            Focus on your products and customers while BeautyMart gives you a
            place to present and manage your business online.
          </p>
        </div>

        <div className={styles.benefitGrid}>
          {benefits.map((benefit) => (
            <article className={styles.benefitCard} key={benefit.number}>
              <div className={styles.benefitTop}>
                <span className={styles.benefitIcon}>{benefit.icon}</span>
                <span className={styles.benefitNumber}>{benefit.number}</span>
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.processSection} id="how-it-works">
        <div className={styles.processHeading}>
          <p className={styles.eyebrow}>YOUR NEXT CHAPTER</p>
          <h2>
            From first step to
            <br />
            <em>first listing.</em>
          </h2>
          <p>Getting your beauty business online starts here.</p>
        </div>

        <div className={styles.steps}>
          {steps.map((step) => (
            <article className={styles.step} key={step.number}>
              <span className={styles.stepNumber}>{step.number}</span>
              <div className={styles.stepLine} />
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <div className={styles.processAction}>
          <Link href="/register" className={styles.primaryButton}>
            Create your seller account <span aria-hidden="true">→</span>
          </Link>
          <p>Already registered? <Link href="/login">Sign in</Link></p>
        </div>
      </section>

      <section className={styles.pricingSection} id="plans">
        <div className={styles.pricingIntro}>
          <p className={styles.eyebrow}>SIMPLE SUBSCRIPTION PLANS</p>
          <h2>
            Start small.
            <br />
            <em>Grow with confidence.</em>
          </h2>
          <p>
            Every new store starts with a one-month trial. Choose a paid plan
            when you're ready.
          </p>
        </div>

        <div className={styles.planGrid}>
          <article className={styles.planCard}>
            <span className={styles.planLabel}>GET STARTED</span>
            <h3>Starter</h3>
            <p className={styles.planDescription}>
              A straightforward way to build your online presence.
            </p>
            <p className={styles.planPrice}>
              3,000 <span>ETB</span>
            </p>
            <p className={styles.planDuration}>for 6 months</p>
            <ul>
              <li>BeautyMart store</li>
              <li>Product and category management</li>
              <li>Store order management</li>
              <li>Store dashboard access</li>
            </ul>
            <Link href="/register" className={styles.planButton}>
              Start with Starter
            </Link>
          </article>

          <article className={`${styles.planCard} ${styles.featuredPlan}`}>
            <span className={styles.popularLabel}>LONGER-TERM PLAN</span>
            <span className={styles.planLabel}>MORE TIME TO GROW</span>
            <h3>Standard</h3>
            <p className={styles.planDescription}>
              A longer subscription for your growing beauty business.
            </p>
            <p className={styles.planPrice}>
              5,000 <span>ETB</span>
            </p>
            <p className={styles.planDuration}>for 12 months</p>
            <ul>
              <li>BeautyMart store</li>
              <li>Product and category management</li>
              <li>Store order management</li>
              <li>Store dashboard access</li>
            </ul>
            <Link href="/register" className={styles.planButtonPrimary}>
              Start with Standard
            </Link>
          </article>
        </div>

        <p className={styles.pricingFootnote}>
          Subscription prices and durations are shown for store owners. The
          one-month trial is separate from paid plans. Purchasing a paid plan
          starts its subscription period according to BeautyMart's subscription
          rules.
        </p>
        <p className={styles.pricingLink}>
          Need more details? <Link href="/pricing">View pricing information</Link>
        </p>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqIntro}>
          <p className={styles.eyebrow}>GOOD TO KNOW</p>
          <h2>
            Questions?
            <br />
            <em>We've got answers.</em>
          </h2>
          <p>Here are a few things to know before opening your store.</p>
          <Link href="/contact" className={styles.contactLink}>
            Still need help? Contact us →
          </Link>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <details className={styles.faqItem} key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <p className={styles.eyebrow}>YOUR BUSINESS. YOUR NEXT STEP.</p>
          <h2>
            Ready to bring your
            <br />
            beauty business <em>online?</em>
          </h2>
          <p>
            Create your Business Owner account and take the first step toward
            your BeautyMart store.
          </p>
        </div>
        <div className={styles.finalActions}>
          <Link href="/register" className={styles.finalButton}>
            Start selling on BeautyMart <span aria-hidden="true">→</span>
          </Link>
          <Link href="/login" className={styles.finalLogin}>
            Already have an account? Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
