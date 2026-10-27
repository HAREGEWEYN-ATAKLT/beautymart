import Image from "next/image";
import Link from "next/link";

export default function BusinessCTA() {
  return (
    <section className="business-cta">
      <div className="business-cta-container">

        <div className="business-cta-image">
          <Image
            src="/images/africanB.png"
            alt="Beauty business owner"
            fill
            sizes="(max-width: 800px) 100vw, 50vw"
          />
        </div>

        <div className="business-cta-content">
          <p className="section-eyebrow">
            FOR BEAUTY BUSINESSES
          </p>

          <h2>
            Your beauty
            <br />
            <span>business belongs online.</span>
          </h2>

          <p className="business-cta-description">
            Create your own BeautyMart store, showcase your products,
            reach more customers, and manage your business from one place.
          </p>

          <div className="business-cta-features">
            <div>
              <span>01</span>
              <p>Launch your online store</p>
            </div>

            <div>
              <span>02</span>
              <p>Manage products & orders</p>
            </div>

            <div>
              <span>03</span>
              <p>Grow your customer base</p>
            </div>
          </div>

          <Link href="/sell" className="business-cta-button">
            Start selling on BeautyMart
            <span>→</span>
          </Link>
        </div>

      </div>
    </section>
  );
}