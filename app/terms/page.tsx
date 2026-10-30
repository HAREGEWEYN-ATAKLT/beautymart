
import Link from "next/link";
import styles from "../info-pages.module.css";

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>MARKETPLACE GUIDELINES</span>
        <h1>Clear rules. <span>Better experiences.</span></h1>
        <p>
          These starter terms describe the basic expectations for customers
          and sellers using BeautyMart.
        </p>
        <p className={styles.updated}>Last updated: October 20, 2026</p>
      </section>

      <article className={styles.policy}>
        <div className={styles.policyNotice}>
          <strong>Review before launch</strong>
          <p>
            These are draft marketplace terms, not a substitute for legal
            review. Confirm them against the actual checkout, cancellation,
            refund, delivery, subscription, and seller processes before
            treating them as final.
          </p>
        </div>

        <section className={styles.policySection}>
          <h2>1. Using BeautyMart</h2>
          <p>
            Users must provide accurate information, protect their account
            credentials, and use the platform lawfully. Do not attempt to
            access another person&apos;s account, disrupt the service, or misuse
            the marketplace.
          </p>
        </section>

        <section className={styles.policySection}>
          <h2>2. Customer accounts and orders</h2>
          <p>
            Customers are responsible for reviewing product descriptions,
            prices, quantities, and order details before submitting an order.
            Order confirmation, payment status, and fulfilment status may be
            updated as the order is processed.
          </p>
        </section>

        <section className={styles.policySection}>
          <h2>3. Seller responsibilities</h2>
          <p>Sellers are responsible for:</p>
          <ul>
            <li>Providing accurate store details and product information.</li>
            <li>Using product images and descriptions they have the right to use.</li>
            <li>Keeping prices, availability, and listings accurate.</li>
            <li>Handling orders responsibly and updating order statuses truthfully.</li>
            <li>Complying with applicable laws and platform rules.</li>
          </ul>
        </section>

        <section className={styles.policySection}>
          <h2>4. Store subscriptions</h2>
          <p>
            Each eligible new store receives a one-month trial under the
            platform&apos;s subscription rules. The Starter plan is 3,000 ETB for
            six months, and the Standard plan is 5,000 ETB for twelve months.
            A paid period starts when its payment is successfully verified;
            unused trial time is not added to the paid period.
          </p>
          <p>
            Store management may be restricted when a subscription expires or
            is suspended. Subscription restrictions apply to the affected
            store, according to the platform&apos;s rules.
          </p>
          <p>
            Customers do not pay the store-owner subscription fee simply to
            shop on BeautyMart.
          </p>
          <p>
            For current plan information, visit <Link href="/pricing">Pricing</Link>.
          </p>
        </section>

        <section className={styles.policySection}>
          <h2>5. Payments, delivery, and cancellations</h2>
          <p>
            Customers should use the payment options displayed during checkout
            and follow the provider&apos;s instructions. Payment and order statuses
            should be checked before assuming an order is paid or complete.
          </p>
          <p>
            Delivery arrangements may vary by store and order. Any applicable
            cancellation, refund, return, and delivery rules must be confirmed
            through the information shown for the order and the applicable
            platform policies. This draft does not promise a refund or a
            particular delivery timeframe.
          </p>
          <p>
            Read the <Link href="/payments">Payment Information</Link> and{" "}
            <Link href="/delivery">Delivery Information</Link> pages for
            guidance.
          </p>
        </section>

        <section className={styles.policySection}>
          <h2>6. Listings and prohibited activity</h2>
          <p>
            BeautyMart may review, restrict, or remove content or listings that
            appear misleading, unlawful, unsafe, infringing, or inconsistent
            with platform rules. Users must not use the service for fraud,
            impersonation, or other unlawful activity.
          </p>
        </section>

        <section className={styles.policySection}>
          <h2>7. Availability and changes</h2>
          <p>
            Features may change, and the service may occasionally be
            unavailable for maintenance or technical reasons. BeautyMart
            should communicate material changes to these terms and update this
            page when needed.
          </p>
        </section>

        <section className={styles.policySection}>
          <h2>8. Contact</h2>
          <p>
            Questions about these terms can be sent to{" "}
            <a href="mailto:haregyenatualij2028@gmail.com">
              haregyenatualij2028@gmail.com
            </a>{" "}
            or raised through the <Link href="/contact">Contact page</Link>.
          </p>
        </section>
      </article>
    </main>
  );
}
