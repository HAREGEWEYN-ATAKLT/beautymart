
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useSession, signOut } from "next-auth/react";

// export default function Navbar() {
// const [menuOpen, setMenuOpen] = useState(false);

// const { data: session, status } = useSession();


// const closeMenu = () => {
// setMenuOpen(false);
// };

// const handleLogout = async () => {
// await signOut({
// callbackUrl: "/",
// });
// };

// return ( <header className="navbar"> <div className="navbar-container">


//     {/* Logo */}
//     <Link href="/" className="logo" onClick={closeMenu}>
//       Beauty<span>Mart</span>
//     </Link>

//     {/* Desktop Navigation */}
//     <nav className="nav-links">
//       <Link href="/products">Shop</Link>
//       <Link href="/stores">Stores</Link>
//       <Link href="/categories">Categories</Link>
//       <Link href="/sell">Sell on BeautyMart</Link>
//     </nav>

//     {/* Desktop Actions */}
//     <div className="nav-actions">

//       <Link href="/search" className="nav-action">
//         Search
//       </Link>

//       <Link href="/cart" className="nav-action">
//         Cart
//       </Link>
// <Link href="/orders" className="nav-action">
//   My Orders
// </Link>
//       {status === "authenticated" ? (
//         <>
//           <Link href="/account" className="nav-user">
//   Hi, {session.user.name?.split(" ")[0]}
// </Link>

//           <button
//             type="button"
//             className="login-button"
//             onClick={handleLogout}
//           >
//             Logout
//           </button>
//         </>
//       ) : (
//         <Link href="/login" className="login-button">
//           Login
//         </Link>
//       )}

//     </div>

//     {/* Mobile Menu Button */}
//     <button
//       className="mobile-menu-button"
//       onClick={() => setMenuOpen(!menuOpen)}
//       aria-label={menuOpen ? "Close menu" : "Open menu"}
//       aria-expanded={menuOpen}
//     >
//       <span></span>
//       <span></span>
//       <span></span>
//     </button>

//   </div>

//   {/* Mobile Navigation */}
//   <div className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`}>

//     <nav className="mobile-nav-links">

//       <Link href="/products" onClick={closeMenu}>
//         Shop
//       </Link>

//       <Link href="/stores" onClick={closeMenu}>
//         Stores
//       </Link>

//       <Link href="/categories" onClick={closeMenu}>
//         Categories
//       </Link>

//       <Link href="/sell" onClick={closeMenu}>
//         Sell on BeautyMart
//       </Link>

//     </nav>

//     <div className="mobile-actions">

//       <Link href="/search" onClick={closeMenu}>
//         Search
//       </Link>

//       <Link href="/cart" onClick={closeMenu}>
//         Cart
//       </Link>
// <Link href="/orders" onClick={closeMenu}>
//   My Orders
// </Link>
//       {status === "authenticated" ? (
//         <>
//         <Link href="/account" className="nav-user">
//   Hi, {session.user.name?.split(" ")[0]}
// </Link>

//           <button
//             type="button"
//             className="mobile-login-button"
//             onClick={handleLogout}
//           >
//             Logout
//           </button>
//         </>
//       ) : (
//         <Link
//           href="/login"
//           className="mobile-login-button"
//           onClick={closeMenu}
//         >
//           Login
//         </Link>
//       )}

//     </div>

//   </div>
// </header>


// );
// }
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import CustomerNotifications from "./CustomerNotifications";

type DropdownName = "shop" | "business" | null;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownName>(null);

  const { data: session, status } = useSession();

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (name: Exclude<DropdownName, null>) => {
    setOpenDropdown((current) => (current === name ? null : name));
  };

  const handleLogout = async () => {
    closeMenu();
    await signOut({ callbackUrl: "/" });
  };

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link href="/" className="logo" onClick={closeMenu} aria-label="BeautyMart home">
          Beauty<span>Mart</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-dropdown-trigger"
              aria-expanded={openDropdown === "shop"}
              onClick={() => toggleDropdown("shop")}
            >
              Shop <span className="dropdown-chevron">⌄</span>
            </button>
            <div className={`nav-dropdown-menu ${openDropdown === "shop" ? "nav-dropdown-menu-open" : ""}`}>
              <p className="dropdown-heading">Discover beauty</p>
              <Link href="/products" onClick={closeMenu}>All products</Link>
              <Link href="/categories" onClick={closeMenu}>Shop by category</Link>
              <Link href="/products?category=Skincare" onClick={closeMenu}>Skincare</Link>
              <Link href="/products?category=Makeup" onClick={closeMenu}>Makeup</Link>
              <Link href="/products?category=Haircare" onClick={closeMenu}>Haircare</Link>
              <Link href="/products?category=Fragrance" onClick={closeMenu}>Fragrance</Link>
            </div>
          </div>

          <Link href="/stores" onClick={closeMenu}>Stores</Link>
          <Link href="/categories" onClick={closeMenu}>Categories</Link>

          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-dropdown-trigger"
              aria-expanded={openDropdown === "business"}
              onClick={() => toggleDropdown("business")}
            >
              For Businesses <span className="dropdown-chevron">⌄</span>
            </button>
            <div className={`nav-dropdown-menu nav-dropdown-menu-business ${openDropdown === "business" ? "nav-dropdown-menu-open" : ""}`}>
              <p className="dropdown-heading">Grow with BeautyMart</p>
              <Link href="/sell" onClick={closeMenu}>Why sell with us?</Link>
              <Link href="/pricing" onClick={closeMenu}>Subscription plans</Link>
              <Link href="/store-setup" onClick={closeMenu}>Store setup guide</Link>
              <Link href="/login" onClick={closeMenu}>Business login</Link>
            </div>
          </div>
        </nav>

        <div className="nav-actions">
          <Link href="/search" className="nav-action" onClick={closeMenu} aria-label="Search products">Search</Link>
          <Link href="/cart" className="nav-action" onClick={closeMenu}>Cart</Link>
          <Link href="/orders" className="nav-action" onClick={closeMenu}>My Orders</Link>

          {status === "authenticated" ? (
            <>
              <CustomerNotifications />
              <Link href="/account" className="nav-user" onClick={closeMenu}>
                Hi, {firstName || "there"}
              </Link>
              <button type="button" className="login-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="login-button" onClick={closeMenu}>
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          className={`mobile-menu-button ${menuOpen ? "mobile-menu-button-open" : ""}`}
          onClick={() => {
            setMenuOpen((current) => !current);
            setOpenDropdown(null);
          }}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <nav className="mobile-nav-links" aria-label="Mobile shopping navigation">
          <button
            type="button"
            className="mobile-dropdown-trigger"
            onClick={() => toggleDropdown("shop")}
            aria-expanded={openDropdown === "shop"}
          >
            Shop <span>{openDropdown === "shop" ? "−" : "+"}</span>
          </button>

          {openDropdown === "shop" && (
            <div className="mobile-dropdown-links">
              <Link href="/products" onClick={closeMenu}>All products</Link>
              <Link href="/categories" onClick={closeMenu}>All categories</Link>
              <Link href="/products?category=Skincare" onClick={closeMenu}>Skincare</Link>
              <Link href="/products?category=Makeup" onClick={closeMenu}>Makeup</Link>
              <Link href="/products?category=Haircare" onClick={closeMenu}>Haircare</Link>
              <Link href="/products?category=Fragrance" onClick={closeMenu}>Fragrance</Link>
            </div>
          )}

          <Link href="/stores" onClick={closeMenu}>Stores</Link>
          <Link href="/categories" onClick={closeMenu}>Categories</Link>

          <button
            type="button"
            className="mobile-dropdown-trigger"
            onClick={() => toggleDropdown("business")}
            aria-expanded={openDropdown === "business"}
          >
            For Businesses <span>{openDropdown === "business" ? "−" : "+"}</span>
          </button>

          {openDropdown === "business" && (
            <div className="mobile-dropdown-links">
              <Link href="/sell" onClick={closeMenu}>Why sell with us?</Link>
              <Link href="/pricing" onClick={closeMenu}>Subscription plans</Link>
              <Link href="/store-setup" onClick={closeMenu}>Store setup guide</Link>
              <Link href="/login" onClick={closeMenu}>Business login</Link>
            </div>
          )}
        </nav>

        <div className="mobile-actions">
          <Link href="/search" onClick={closeMenu}>Search products</Link>
          <Link href="/cart" onClick={closeMenu}>Cart</Link>
          <Link href="/orders" onClick={closeMenu}>My Orders</Link>

          {status === "authenticated" ? (
            <>
              <Link href="/notifications" onClick={closeMenu}>Notifications</Link>
              <Link href="/account" onClick={closeMenu}>My account{firstName ? ` (${firstName})` : ""}</Link>
              <button type="button" className="mobile-login-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="mobile-login-button" onClick={closeMenu}>
              Login / Sign up
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
