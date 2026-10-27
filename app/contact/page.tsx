
import Link from "next/link";
import styles from "../info-pages.module.css";

const supportEmail = "haregyenatualij2028@gmail.com";
const supportPhone = "+251 919259702";

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>WE'RE HERE TO HELP</span>
        <h1>Get in <span>touch.</span></h1>
        <p>
          Have a question about shopping, an order, or selling on BeautyMart?
          Reach out using the contact details below.
        </p>
      </section>

      <section className={styles.content}>
        <div className={styles.contactGrid}>
          <article className={styles.card}>
            <span className={styles.cardIcon}>✉</span>
            <h2>Email BeautyMart</h2>
            <p>Send your question or describe the issue you need help with.</p>
            <a className={styles.contactLink} href={`mailto:${supportEmail}`}>
              {supportEmail}
            </a>
            <a
              className={styles.button}
              href={`mailto:${supportEmail}?subject=BeautyMart%20Support`}
            >
              Send an email
            </a>
          </article>

          <article className={styles.card}>
            <span className={styles.cardIcon}>☎</span>
            <h2>Call BeautyMart</h2>
            <p>Use the contact number below for support enquiries.</p>
            <a className={styles.contactLink} href={`tel:${supportPhone.replace(/\s/g, "")}`}>
              {supportPhone}
            </a>
            <a
              className={styles.button}
              href={`tel:${supportPhone.replace(/\s/g, "")}`}
            >
              Call us
            </a>
          </article>
        </div>

        <div className={styles.notice}>
          <strong>Help us assist you faster</strong>
          <p>
            If your question concerns an order, include your order reference
            when emailing us. Never send your password, payment PIN, or
            verification codes.
          </p>
        </div>

        <div className={styles.linkPanel}>
          <h2>Looking for a specific answer?</h2>
          <div className={styles.linkList}>
            <Link href="/help">Help Center <span>→</span></Link>
            <Link href="/orders">My Orders <span>→</span></Link>
            <Link href="/delivery">Delivery Information <span>→</span></Link>
            <Link href="/payments">Payment Information <span>→</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
