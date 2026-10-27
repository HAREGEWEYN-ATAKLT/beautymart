
import Link from "next/link";
import styles from "../info-pages.module.css";

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>YOUR PRIVACY MATTERS</span>
        <h1>Your information. <span>Your trust.</span></h1>
        <p>
          This notice explains how BeautyMart may use information when you
          browse the marketplace, create an account, place an order, or operate
          a store.
        </p>
        <p className={styles.updated}>Last updated: October 20, 2026</p>
      </section>

      <article className={styles.policy}>
        <div className={styles.policyNotice}>
          <strong>Important before public launch</strong>
          <p>
            This is a starter privacy notice. The final policy must be checked
            against the site's actual data collection, analytics, hosting,
            retention, and payment-provider practices before publication.
          </p>
        </div>

        <section className={styles.policySection}>
          <h2>1. Information you provide</h2>
          <p>
            Depending on how you use BeautyMart, you may provide your name,
            email address, phone number, account credentials, store details,
            product listings, delivery information, and information associated
            with your orders.
          </p>
        </section>

        <section className={styles.policySection}>
          <h2>2. How information is used</h2>
          <p>Information may be used to:</p>
          <ul>
            <li>Create and manage customer and seller accounts.</li>
            <li>Display stores and products on the marketplace.</li>
            <li>Process orders and communicate order status.</li>
            <li>Support subscription management and payment verification.</li>
            <li>Protect the platform, investigate suspected misuse, and resolve support requests.</li>
          </ul>
        </section>

        <section className={styles.policySection}>
          <h2>3. Information shared to provide the service</h2>
          <p>
            Some information must be used by relevant parties to fulfil an
            order or operate the platform. For example, order details may be
            made available to the relevant store, and payment information may
            be processed by the payment provider selected during checkout.
            Information should only be shared as needed for the relevant
            purpose or as required by law.
          </p>
        </section>

        <section className={styles.policySection}>
          <h2>4. Payments and account security</h2>
          <p>
            Use only the official checkout flow. Never share your password,
            payment PIN, or one-time verification codes with someone claiming
            to be BeautyMart support. The platform should not request these
            secrets by email or phone.
          </p>
        </section>

        <section className={styles.policySection}>
          <h2>5. Data retention and protection</h2>
          <p>
            BeautyMart should retain personal information only for as long as
            needed for its stated purposes, legitimate business needs, dispute
            handling, and applicable legal obligations. Appropriate technical
            and organizational safeguards should be maintained, although no
            internet service can guarantee absolute security.
          </p>
        </section>

        <section className={styles.policySection}>
          <h2>6. Your choices and requests</h2>
          <p>
            You can contact BeautyMart to ask about your personal information
            or request a correction. Requests may need to be verified, and
            some records may need to be retained where required for legitimate
            or legal purposes.
          </p>
        </section>

        <section className={styles.policySection}>
          <h2>7. Changes to this notice</h2>
          <p>
            This notice may be updated as the platform and its practices
            change. Material changes should be reflected on this page with an
            updated revision date.
          </p>
        </section>

        <section className={styles.policySection}>
          <h2>8. Contact</h2>
          <p>
            For privacy questions, email{" "}
            <a href="mailto:haregyenatualij2028@gmail.com">
              haregyenatualij2028@gmail.com
            </a>{" "}
            or call <a href="tel:+251919259702">+251 919259702</a>.
          </p>
          <p>
            You can also visit the <Link href="/contact">Contact page</Link>.
          </p>
        </section>
      </article>
    </main>
  );
}
