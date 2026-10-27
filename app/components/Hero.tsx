import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero">

      <div className="hero-container">

        {/* Left: Hero Content */}
        <div className="hero-content">

          <p className="hero-eyebrow">
            ETHIOPIA&apos;S BEAUTY MARKETPLACE
          </p>

          <h1>
            Discover beauty.
            <br />
            <span>Support local.</span>
          </h1>

          <p className="hero-description">
            Discover beauty products from independent brands, cosmetics
            stores, skincare businesses, and beauty professionals across
            Ethiopia.
          </p>

          <div className="hero-buttons">

            <Link href="/products" className="primary-button">
              Explore Products
            </Link>

            <Link href="/stores" className="secondary-button">
              Discover Stores
            </Link>

          </div>

          <div className="hero-trust">

            <div>
              <strong>Local businesses</strong>
              <span>Discover growing brands</span>
            </div>

            <div>
              <strong>Beauty marketplace</strong>
              <span>Products from many stores</span>
            </div>

          </div>

        </div>


        {/* Right: Hero Image */}
        <div className="hero-visual">

          <div className="hero-image-card">

            <Image
              src="/images/heroSection.png"
              alt="Beauty and skincare"
              fill
              priority
              className="hero-image"
              sizes="(max-width: 768px) 100vw, 55vw"
            />

            <div className="hero-image-overlay"></div>

            <div className="hero-floating-card">

              <span className="floating-label">
                BEAUTY FROM ETHIOPIA
              </span>

              <strong>
                Discover something beautiful.
              </strong>

              <span>
                Explore products and businesses in one place.
              </span>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}