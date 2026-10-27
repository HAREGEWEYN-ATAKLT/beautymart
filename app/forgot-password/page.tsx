import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="auth-page">
      <div className="auth-container">

        <div className="auth-brand">
          <Link href="/" className="auth-logo">
            Beauty<span>Mart</span>
          </Link>

          <p>ETHIOPIA&apos;S BEAUTY MARKETPLACE</p>
        </div>

        <div className="auth-layout">

          {/* Left Side */}
          <section className="auth-intro">
            <p className="section-eyebrow">ACCOUNT RECOVERY</p>

            <h1>
              Get back
              <br />
              <span>into your account.</span>
            </h1>

            <p>
              Enter the email address connected to your BeautyMart
              account and we&apos;ll help you reset your password.
            </p>

            <div className="auth-intro-points">

              <div>
                <span>01</span>
                <p>Enter your registered email address</p>
              </div>

              <div>
                <span>02</span>
                <p>Receive password recovery instructions</p>
              </div>

              <div>
                <span>03</span>
                <p>Create a new secure password</p>
              </div>

            </div>
          </section>

          {/* Recovery Card */}
          <section className="auth-card">

            <div className="auth-card-heading">
              <p className="section-eyebrow">RESET PASSWORD</p>

              <h2>Forgot password?</h2>

              <p>
                No problem. Enter your email and we&apos;ll help you
                recover your account.
              </p>
            </div>

            <form className="auth-form">

              <div className="auth-field">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-submit"
              >
                Send recovery link
                <span>→</span>
              </button>

            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <p className="auth-register">
              Remember your password?

              <Link href="/login">
                Back to sign in
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