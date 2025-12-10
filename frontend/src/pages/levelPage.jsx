/**
 * LevelPage
 * -----------------------------------------------------------------------------
 * Displays a level's overview: title/description, progress across scenarios,
 * and the list of scenarios for navigation. Tracks attempts for the current user,
 * computes progress, and awards a one-time completion badge when all scenarios
 * are finished.
 *
 * Notes
 * - Data sources: useAuth, useLevels, useScenarios, useAttempts, useBadges.
 * - Progress: best score per scenario is normalized to a 0–100% scale.
 * - Badge: shown/created once per (user, level), guarded via localStorage.
 * - Icon URLs: normalized to a safe, resolvable path with a fallback image.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import { useLevels } from "../hooks/useLevels";
import { useScenarios } from "../hooks/useScenarios";
import { useAttempts } from "../hooks/useAttempt";
import { useAuth } from "../hooks/useAuth";
import { useBadges } from "../hooks/useBadges";

import BadgeEarnedModal from "../components/BadgeEarnedModal";
import "../styles/level.css";

export default function LevelPage() {
  const navigate = useNavigate();
  const { levelId } = useParams();
  const id = Number(levelId);

  /**
   * Resolve potentially inconsistent values from DB/API into a usable icon URL.
   * Handles: absolute http(s), root-relative (/assets), bare filenames, and a
   * common "/assests" typo. Always returns a valid path (fallback included).
   *
   * @param {string | null | undefined} v Raw icon path or URL
   * @returns {string} Resolved, safe URL suitable for <img src="">
   */
  const resolveIconUrl = (v) => {
    if (!v) return "/assets/fallback.png";
    let s = String(v).trim();
    if (s.startsWith("/assests/")) s = s.replace("/assests/", "/assets/");
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("/")) return s;
    return `/assets/${s.replace(/^assets\//, "")}`;
  };

  // ── Auth & data hooks ─────────────────────────────────────────────────────
  const { user } = useAuth();
  const { levels = [], loading: lvlLoading, fetchLevels } = useLevels();
  const {
    scenarios = [],
    loading: scenLoading,
    fetchScenariosByLevel,
    error,
  } = useScenarios();
  const {
    attempts,
    fetchAttemptsByUserAndLevel,
    loading: attemptsLoading,
  } = useAttempts();
  const { badges, createBadge } = useBadges();

  // Modal: holds a newly earned badge, if any
  const [earnedBadge, setEarnedBadge] = useState(null);

  // ── Initial fetches ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!levels.length) fetchLevels?.();
    fetchScenariosByLevel?.(id);
    if (user?.id) fetchAttemptsByUserAndLevel?.(user.id, id);
  }, [
    levels.length,
    id,
    user?.id,
    fetchLevels,
    fetchScenariosByLevel,
    fetchAttemptsByUserAndLevel,
  ]);

  // ── Level info with safe fallback ─────────────────────────────────────────
  const level = useMemo(
    () =>
      levels.find((l) => Number(l.id ?? l.level_id) === id) || {
        id,
        title: `Level ${id}`,
        description: "",
      },
    [levels, id]
  );

  // ── Attempts filtered to the current user ─────────────────────────────────
  const effectiveAttempts = useMemo(() => {
    if (!user?.id || attemptsLoading) return [];
    return (attempts ?? []).filter(
      (a) => Number(a.user_id ?? a.userId ?? user.id) === Number(user.id)
    );
  }, [attempts, attemptsLoading, user?.id]);

  // ── Best score per scenario (normalized to %) ─────────────────────────────
  const attemptsByScenario = useMemo(() => {
    const map = new Map();
    for (const a of effectiveAttempts) {
      const sid = Number(a.scenario_id ?? a.scenarioId);
      if (!Number.isFinite(sid) || a?.score == null) continue;
      const score = Number(a.score);
      const norm = score > 0 && score < 1 ? score * 100 : score; // 0..1 -> %
      map.set(sid, Math.max(map.get(sid) ?? 0, norm));
    }
    return map;
  }, [effectiveAttempts]);

  // ── Scenarios with progress and robust icon resolution ────────────────────
  const levelScenarios = useMemo(() => {
    return (scenarios ?? [])
      .filter((s) => Number(s.level_id ?? s.levelId) === id)
      .map((s) => {
        const sid = Number(s.id ?? s.scenario_id ?? 0);
        const best = attemptsByScenario.get(sid) ?? 0;
        const progress = Math.round(Math.min(100, Math.max(0, best)));

        const rawIcon =
          s.icon_url ?? s.iconUrl ?? s.image_url ?? s.imageUrl ?? s.icon ?? null;

        return {
          id: sid,
          title: s.title || "Scenario",
          description: s.description || "",
          iconUrl: resolveIconUrl(rawIcon),
          steps: 4, // UI-only label; not used for gating logic
          progress,
        };
      });
  }, [scenarios, id, attemptsByScenario]);

  // Aggregate progress across the level
  const completedCount = levelScenarios.filter((s) => s.progress >= 100).length;
  const totalScenarios = levelScenarios.length;

  const progressPct = useMemo(() => {
    if (!totalScenarios) return 0;
    const sum = levelScenarios.reduce((a, b) => a + (b.progress || 0), 0);
    return Math.round(sum / totalScenarios);
  }, [levelScenarios, totalScenarios]);

  const loading = lvlLoading || scenLoading || attemptsLoading;

  // ── Badge logic (one-time show per user/level) ────────────────────────────
  const prevCompletedRef = useRef(0);

  // Reset badge state when user or level changes
  useEffect(() => {
    setEarnedBadge(null);
    prevCompletedRef.current = 0;
  }, [user?.id, id]);

  useEffect(() => {
    const storageKey = `badge_shown_level_${id}`;
    const alreadyShown = localStorage.getItem(storageKey) === "1";

    const prev = prevCompletedRef.current;
    const allDoneNow = totalScenarios > 0 && completedCount === totalScenarios;
    const justCompleted = allDoneNow && prev < totalScenarios;

    if (justCompleted && !alreadyShown && user?.id) {
      const existing = badges.find(
        (b) => Number(b.level_id) === id && Number(b.user_id) === Number(user.id)
      );

      if (existing) {
        setEarnedBadge(existing);
        localStorage.setItem(storageKey, "1");
      } else {
        const badgeData = {
          user_id: user.id,
          level_id: id,
          name: `${level.title} Master`,
          description: `Completed all scenarios in ${level.title}`,
          icon_url: "trophy",
        };

        createBadge(badgeData)
          .then((newBadge) => {
            setEarnedBadge(newBadge);
            localStorage.setItem(storageKey, "1");
          })
          .catch((err) => {
            console.error("Failed to create badge:", err);
          });
      }
    }

    prevCompletedRef.current = completedCount;
  }, [
    completedCount,
    totalScenarios,
    id,
    user?.id,
    badges,
    createBadge,
    level.title,
  ]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="level-root">
      <header className="level-topbar">
        <button className="btn small ghost" onClick={() => navigate("/home")}>
          ← Back
        </button>
        <div className="level-title-wrap">
          <h1>{level.title}</h1>
          {level.description && <p className="muted">{level.description}</p>}
        </div>
      </header>

      <section className="level-progress-card">
        <div className="lp-head">
          <span>Level Progress</span>
          <strong>
            {completedCount} / {totalScenarios} scenarios
          </strong>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </section>

      <section className="level-section">
        <h2>Scenarios</h2>

        {loading ? (
          <p>Loading scenarios…</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : levelScenarios.length ? (
          <div className="scenarios-grid">
            {levelScenarios.map((s) => (
              <Link
                key={s.id}
                to={`/level/${id}/scenario/${s.id}`}
                state={{ icon_url: s.iconUrl }} // pass resolved URL to Scenario page
                className="scenario-card"
              >
                <div className="sc-top">
                  <div className="sc-icon">
                    <img
                      src={s.iconUrl}
                      alt={s.title}
                      width={48}
                      height={48}
                      loading="lazy"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        objectFit: "cover",
                        backgroundColor: "#f5f5f5",
                      }}
                      onError={(e) => {
                        e.currentTarget.src = "/assets/fallback.png";
                      }}
                    />
                  </div>
                  <div className="sc-head">
                    <h3>{s.title}</h3>
                    <p className="muted">{s.steps} Steps</p>
                  </div>
                  <div className="sc-cta">
                    <span className="play-pill">▶</span>
                  </div>
                </div>
                <div className="sc-progress">
                  <div className="progress-bar thin">
                    <div
                      className="progress-fill"
                      style={{ width: `${s.progress}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="level-empty">
            <p>No scenarios yet for this level.</p>
          </div>
        )}
      </section>

      {earnedBadge && (
        <BadgeEarnedModal
          badge={earnedBadge}
          onClose={() => setEarnedBadge(null)}
          onGoToLevel={() => setEarnedBadge(null)}
        />
      )}
    </div>
  );
}
