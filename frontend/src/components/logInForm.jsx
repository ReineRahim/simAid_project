import React, { useState } from "react";

/**
 * 🔐 LoginForm Component
 *
 * A reusable login form with built-in client-side validation.
 * Collects user credentials (email and password), supports a
 * "Remember me" checkbox, and displays inline validation errors.
 *
 * The form disables inputs when the `disabled` prop is true (e.g., during login requests).
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback triggered on valid form submission. Receives `{ email, password, remember }`.
 * @param {boolean} [props.disabled=false] - Disables form fields and button while submitting.
 *
 * @example
 * <LoginForm
 *   disabled={isLoading}
 *   onSubmit={({ email, password, remember }) => handleLogin(email, password, remember)}
 * />
 */
export default function LoginForm({ onSubmit, disabled }) {
  // 🧠 Manage form input state
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [localError, setLocalError] = useState("");

  /**
   * Handles input field updates and checkbox toggles.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const onChange = (e) => {
    setLocalError("");
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  /**
   * Validates email and password fields.
   * @returns {string} Validation error message or an empty string if valid.
   */
  const validate = () => {
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (!form.password) return "Please enter your password.";
    return "";
  };

  /**
   * Submits the form after validation.
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const submit = (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setLocalError(v);
    onSubmit({
      email: form.email.trim(),
      password: form.password,
      remember: form.remember,
    });
  };

  return (
    <form onSubmit={submit} className="auth-form">
      <div className="field">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="you@example.com"
          disabled={disabled}
        />
      </div>

      <div className="field">
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder="••••••••"
          disabled={disabled}
        />
      </div>

      <div className="row-between">
        <label className="remember">
          <input
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={onChange}
            disabled={disabled}
          />
          Remember me
        </label>
        <a className="text-link" href="/forgot-password">Forgot password?</a>
      </div>

      {localError && <p className="error-text">{localError}</p>}

      <button type="submit" disabled={disabled} className="btn-primary">
        {disabled ? "Signing in…" : "Log in"}
      </button>
    </form>
  );
}
