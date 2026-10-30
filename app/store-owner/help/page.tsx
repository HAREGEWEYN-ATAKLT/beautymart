// "use client";

// import Link from "next/link";
// import "./help.css";

// const helpTopics = [
//   {
//     title: "Products",
//     description:
//       "Learn how to add, edit, activate, deactivate, and manage your products.",
//   },
//   {
//     title: "Orders",
//     description:
//       "Understand how to confirm orders, prepare them, and update their delivery status.",
//   },
//   {
//     title: "Inventory",
//     description:
//       "Learn how to monitor stock quantities and identify products that need restocking.",
//   },
//   {
//     title: "Discounts",
//     description:
//       "Create promotions and apply discounts to products in your store.",
//   },
//   {
//     title: "Analytics",
//     description:
//       "Understand your sales, orders, customers, and top-performing products.",
//   },
//   {
//     title: "Store Settings",
//     description:
//       "Update your store name, description, contact information, and address.",
//   },
// ];

// export default function HelpCenterPage() {
//   return (
//     <main className="help-page">
//       <div className="help-container">
//         <Link href="/store-owner" className="help-back">
//           ← Back to Dashboard
//         </Link>

//         <section className="help-hero">
//           <span className="help-label">STORE SUPPORT</span>

//           <h1>Help Center</h1>

//           <p>
//             Find helpful information for managing your BeautyMart store.
//           </p>
//         </section>

//         <section className="help-section">
//           <h2>How can we help?</h2>

//           <div className="help-grid">
//             {helpTopics.map((topic) => (
//               <article className="help-card" key={topic.title}>
//                 <div className="help-card-icon">?</div>

//                 <h3>{topic.title}</h3>

//                 <p>{topic.description}</p>
//               </article>
//             ))}
//           </div>
//         </section>

//         <section className="help-contact">
//           <div>
//             <span className="help-label">NEED MORE HELP?</span>

//             <h2>We're here to help.</h2>

//             <p>
//               If you cannot find the information you need, contact the
//               BeautyMart support team.
//             </p>
//           </div>

//           <a
//             href="mailto:support@beautymart.com"
//             className="help-contact-button"
//           >
//             Contact Support
//           </a>
//         </section>
//       </div>
//     </main>
//   );
// }



"use client";

import Link from "next/link";
import { useState } from "react";
import "./help.css";

const helpTopics = [
  {
    title: "Products",
    description:
      "Learn how to add, edit, activate, deactivate, and manage your products.",
    details: [
      "Go to Products from the Store Management menu.",
      "Use Add Product to create a new product.",
      "Enter the product name, category, price, stock quantity, and description.",
      "You can edit product information whenever your store needs an update.",
      "Use the product status to activate or deactivate products.",
    ],
  },
  {
    title: "Orders",
    description:
      "Understand how to confirm orders, prepare them, and update their delivery status.",
    details: [
      "Open Orders from your Store Management menu.",
      "Select an order to view the customer, products, amount, and payment information.",
      "Confirm the order after reviewing the order details.",
      "Mark the order as preparing when you start preparing the products.",
      "Update the order to delivered when the customer receives it.",
    ],
  },
  {
    title: "Inventory",
    description:
      "Learn how to monitor stock quantities and identify products that need restocking.",
    details: [
      "Open Inventory to see the current stock of your products.",
      "Total Units shows the total quantity currently available.",
      "Low Stock identifies products that are approaching their minimum stock level.",
      "Out of Stock identifies products with no remaining stock.",
      "Keep inventory quantities updated so customers see accurate product availability.",
    ],
  },
  {
    title: "Discounts",
    description:
      "Create promotions and apply discounts to products in your store.",
    details: [
      "Open Discounts from the Store Management menu.",
      "Create a new discount by entering its name and discount value.",
      "Choose between percentage and fixed-amount discounts.",
      "Set the start and end dates for the promotion.",
      "Select the products that should be included in the promotion.",
    ],
  },
  {
    title: "Analytics",
    description:
      "Understand your sales, orders, customers, and top-performing products.",
    details: [
      "Open Analytics from the Store Management menu.",
      "Review total sales and the number of orders.",
      "Check the number of customers who have placed orders.",
      "Use the Sales Overview chart to understand sales activity.",
      "Review Top Products to see which products are selling the most.",
    ],
  },
  {
    title: "Store Settings",
    description:
      "Update your store name, description, contact information, and address.",
    details: [
      "Open Settings from the Store Management menu.",
      "Update your store name and description.",
      "Update the email address and phone number customers can use to contact your business.",
      "Update your store address when your business location changes.",
      "Click Save Changes to store the updated information.",
    ],
  },
];

export default function HelpCenterPage() {
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  const toggleTopic = (title: string) => {
    setOpenTopic((current) =>
      current === title ? null : title
    );
  };

  return (
    <main className="help-page">
      <div className="help-container">
        <Link href="/store-owner" className="help-back">
          ← Back to Dashboard
        </Link>

        <section className="help-hero">
          <span className="help-label">STORE SUPPORT</span>

          <h1>Help Center</h1>

          <p>
            Find helpful information for managing your BeautyMart store.
          </p>
        </section>

        <section className="help-section">
          <h2>How can we help?</h2>

          <div className="help-grid">
            {helpTopics.map((topic) => {
              const isOpen = openTopic === topic.title;

              return (
                <article
                  className={`help-card ${
                    isOpen ? "help-card-open" : ""
                  }`}
                  key={topic.title}
                >
                  <button
                    type="button"
                    className="help-card-button"
                    onClick={() => toggleTopic(topic.title)}
                    aria-expanded={isOpen}
                  >
                    <div className="help-card-icon">?</div>

                    <div className="help-card-content">
                      <h3>{topic.title}</h3>

                      <p>{topic.description}</p>
                    </div>

                    <span className="help-card-arrow">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="help-details">
                      <h4>Quick Guide</h4>

                      <ul>
                        {topic.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="help-contact">
          <div>
            <span className="help-label">NEED MORE HELP?</span>

            <h2>We&apos;re here to help.</h2>

            <p>
              If you cannot find the information you need, contact the
              BeautyMart support team.
            </p>
          </div>

          <a
  href="mailto:hareg10academy21@gmail.com?subject=BeautyMart%20Store%20Support"
  className="help-contact-button"
>
  Contact Support
</a>
        </section>
      </div>
    </main>
  );
}
