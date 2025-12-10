/**
 * LoginPage
 * -----------------------------------------------------------------------------
 * Renders the login screen and wires up authentication via useAuth().
 * - Submits credentials from <LoginForm /> and navigates to /home on success.
 * - Shows loading and error states from both the auth hook and local submission.
 * - Applies a mobile viewport height workaround using the --vh CSS variable.
 *
 * Key flows
 * - handleLogin: calls login({ email, password }), handles UX states, and redirects.
 * - Mobile-safe height: updates --vh on resize/orientationchange for 100vh quirks.
 */

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoginForm from "../components/LoginForm";
import "../styles/Login.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error, clearError, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  /**
   * Mobile viewport height workaround:
   * Sets --vh to 1% of window.innerHeight and keeps it updated,
   * improving layouts that rely on 100vh on mobile browsers.
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
   * Handle login submission.
   * Receives { email, password } from <LoginForm /> and:
   * - clears prior errors
   * - sets a submitting flag
   * - calls login()
   * - navigates to /home on success
   * - surfaces any thrown error as a user-friendly message
   *
   * @param {{ email: string, password: string }} data
   * @returns {Promise<void>}
   */
  const handleLogin = async (data) => {
    setLocalError("");
    clearError?.();
    setSubmitting(true);
    try {
      await login({ email: data.email, password: data.password });
      navigate("/home"); // redirect after successful auth
    } catch (e) {
      setLocalError(e?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-stage">
        <div className="auth-card">
          <button className="back-btn" onClick={() => navigate("/")}>
            ← Back
          </button>

          <h1>Welcome back</h1>
          <p className="lead">Log in to continue your SimAid journey.</p>

          <LoginForm onSubmit={handleLogin} disabled={loading || submitting} />

          {(loading || submitting) && (
            <p className="subtle-status">Signing you in…</p>
          )}
          {(error || localError) && (
            <p className="error-text">{error || localError}</p>
          )}

          <p className="auth-switch">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
