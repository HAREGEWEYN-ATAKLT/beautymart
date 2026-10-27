
import Link from "next/link";
import styles from "./help.module.css";

const helpGroups = [
  {
    title: "Shopping on BeautyMart",
    description:
      "Discover beauty products and explore independent beauty businesses across Ethiopia.",
    links: [
      { label: "Browse products", href: "/products" },
      { label: "Explore categories", href: "/categories" },
      { label: "Discover stores", href: "/stores" },
    ],
  },
  {
    title: "Orders and payments",
    description:
      "Find your orders and review the payment options presented during checkout.",
    links: [
      { label: "My orders", href: "/orders" },
      { label: "Payment information", href: "/payments" },
      { label: "Delivery information", href: "/delivery" },
    ],
  },
  {
    title: "Selling on BeautyMart",
    description:
      "Learn how to open a store, list products, manage orders, and choose a subscription.",
    links: [
      { label: "How selling works", href: "/sell" },
      { label: "Set up your store", href: "/store-setup" },
      { label: "View subscription plans", href: "/pricing" },
      { label: "Seller sign in", href: "/login" },
    ],
  },
];

const faqs = [
  {
    question: "How do I find a product?",
    answer:
      "Visit the Products page or browse Categories to explore available beauty products. Open a product to review its details before ordering.",
  },
  {
    question: "Where can I check my order?",
    answer:
      "Sign in to your account and visit My Orders to review your available order information.",
  },
  {
    question: "Which payment methods can I use?",
    answer:
      "Available payment options are shown during checkout. Follow the instructions for the selected method and check your order status for payment confirmation.",
  },
  {
    question: "How does delivery work?",
    answer:
      "Delivery arrangements may depend on the order and store. Read the Delivery Information page and use the available order or store details for questions about a specific order.",
  },
  {
    question: "How can I start selling?",
    answer:
      "Visit Sell on BeautyMart to learn about selling, register as a store owner, and follow the store setup process.",
  },
  {
    question: "What happens when my store trial ends?",
    answer:
      "Store owners need an eligible subscription to continue managing their store after the trial expires. Visit Pricing to review the available plans.",
  },
];

export default function HelpPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>BEAUTYMART SUPPORT</span>
        <h1>How can we <span>help you?</span></h1>
        <p>
          Find guidance for shopping, orders, payments, delivery, and running
          your beauty business on BeautyMart.
        </p>
        <div className={styles.heroActions}>
          <Link href="/products" className={styles.primaryButton}>
            Explore products
          </Link>
          <Link href="/contact" className={styles.secondaryButton}>
            Contact information
          </Link>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>HELP BY TOPIC</span>
          <h2>Find the right information</h2>
        </div>

        <div className={styles.groups}>
          {helpGroups.map((group) => (
            <article className={styles.groupCard} key={group.title}>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label} <span>→</span></Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>QUICK ANSWERS</span>
          <h2>Frequently asked questions</h2>
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

      <section className={styles.bottomCta}>
        <h2>Still looking for something?</h2>
        <p>
          Visit our contact page for the available ways to reach BeautyMart.
        </p>
        <Link href="/contact" className={styles.primaryButton}>
          Contact BeautyMart
        </Link>
      </section>
    </main>
  );
}
