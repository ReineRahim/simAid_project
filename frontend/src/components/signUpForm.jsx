import React, { useState } from "react";

/**
 * 📝 SignUpForm Component
 *
 * A reusable user registration form that collects a full name, email, and password.
 * Includes an optional password confirmation check and supports disabling during async operations.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onSave - Callback triggered when the form is successfully submitted. Receives `{ name, email, password }`.
 * @param {Function} [props.onCancel] - Optional callback when the user cancels the signup process.
 * @param {boolean} [props.disabled=false] - Disables all fields and buttons while submission is in progress.
 *
 * @example
 * <SignUpForm
 *   onSave={({ name, email, password }) => handleRegister(name, email, password)}
 *   onCancel={() => navigate("/login")}
 *   disabled={isLoading}
 * />
 */
export default function SignUpForm({ onSave, onCancel, disabled }) {
  // 🧠 Local form state
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [msg, setMsg] = useState("");

  /**
   * Handles input changes for controlled fields.
   * Clears error message on edit.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const onChange = (e) => {
    setMsg("");
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  /**
   * Handles form submission with client-side validation.
   * Ensures passwords match before calling `onSave`.
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const submit = (e) => {
    e.preventDefault();

    if (form.confirm && form.password !== form.confirm) {
      setMsg("Passwords do not match.");
      return;
    }

    onSave({
      name: form.full_name.trim(),
      email: form.email.trim(),
      password: form.password,
    });
  };

  return (
    <form className="su-form" onSubmit={submit} noValidate>
      <div className="su-field">
        <label className="su-label" htmlFor="full_name">Full name</label>
        <input
          id="full_name"
          className="su-input"
          type="text"
          name="full_name"
          value={form.full_name}
          onChange={onChange}
          placeholder="Jane Doe"
          required
          autoComplete="name"
          disabled={disabled}
        />
      </div>

      <div className="su-field">
        <label className="su-label" htmlFor="email">Email</label>
        <input
          id="email"
          className="su-input"
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="you@example.com"
          required
          autoComplete="email"
          disabled={disabled}
        />
      </div>

      <div className="su-field">
        <label className="su-label" htmlFor="password">Password</label>
        <input
          id="password"
          className="su-input"
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder="•••••••"
          required
          minLength={6}
          autoComplete="new-password"
          disabled={disabled}
        />
      </div>

      {/* Optional confirmation field for password validation */}
      <div className="su-field">
        <label className="su-label" htmlFor="confirm">Confirm password</label>
        <input
          id="confirm"
          className="su-input"
          type="password"
          name="confirm"
          value={form.confirm}
          onChange={onChange}
          placeholder="•••••••"
          autoComplete="new-password"
          disabled={disabled}
        />
      </div>

      {msg && <p className="su-error" role="alert">{msg}</p>}

      <div className="su-actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn--secondary"
            disabled={disabled}
          >
            <a href="/" style={{ textDecoration: 'none', color: '#fff' }}>Cancel</a>
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={disabled}>
          {disabled ? "Creating…" : "Create Account"}
        </button>
      </div>
    </form>
  );
}
