import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Explore beauty products and independent businesses from across Ethiopia.",
  },
  {
    number: "02",
    title: "Choose",
    description:
      "Find the products you love, compare stores, and add your favorites to your bag.",
  },
  {
    number: "03",
    title: "Order",
    description:
      "Place your order directly with the store and choose a supported payment option.",
  },
  {
    number: "04",
    title: "Enjoy",
    description:
      "Your store prepares the order and gets it to you, while you enjoy your beauty finds.",
  },
];

export default function HowItWorks() {
  return (
    <section className="how-section">
      <div className="how-container">

        <div className="how-heading">
          <div>
            <p className="section-eyebrow">HOW IT WORKS</p>

            <h2>
              Beauty shopping,
              <br />
              <span>made simple.</span>
            </h2>
          </div>

          <p className="how-intro">
            One marketplace connecting beauty lovers with the businesses
            behind the products they love.
          </p>
        </div>

        <div className="how-steps">
          {steps.map((step) => (
            <div className="how-step" key={step.number}>

              <span className="how-number">
                {step.number}
              </span>

              <div className="how-line"></div>

              <h3>{step.title}</h3>

              <p>{step.description}</p>

            </div>
          ))}
        </div>

        <div className="how-bottom">
          <p>
            Own a beauty business?
          </p>

          <Link href="/sell">
            Build your BeautyMart store →
          </Link>
        </div>

      </div>
    </section>
  );
}