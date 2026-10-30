
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AccountType = "CUSTOMER" | "STORE_OWNER";

export default function RegisterPage() {
const router = useRouter();

const [accountType, setAccountType] = useState<AccountType | null>(null);

const [formData, setFormData] = useState({
fullName: "",
email: "",
phone: "",
password: "",
confirmPassword: "",
});

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
e.preventDefault();


if (!accountType) {
  setError("Please choose an account type first.");
  return;
}

if (formData.password !== formData.confirmPassword) {
  setError("Passwords do not match.");
  return;
}

setLoading(true);
setError("");
setSuccess("");

try {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...formData,
      accountType,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    setError(data.message || "Registration failed.");
    return;
  }

  setSuccess("Account created successfully! Redirecting to sign in...");

  setTimeout(() => {
    router.push("/login");
  }, 1200);
} catch (err) {
  console.error("Registration request failed:", err);
  setError("Something went wrong. Please try again.");
} finally {
  setLoading(false);
}


}

const choiceStyle = (selected: boolean): React.CSSProperties => ({
display: "block",
width: "100%",
padding: "24px 20px",
textAlign: "left",
border: selected ? "2px solid #8b4b5a" : "1px solid #e5dedb",
borderRadius: "16px",
background: selected ? "#fbf1f3" : "#ffffff",
cursor: "pointer",
transition: "all 180ms ease",
boxShadow: selected ? "0 4px 16px rgba(139,75,90,0.12)" : "none",
color: "#2d282b",
});

return ( <main className="auth-page"> <div className="auth-container"> <div className="auth-brand"> <Link href="/" className="auth-logo">
Beauty<span>Mart</span> </Link> <p>ETHIOPIA&apos;S BEAUTY MARKETPLACE</p> </div>


    <div className="auth-layout">
      <section className="auth-intro">
        <p className="section-eyebrow">JOIN BEAUTYMART</p>

        <h1>
          Your beauty
          <br />
          <span>journey starts.</span>
        </h1>

        <p>
          {accountType === "STORE_OWNER"
            ? "Bring your beauty business online and connect with customers across Ethiopia."
            : accountType === "CUSTOMER"
              ? "Discover beauty products and keep your orders organized in one place."
              : "Create your BeautyMart account to discover beauty products or grow your own beauty business."}
        </p>

        <div className="auth-intro-points">
          <div>
            <span>01</span>
            <p>Discover beauty products and businesses</p>
          </div>
          <div>
            <span>02</span>
            <p>Enjoy a personalized BeautyMart experience</p>
          </div>
          <div>
            <span>03</span>
            <p>Shop or build your own beauty business</p>
          </div>
        </div>
      </section>

      <section className="auth-card">
        {!accountType ? (
          /* STEP 1: Choose account type */
          <>
            <div className="auth-card-heading">
              <p className="section-eyebrow">CREATE ACCOUNT · STEP 1 OF 2</p>
              <h2>Get started</h2>
              <p>How would you like to use BeautyMart?</p>
            </div>

            {error && (
              <p className="auth-message auth-error" role="alert">
                {error}
              </p>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
                marginTop: "26px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAccountType("CUSTOMER");
                  setError("");
                }}
                style={choiceStyle(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#8b4b5a";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5dedb";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <span
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: "52px",
                        height: "52px",
                        borderRadius: "13px",
                        background: "#f8f0f1",
                        fontSize: "26px",
                      }}
                    >
                      🛍️
                    </span>
                    <span>
                      <span
                        style={{
                          display: "block",
                          fontWeight: 700,
                          fontSize: "17px",
                          marginBottom: "5px",
                        }}
                      >
                        Customer
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "13px",
                          lineHeight: 1.6,
                          color: "#71666a",
                        }}
                      >
                        Discover products and manage your orders.
                      </span>
                    </span>
                  </span>
                  <span style={{ fontSize: "23px", color: "#8b4b5a" }}>
                    →
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccountType("STORE_OWNER");
                  setError("");
                }}
                style={choiceStyle(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#8b4b5a";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5dedb";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <span
                      style={{
                        display: "grid",
                        placeItems: "center",
                        width: "52px",
                        height: "52px",
                        borderRadius: "13px",
                        background: "#f8f0f1",
                        fontSize: "26px",
                      }}
                    >
                      🏪
                    </span>
                    <span>
                      <span
                        style={{
                          display: "block",
                          fontWeight: 700,
                          fontSize: "17px",
                          marginBottom: "5px",
                        }}
                      >
                        Business Owner
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "13px",
                          lineHeight: 1.6,
                          color: "#71666a",
                        }}
                      >
                        Create a store and grow your beauty business.
                      </span>
                    </span>
                  </span>
                  <span style={{ fontSize: "23px", color: "#8b4b5a" }}>
                    →
                  </span>
                </span>
              </button>
            </div>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <p className="auth-register">
              Already have a BeautyMart account?{" "}
              <Link href="/login">Sign in</Link>
            </p>
          </>
        ) : (
          /* STEP 2: Enter registration details */
          <>
            <div className="auth-card-heading">
              <p className="section-eyebrow">CREATE ACCOUNT · STEP 2 OF 2</p>
              <h2>
                {accountType === "CUSTOMER"
                  ? "Create your account"
                  : "Register your business"}
              </h2>
              <p>
                Account type:{" "}
                <strong>
                  {accountType === "CUSTOMER"
                    ? "Customer"
                    : "Business Owner"}
                </strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setAccountType(null);
                setError("");
                setSuccess("");
              }}
              style={{
                marginTop: "16px",
                marginBottom: "12px",
                padding: "8px 0",
                border: "none",
                background: "transparent",
                color: "#8b4b5a",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← Change account type
            </button>

            {error && (
              <p className="auth-message auth-error" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="auth-message auth-success" role="status">
                {success}
              </p>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+251 9XX XXX XXX"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="Enter your password again"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
                <span>{loading ? "" : "→"}</span>
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <p className="auth-register">
              Already have a BeautyMart account?{" "}
              <Link href="/login">Sign in</Link>
            </p>
          </>
        )}
      </section>
    </div>

    <Link href="/" className="auth-back">
      ← Back to BeautyMart
    </Link>
  </div>
</main>


);
}
