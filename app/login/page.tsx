// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react";
// import Link from "next/link";
// export default function LoginPage() {
//     const [email, setEmail] = useState("");
// const [password, setPassword] = useState("");
// const [loading, setLoading] = useState(false);
// const [error, setError] = useState("");
// const [success, setSuccess] = useState("");
// const router = useRouter();
//   return (
//     <main className="auth-page">
//       <div className="auth-container">

//         <div className="auth-brand">
//           <Link href="/" className="auth-logo">
//             Beauty<span>Mart</span>
//           </Link>

//           <p>ETHIOPIA&apos;S BEAUTY MARKETPLACE</p>
//         </div>

//         <div className="auth-layout">

//           <section className="auth-intro">
//             <p className="section-eyebrow">WELCOME BACK</p>

//             <h1>
//               Beauty shopping,
//               <br />
//               <span>starts here.</span>
//             </h1>

//             <p>
//               Sign in to continue shopping, manage your orders,
//               or access your BeautyMart business.
//             </p>

//             <div className="auth-intro-points">
//               <div>
//                 <span>01</span>
//                 <p>Shop from local beauty businesses</p>
//               </div>

//               <div>
//                 <span>02</span>
//                 <p>Track your orders in one place</p>
//               </div>

//               <div>
//                 <span>03</span>
//                 <p>Manage your business if you are a store owner</p>
//               </div>
//             </div>
//           </section>

//           <section className="auth-card">

//             <div className="auth-card-heading">
//               <p className="section-eyebrow">ACCOUNT LOGIN</p>

//               <h2>Sign in</h2>

//               <p>
//                 Enter your details to continue to BeautyMart.
//               </p>
//             </div>
// {error && (
//   <p className="auth-message auth-error">
//     {error}
//   </p>
// )}

// {success && (
//   <p className="auth-message auth-success">
//     {success}
//   </p>
// )}

// <form
//   className="auth-form"

//   onSubmit={async (e) => {
//     e.preventDefault();

//     setLoading(true);
//     setError("");
//     setSuccess("");

//     try {
//      const result = await signIn("credentials", {
//   email,
//   password,
//   redirect: false,
// });

// if (result?.error) {
//   setError("Invalid email or password.");
//   return;
// }

// setSuccess("Login successful.");

// setTimeout(() => {
//   router.push("/");
//   router.refresh();
// }, 800);
//     } catch (error) {
//       console.error("Login request failed:", error);
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }}
// >

//               <div className="auth-field">
//                 <label htmlFor="email">
//                   Email address
//                 </label>

//               <input
//   id="email"
//   type="email"
//   placeholder="you@example.com"
//   value={email}
//   onChange={(e) => setEmail(e.target.value)}
//   required
// />
//               </div>

//               <div className="auth-field">
//                 <div className="auth-label-row">
//                   <label htmlFor="password">
//                     Password
//                   </label>

//                   <Link href="/forgot-password">
//                     Forgot password?
//                   </Link>
//                 </div>

//                <input
//   id="password"
//   type="password"
//   placeholder="Your password"
//   value={password}
//   onChange={(e) => setPassword(e.target.value)}
//   required
// />
//               </div>

//               <button
//   type="submit"
//   className="auth-submit"
//   disabled={loading}
// >
//   {loading ? "Signing in..." : "Sign in"}
//   <span>{loading ? "" : "→"}</span>
// </button>

//             </form>

//             <div className="auth-divider">
//               <span>OR</span>
//             </div>

//             <p className="auth-register">
//               Don&apos;t have a BeautyMart account?
//               <Link href="/register">
//                 Create an account
//               </Link>
//             </p>

//           </section>

//         </div>

//         <Link href="/" className="auth-back">
//           ← Back to BeautyMart
//         </Link>

//       </div>
//     </main>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

const router = useRouter();

// const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
// e.preventDefault();

// setLoading(true);
// setError("");
// setSuccess("");

// try {
//   const result = await signIn("credentials", {
//     email: email.trim().toLowerCase(),
//     password,
//     redirect: false,
//   });

//   console.log("Sign in result:", result);
// console.log("USER ROLE:", result?.user?.role);
//   if (!result || result.error) {
//     setLoading(false);
//     setError("Invalid email or password.");
//     return;
//   }

//  setSuccess("Login successful!");
// setLoading(false);

// // Redirect based on the user's role
// setTimeout(() => {
//   if (result.user?.role === "SUPER_ADMIN") {
//     router.push("/admin");
//   } else if (result.user?.role === "STORE_OWNER") {
//     router.push("/store-owner");
//   } else {
//     router.push("/");
//   }

//   router.refresh();
// }, 1500);
// } catch (error) {
//   console.error("Login request failed:", error);

//   setLoading(false);
//   setError("Something went wrong. Please try again.");
// }

const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
e.preventDefault();

setLoading(true);
setError("");
setSuccess("");

try {
const result = await signIn("credentials", {
email: email.trim().toLowerCase(),
password,
redirect: false,
});


if (!result || result.error) {
  setError("Invalid email or password.");
  return;
}

// Read the authenticated user's role from the NextAuth session.
const session = await getSession();
const role = (
  session?.user as { role?: string } | undefined
)?.role;

console.log("Authenticated role:", role);

if (role === "SUPER_ADMIN") {
  router.replace("/admin");
} else if (role === "STORE_OWNER") {
  router.replace("/store-owner");
} else if (role === "CUSTOMER") {
  router.replace("/");
} else {
  setError(
    "We couldn't verify your account role. Please sign in again."
  );
  return;
}

setSuccess("Login successful!");
router.refresh();


} catch (error) {
console.error("Login request failed:", error);
setError("Something went wrong. Please try again.");
} finally {
setLoading(false);
}
};



return ( <main className="auth-page"> <div className="auth-container">


    <div className="auth-brand">
      <Link href="/" className="auth-logo">
        Beauty<span>Mart</span>
      </Link>

      <p>ETHIOPIA&apos;S BEAUTY MARKETPLACE</p>
    </div>

    <div className="auth-layout">

      <section className="auth-intro">
        <p className="section-eyebrow">WELCOME BACK</p>

        <h1>
          Beauty shopping,
          <br />
          <span>starts here.</span>
        </h1>

        <p>
          Sign in to continue shopping, manage your orders,
          or access your BeautyMart business.
        </p>

        <div className="auth-intro-points">
          <div>
            <span>01</span>
            <p>Shop from local beauty businesses</p>
          </div>

          <div>
            <span>02</span>
            <p>Track your orders in one place</p>
          </div>

          <div>
            <span>03</span>
            <p>Manage your business if you are a store owner</p>
          </div>
        </div>
      </section>

      <section className="auth-card">

        <div className="auth-card-heading">
          <p className="section-eyebrow">ACCOUNT LOGIN</p>

          <h2>Sign in</h2>

          <p>
            Enter your details to continue to BeautyMart.
          </p>
        </div>

        {error && (
          <div className="auth-message auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-message auth-success">
            {success}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleLogin}
        >

          <div className="auth-field">
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <div className="auth-label-row">
              <label htmlFor="password">
                Password
              </label>

              <Link href="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
            <span>{loading ? "" : "→"}</span>
          </button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-register">
          Don&apos;t have a BeautyMart account?
          <Link href="/register">
            Create an account
          </Link>
        </p>

      </section>

    </div>

    <Link href="/" className="auth-back">
      ← Back to BeautyMart
    </Link>

  </div>
</main>

);
}
