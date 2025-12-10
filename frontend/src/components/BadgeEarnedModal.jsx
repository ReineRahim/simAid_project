import React, { useEffect } from "react";
import "./badge-modal.css";

/**
 * 🎖️ BadgeEarnedModal Component
 *
 * Displays a celebratory modal when the user earns a new badge.
 * Includes accessibility features, ESC key handling, and optional
 * navigation buttons.
 *
 * @component
 * @param {object} props - Component props
 * @param {object} props.badge - Badge data to display
 * @param {string} [props.badge.name] - Badge title (e.g., “Level 3 Champion”)
 * @param {string} [props.badge.description] - Description of how the badge was earned
 * @param {string} [props.badge.icon_url] - Optional image/icon URL
 * @param {Function} [props.onClose] - Handler to close the modal
 * @param {Function} [props.onGoToLevel] - Handler to navigate back to the level screen
 *
 * @example
 * <BadgeEarnedModal
 *   badge={{ name: "Level 3 Master", description: "Completed all challenges!", icon_url: "/icons/master.svg" }}
 *   onClose={() => setShow(false)}
 *   onGoToLevel={() => navigate("/levels")}
 * />
 */
export default function BadgeEarnedModal({ badge, onClose, onGoToLevel }) {
  // ⌨️ Close modal on ESC key
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // 🪄 Debug logging on mount
  useEffect(() => {
    console.log("✅ BadgeEarnedModal mounted with badge:", badge);
  }, [badge]);

  if (!badge) return null;

  const icon = badge.icon_url || "🏅";

  return (
    <div className="badge-modal-backdrop" role="dialog" aria-modal="true">
      <div className="badge-modal">
        <button
          className="badge-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {/* Decorative visual elements */}
        <div className="badge-fireworks" aria-hidden="true" />
        <div className="badge-ring" aria-hidden="true" />

        <div className="badge-icon">
          {icon.startsWith("http") ||
          icon.endsWith(".png") ||
          icon.endsWith(".svg") ? (
            <img src={icon} alt="" />
          ) : (
            <span>{icon}</span>
          )}
        </div>

        <h2>Badge Earned!</h2>
        <p className="badge-name">{badge.name ?? "Level Master"}</p>
        {badge.description && (
          <p className="badge-desc">{badge.description}</p>
        )}

        <div className="badge-actions">
          <button className="btn ghost" onClick={onClose}>
            Keep Practicing
          </button>
          <button className="btn flow" onClick={onGoToLevel}>
            Back to Level
          </button>
        </div>
      </div>
    </div>
  );
}
