/**
 * PrivacyPage
 * -----------------------------------------------------------------------------
 * Displays SimAid’s Privacy Policy in a simple static layout.
 * Includes sections outlining data collection, usage, cookies,
 * security measures, and contact information.
 *
 * Notes:
 * - This is a static informational page; no state or hooks are used.
 * - Styles are imported from "../styles/legal.css".
 * - The "Back to Home" link navigates users back to the signup page.
 */

import React from "react";
import "../styles/legal.css";

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <h1>🔒 Privacy Policy</h1>
        <p>Last updated: November 2025</p>
      </header>

      <section className="legal-content">
        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide (like name and email) and usage data to 
          improve your experience on SimAid.
        </p>

        <h2>2. How We Use Information</h2>
        <p>
          We use your information to operate, personalize, and improve the platform. 
          We do not sell or trade your data to third parties.
        </p>

        <h2>3. Cookies</h2>
        <p>
          SimAid uses cookies to remember your preferences and enhance your interaction. 
          You can disable cookies in your browser settings.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We use encryption and secure storage to protect your information. 
          However, no online system is 100% secure.
        </p>

        <h2>5. Contact Us</h2>
        <p>
          For privacy inquiries, contact us at{" "}
          <a href="mailto:support@simaid.com">support@simaid.com</a>.
        </p>

        <p className="return">
          <a href="/signUp">← Back to Home</a>
        </p>
      </section>
    </div>
  );
}
