// import Link from "next/link";

// export default function Footer() {
//   return (
//     <footer className="footer">
//       <div className="footer-container">

//         {/* Top Footer */}
//         <div className="footer-top">

//           {/* Brand */}
//           <div className="footer-brand">
//             <Link href="/" className="footer-logo">
//               Beauty<span>Mart</span>
//             </Link>

//             <p>
//               A beauty-focused marketplace connecting customers with
//               independent beauty businesses across Ethiopia.
//             </p>

//             <Link href="/stores" className="footer-brand-link">
//               Discover local beauty businesses →
//             </Link>
//           </div>

//           {/* Shop */}
//           <div className="footer-column">
//             <h3>Shop</h3>

//             <Link href="/products">All Products</Link>
//             <Link href="/stores">Stores</Link>
//             <Link href="/categories">Categories</Link>
//             <Link href="/products">Trending Products</Link>
//           </div>

//           {/* For Businesses */}
//           <div className="footer-column">
//             <h3>For Businesses</h3>

//             <Link href="/sell">Sell on BeautyMart</Link>
//             <Link href="/pricing">Pricing</Link>
//             <Link href="/store-setup">Store Setup</Link>
//             <Link href="/login">Business Login</Link>
//           </div>

//           {/* Support */}
//           <div className="footer-column">
//             <h3>Support</h3>

//             <Link href="/help">Help Center</Link>
//             <Link href="/contact">Contact Us</Link>
//             <Link href="/delivery">Delivery Information</Link>
//             <Link href="/payments">Payments</Link>
//           </div>

//         </div>

//         {/* Middle Footer */}
//         <div className="footer-middle">

//           <div>
//             <p className="footer-small-label">
//               BUILT FOR BEAUTY BUSINESSES
//             </p>

//             <p className="footer-middle-text">
//               From independent beauty shops to growing brands,
//               BeautyMart gives businesses a place to build, sell,
//               and grow online.
//             </p>
//           </div>

//           <Link href="/sell" className="footer-cta">
//             Start your store
//             <span>→</span>
//           </Link>

//         </div>

//         {/* Bottom Footer */}
//         <div className="footer-bottom">

//           <p>
//             © {new Date().getFullYear()} BeautyMart. All rights reserved.
//           </p>

//           <div className="footer-bottom-links">
//             <Link href="/privacy">Privacy</Link>
//             <Link href="/terms">Terms</Link>
//             <Link href="/contact">Contact</Link>
//           </div>

//         </div>

//       </div>
//     </footer>
//   );
// }

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              Beauty<span>Mart</span>
            </Link>

            <p>
              Discover beauty. Support local. Shop beauty products and
              discover independent beauty businesses across Ethiopia.
            </p>

            <Link href="/stores" className="footer-brand-link">
              Discover local beauty businesses <span>→</span>
            </Link>

            <div className="footer-contact">
              <a href="mailto:haregyenatualij2028@gmail.com">
                haregyenatualij2028@gmail.com
              </a>
              <a href="tel:+251919259702">+251 919 259 702</a>
            </div>
          </div>

          <nav className="footer-column" aria-label="Shop">
            <h3>Shop</h3>
            <Link href="/products">All Products</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/stores">Discover Stores</Link>
            <Link href="/search">Search Products</Link>
            <Link href="/orders">My Orders</Link>
          </nav>

          <nav className="footer-column" aria-label="For Businesses">
            <h3>For Businesses</h3>
            <Link href="/sell">Sell on BeautyMart</Link>
            <Link href="/pricing">Plans & Pricing</Link>
            <Link href="/store-setup">Store Setup</Link>
            <Link href="/login">Business Login</Link>
          </nav>

          <nav className="footer-column" aria-label="Customer Care">
            <h3>Customer Care</h3>
            <Link href="/help">Help Center</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/delivery">Delivery Information</Link>
            <Link href="/payments">Payment Information</Link>
          </nav>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} BeautyMart. All rights reserved.
          </p>

          <div className="footer-bottom-links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

