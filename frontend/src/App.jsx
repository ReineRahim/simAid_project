// src/App.jsx

/**
 * App
 * -----------------------------------------------------------------------------
 * Top-level router and layout for SimAid.
 * - Renders a global header (brand + scroll-to-top), routed page content, and footer.
 * - Uses `Routes` to map all public pages: landing, auth, profile, home, levels, scenarios, legal.
 * - Applies `100svh` handling for the landing page to fill safe viewport height on mobile.
 *
 * Accessibility
 * - Brand element is keyboard-activable (Enter/Space) and uses aria-label.
 */

import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import LandingPage from "./pages/landingPage";
import SignUpPage from "./pages/signUpPage";
import ProfilePage from "./pages/profilePage";
import LoginPage from "./pages/logInPage";
import HomePage from "./pages/homePage";
import LevelPage from "./pages/levelPage";
import ScenarioPage from "./pages/scenarioPage";
import PrivacyPage from "./pages/privacyPage";
import TermsPage from "./pages/termsPage";
import "./App.css";

export default function App() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <div className="App min-h-[100svh]">
      {/* Global, consistent nav on ALL pages */}
      <header className="sa-nav">
        <div
          className="brand"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") &&
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
          aria-label="Go to top"
        >
          <Logo />
          <span>SimAid</span>
        </div>
      </header>

      {/* Page content */}
      <main className={isLanding ? "h-[100svh]" : "App-main"}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage/>} />
          <Route path="/profile" element={<ProfilePage/>} />
          {/* key forces re-mount when navigating between different levelId routes */}
          <Route path="/level/:levelId" element={<LevelPage key={location.pathname} />} />
          <Route path="/level/:levelId/scenario/:scenarioId" element={<ScenarioPage />} />
          <Route path="/privacy" element={<PrivacyPage/>} />
          <Route path="/terms" element={<TermsPage/>} />
        </Routes>
      </main>

      <footer className="App-footer">
        <p>SimAid — Practice. Learn. Save Lives.</p>
      </footer>
    </div>
  );
}

/**
 * Logo
 * -----------------------------------------------------------------------------
 * Circular emblem with a heartbeat polyline.
 * Pure presentational component used in the global header.
 */
function Logo() {
  return (
    <div className="logo-badge">
      <div className="logo-icon">
        <svg
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          className="heartbeat-icon"
        >
          <circle cx="16" cy="16" r="14" strokeWidth="2.5" />
          <polyline
            points="7,16 12,16 14,12 17,20 20,16 25,16"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
