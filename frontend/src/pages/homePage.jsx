// src/pages/HomePage.jsx

/**
 * HomePage
 * -----------------------------------------------------------------------------
 * Landing/dashboard for the training app.
 *
 * Responsibilities:
 * - Ensures an authenticated user is available (via `useAuth().loadMe()`).
 * - Fetches the list of levels (`useLevels`) and the user's level progress
 *   (`useUserLevels`) on mount and whenever the window regains focus.
 * - Derives which levels are unlocked for the current user.
 * - Renders up to six level cards (locked/unlocked), with friendly fallbacks
 *   when the API provides fewer than six levels.
 *
 * Data flow summary:
 *   useAuth()        -> { user, loadMe }
 *   useLevels()      -> { levels, loading: levelsLoading, error: levelsError, fetchLevels }
 *   useUserLevels()  -> { userLevels, loading: ulLoading, error: ulError, fetchUserLevels }
 *
 * UX notes:
 * - Shows skeletons while loading, and a retry UI on error.
 * - Uses <Link /> to navigate to an unlocked level.
 * - Unlock state is derived from userLevels (unlocked || completed) and
 *   Level 1 is always unlocked by default for first-time users.
 */

import React, { useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLevels } from "../hooks/useLevels";
import { useUserLevels } from "../hooks/useUserLevels";
import { useAuth } from "../hooks/useAuth";
import "../styles/home.css";

export default function HomePage() {
  const navigate = useNavigate();

  // Authentication/context -----------------------------------------------------
  // If user is not loaded yet, we call loadMe() to fetch it using the stored token.
  const { user, loadMe } = useAuth();

  // Levels catalog (title/description/order) ----------------------------------
  const {
    levels,
    loading: levelsLoading,
    error: levelsError,
    fetchLevels,
  } = useLevels();

  // User-specific progress across levels --------------------------------------
  const {
    userLevels,
    loading: ulLoading,
    error: ulError,
    fetchUserLevels,
  } = useUserLevels();

  // Ensure we have user & data -------------------------------------------------
  // 1) If no user -> attempt to load it
  // 2) Once user exists -> fetch levels + user's level progress
  useEffect(() => {
    if (!user?.id) {
      loadMe?.();
      return;
    }
    fetchLevels?.();
    fetchUserLevels?.(user.id);
  }, [user?.id, loadMe, fetchLevels, fetchUserLevels]);

  // Optional: refetch when the window regains focus so progress is up-to-date --
  useEffect(() => {
    const onFocus = () => {
      if (user?.id) {
        fetchLevels?.();
        fetchUserLevels?.(user.id);
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user?.id, fetchLevels, fetchUserLevels]);

  // Build a set of unlocked level IDs -----------------------------------------
  // A level is considered unlocked if the user has it marked as unlocked or completed.
  // We also force Level 1 to be unlocked by default to start the journey.
  const unlockedIds = useMemo(() => {
    const set = new Set();

    (userLevels ?? []).forEach((ul) => {
      const id = Number(ul.level_id ?? ul.levelId ?? ul.id);
      const isUnlocked = Boolean(ul.unlocked) || Boolean(ul.completed);
      if (id && isUnlocked) set.add(id);
    });

    // Always unlock level 1 by default
    set.add(1);

    return set;
  }, [userLevels]);

  // Prepare up to six level tiles for display ---------------------------------
  // Uses emoji/title fallbacks if API provides fewer than six.
  const displayLevels = useMemo(() => {
    const fallback = {
      1: { title: "Level 1 · Basics", emoji: "🩹" },
      2: { title: "Level 2 · Airway", emoji: "🫁" },
      3: { title: "Level 3 · Bleeding", emoji: "🩸" },
      4: { title: "Level 4 · Burns", emoji: "🔥" },
      5: { title: "Level 5 · Shock", emoji: "🚑" },
      6: { title: "Level 6 · Multi-Trauma", emoji: "🧯" },
    };

    const six =
      levels
        ?.slice()
        ?.sort((a, b) => Number(a.order ?? a.id) - Number(b.order ?? b.id))
        ?.slice(0, 6)
        ?.map((lv) => {
          const id = Number(lv.id ?? lv.level_id);
          return {
            id,
            title: lv.title || fallback[id]?.title || `Level ${id}`,
            emoji: lv.emoji || fallback[id]?.emoji || "🎮",
            unlocked: unlockedIds.has(id),
          };
        }) || [];

    // Fill placeholders if fewer than six come from the API
    for (let i = six.length + 1; i <= 6; i++) {
      six.push({
        id: i,
        title: fallback[i]?.title || `Level ${i}`,
        emoji: fallback[i]?.emoji || "🎮",
        unlocked: unlockedIds.has(i),
      });
    }

    return six.slice(0, 6);
  }, [levels, unlockedIds]);

  // Aggregate load/error states ------------------------------------------------
  const loading = levelsLoading || ulLoading;
  const error = levelsError || ulError;

  return (
    <div className="home-root">
      {/* Top toolbar with quick navigation ------------------------------------ */}
      <div className="home-toolbar">
        <button className="landing-pill" onClick={() => navigate("/")}>
          <span className="who"> ← Start Page</span>
        </button>
        <button className="profile-pill" onClick={() => navigate("/profile")}>
          <span className="avatar">🧑‍⚕️</span>
          <span className="who">Profile</span>
        </button>
      </div>

      {/* Headline + tagline ---------------------------------------------------- */}
      <div className="home-head">
        <h1>
          Train to save <span className="accent">lives</span>
        </h1>
        <p className="lead">Advance through each level and ace it to earn your next badge!</p>
      </div>

      {/* Loading skeletons ----------------------------------------------------- */}
      {loading && (
        <section className="home-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="level-card skeleton" key={`sk-${i}`} />
          ))}
        </section>
      )}

      {/* Error state with retry actions --------------------------------------- */}
      {!loading && error && (
        <div className="home-error">
          <p>Couldn’t load levels: {error}</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              className="btn small ghost"
              onClick={() => user?.id && fetchUserLevels?.(user.id)}
            >
              Retry user levels
            </button>
            <button className="btn small flow" onClick={fetchLevels}>
              Retry levels
            </button>
          </div>
        </div>
      )}

      {/* Normal display: six cards (locked/unlocked) -------------------------- */}
      {!loading && !error && (
        <section className="home-grid">
          {displayLevels.map((lv) =>
            lv.unlocked ? (
              <Link to={`/level/${lv.id}`} className="level-card unlocked" key={lv.id}>
                <div className="card-top">
                  <span className="badge unlocked-badge">Unlocked</span>
                  <span className="emoji">{lv.emoji}</span>
                </div>
                <h3>{lv.title}</h3>
                <p className="muted">Tap to enter this simulation.</p>
                <div className="card-actions">
                  <span className="btn small flow">Start</span>
                </div>
              </Link>
            ) : (
              <div className="level-card locked" key={lv.id}>
                <div className="card-top">
                  <span className="badge locked-badge">Locked</span>
                  <span className="emoji">{lv.emoji}</span>
                </div>
                <h3>{lv.title}</h3>
                <p className="muted">Complete earlier levels to unlock.</p>
                <div className="card-actions">
                  <span className="btn small ghost">Locked</span>
                </div>
                {/* Decorative lock overlay (non-interactive) */}
                <div className="lock-overlay" aria-hidden>
                  <svg className="lock-icon" viewBox="0 0 24 24">
                    <path d="M6 10V8a6 6 0 1112 0v2h1a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1h1zm2 0h8V8a4 4 0 10-8 0v2z" />
                  </svg>
                </div>
              </div>
            )
          )}
        </section>
      )}
    </div>
  );
}
