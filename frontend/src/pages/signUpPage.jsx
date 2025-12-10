/**
 * SignUpPage
 * -----------------------------------------------------------------------------
 * Renders the account creation screen and wires it to the useSignUp() hook.
 * - Submits data from <SignUpForm /> and navigates to /login on success.
 * - Shows loading and error states (both hook-level and local).
 * - Applies a mobile viewport height workaround via the --vh CSS variable.
 *
 * Key flows
 * - handleCreateUser: calls signup(), manages UX state, and redirects.
 * - handleCancel: returns the user to the login page.
 */

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignUp } from "../hooks/useSignUp";
import SignUpForm from "../components/signUpForm";
import "../styles/signUp.css"; // ensure this is imported so the signup styles below apply

export default function SignUpPage() {
  const navigate = useNavigate();
  const { loading, error, signup, clearError } = useSignUp();
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  /**
   * Mobile viewport height workaround:
   * Keeps --vh synced to 1% of window.innerHeight to reduce 100vh issues
   * on mobile browsers (esp. when browser chrome shows/hides).
   */
  useEffect(() => {
    const setVh = () =>
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  /**
   * Handle account creation:
   * - clears previous errors
   * - sets submitting state
   * - calls signup(userData)
   * - navigates to /login on success
   * - surfaces any thrown error as a user-friendly message
   *
   * @param {Record<string, any>} userData
   * @returns {Promise<void>}
   */
  const handleCreateUser = async (userData) => {
    setLocalError("");
    clearError();
    setSubmitting(true);
    try {
      await signup(userData);
      navigate("/login");
    } catch (e) {
      setLocalError(e?.message || "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  };

  /** Cancel out of sign up and return to login. */
  const handleCancel = () => navigate("/login");
  const isBusy = loading || submitting;

  return (
    <div className="signup-root">
      <div className="bg-layer base" />
      <div className="bg-layer glow glow-1" />
      <div className="bg-layer glow glow-2" />
      <div className="bg-layer noise" />

      {/* Centered glass card */}
      <main className="signup-stage">
        <section className="signup-card">
          <div className="signup-head">
            <h1>Create your account</h1>
            <p className="lead">
            </p>
          </div>

          <p className="auth-switch">
            Already have an account? <a className="btn flow big" href="/login">Log In</a>
          </p>

          {/* Controlled form component */}
          <SignUpForm onSave={handleCreateUser} onCancel={handleCancel} disabled={isBusy} />

          {isBusy && <p className="subtle-status">Creating your account…</p>}
          {(error || localError) && <p className="error-text">{error || localError}</p>}

          <p className="fineprint">
            By creating an account, you agree to our&nbsp;
            <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
