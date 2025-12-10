/**
 * TermsPage
 * -----------------------------------------------------------------------------
 * Displays SimAid’s Terms of Service as a static informational page.
 * Includes key sections on:
 *  - Acceptance of Terms
 *  - Use of the Service
 *  - User Content responsibilities
 *  - Account Termination conditions
 *  - Updates or changes to Terms
 *
 * Notes:
 * - Purely static; does not depend on hooks or dynamic data.
 * - Styled using ../styles/legal.css.
 * - Provides a link at the bottom to return users to the signup page.
 */

import React from "react";
import "../styles/legal.css";

export default function TermsPage() {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <h1>📜 Terms of Service</h1>
        <p>Last updated: November 2025</p>
      </header>

      <section className="legal-content">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account or using SimAid, you agree to these Terms of Service. 
          If you do not agree, please do not access or use the platform.
        </p>

        <h2>2. Use of the Service</h2>
        <p>
          You agree to use SimAid responsibly and only for lawful purposes. 
          You may not attempt to interfere with the security or integrity of the service.
        </p>

        <h2>3. User Content</h2>
        <p>
          You are responsible for any content you submit or share. 
          SimAid reserves the right to remove inappropriate or offensive content at any time.
        </p>

        <h2>4. Account Termination</h2>
        <p>
          We may suspend or terminate your account if you violate these Terms or misuse the service.
        </p>

        <h2>5. Changes to Terms</h2>
        <p>
          We may update these Terms occasionally. Continued use of the platform after changes 
          means you accept the new version.
        </p>

        <p className="return">
          <a href="/signup">← Back to Home</a>
        </p>
      </section>
    </div>
  );
}
