import React, { useEffect, useRef, useState } from "react";
import "../styles/landing.css";

/**
 * Landing
 * -----------------------------------------------------------------------------
 * Marketing/entry page for the simulation app.
 *
 * Responsibilities
 * - Presents hero section with CTA to sign up / log in.
 * - Shows an animated tilt preview card (pointer-based, disabled on touch).
 * - Lists feature highlights and a themed badge strip.
 * - Uses an IntersectionObserver to trigger lightweight UI effects when
 *   content enters the viewport (see `meterRef` usage).
 *
 * Performance & A11y
 * - The hero image sets `loading="eager"` and `fetchpriority="high"` to help LCP.
 * - `decoding="async"` allows non-blocking decode.
 * - Sections and decorative elements include appropriate ARIA attributes.
 */
export default function Landing() {
  /** Ref used with IntersectionObserver to trigger UI effects on view. */
  const meterRef = useRef(null);

  /**
   * Lightweight on/off flag for any viewport-driven visual meter/animation.
   * Note: only the setter is used here (the value is not read).
   * If you later read the value, switch to `[meterOn, setMeterOn]`.
   */
  const [ setMeterOn] = useState(false);

  /**
   * On mount: observe `meterRef` for visibility and flip `setMeterOn(true)`
   * when at least ~45% of the element is visible. Cleans up on unmount.
   */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setMeterOn(true)),
      { threshold: 0.45 }
    );
    if (meterRef.current) io.observe(meterRef.current);
    return () => io.disconnect();
  });

  return (
    <div className="sa-root">
      <div className="bg-layer base" />
      <div className="bg-layer glow glow-1" />
      <div className="bg-layer glow glow-2" />
      <div className="bg-layer noise" />

      {/* Hero */}
      <section className="hero">
        <div className="hero-left">
          <h1>
            Train to <span className="accent">save lives</span>
            <br /> by <span className="accent">playing</span>
          </h1>
          <p className="lead">
            Interactive first-aid simulations with real-time decisions. Earn levels, collect badges, and unlock your
            shareable certificate.
          </p>
          <div className="cta-row">
            <a className="btn flow big" href="/signup">Start now</a>
            <a className="btn ghost big" href="/login">I already have an account</a>
          </div>
          <ul className="ticks" aria-label="Highlights">
            <li>🎯 Decision-based gameplay</li>
            <li>🏅 Levels & badges that actually matter</li>
            <li>📜 Shareable certificate on completion</li>
          </ul>
        </div>

        <div className="hero-right">
          <TiltCard>
            <FirstAidImg />
          </TiltCard>

          <div className="badge-strip" aria-hidden>
            {badges.map((b, i) => (
              <div className="badge" key={i} title={b.label}>
                <span className="emoji" aria-hidden>{b.emoji}</span>
                <span className="label">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="features" aria-label="Key features">
        {features.map((f, i) => (
          <TiltCard key={i}>
            <div className="feature-card">
              <div className="icon" aria-hidden>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          </TiltCard>
        ))}
      </section>

      {/* Footer CTA */}
      <footer className="sa-footer">
        <div className="footer-inner">
          <div className="copy">
            <h3>Ready to earn your certificate?</h3>
            <p>Finish core modules to unlock your shareable SimAid “First Aid Ready” certificate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * TiltCard
 * -----------------------------------------------------------------------------
 * A lightweight 3D tilt wrapper that responds to pointer movement. To preserve
 * comfort and performance on touch/coarse devices, the tilt effect is disabled
 * when `(pointer: coarse)` matches.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
function TiltCard({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip tilt on touch/coarse pointers for accessibility/perf
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;

    function onMove(e) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      el.style.setProperty("--rx", (dy * -8).toFixed(2) + "deg");
      el.style.setProperty("--ry", (dx * 12).toFixed(2) + "deg");
    }
    function reset() {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", reset);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="tilt"
      style={{ transform: "rotateX(var(--rx)) rotateY(var(--ry))" }}
    >
      {children}
    </div>
  );
}

/**
 * FirstAidImg
 * -----------------------------------------------------------------------------
 * Hero media block for the landing page.
 *
 * Notes:
 * - Uses eager loading + high fetch priority to optimize LCP.
 * - Provides explicit width/height to reduce CLS.
 *
 * @returns {JSX.Element}
 */
function FirstAidImg() {
  return (
    <div className="media-card">
      <img
        src={ "/assets/firstaid-hero.jpg"}
        alt="First-aid training kit and supplies"
        loading="eager"        // prioritize Largest Contentful Paint
        decoding="async"
        fetchpriority="high"
        width={1040}           // intrinsic size helps reduce CLS
        height={780}
      />
    </div>
  );
}

/**
 * Display-only badge metadata for the hero badge strip.
 * @type {Array<{emoji: string, label: string}>}
 */
const badges = [
  { emoji: "💓", label: "CPR" },
  { emoji: "🫁", label: "Choking" },
  { emoji: "🩸", label: "Bleeding" },
  { emoji: "🔥", label: "Burns" },
  { emoji: "🧯", label: "Emergency" },
  { emoji: "🚑", label: "Response" },
];

/**
 * Feature cards content for the landing grid.
 * @type {Array<{icon: string, title: string, text: string}>}
 */
const features = [
  {
    icon: "🎮",
    title: "Real scenarios, game feel",
    text: "Make rapid decisions in time-pressured simulations.",
  },
  {
    icon: "🏅",
    title: "Levels & badges",
    text: "Level up as you master modules and collect badges for your achievements.",
  },
  {
    icon: "📜",
    title: "Shareable certificate",
    text: "Unlock a certificate you can share once you complete the core track.",
  },
  {
    icon: "📊",
    title: "Personal feedback",
    text: "Get a breakdown of strengths and focus areas after every attempt.",
  },
];
