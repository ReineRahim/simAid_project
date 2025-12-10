// src/pages/ScenarioPage.jsx

/**
 * ScenarioPage
 * -----------------------------------------------------------------------------
 * Plays a multi-step scenario quiz for a given level/scenario ID:
 * - Loads scenario metadata and steps from scenarioService.
 * - Shows a per-step timer; auto-reveals when time runs out.
 * - Tracks answers and per-step correctness, then submits for a final score.
 * - Refreshes scenario progress in the level context after submit.
 * - Shows a level-completion badge modal when appropriate.
 *
 * Data & hooks
 * - useAuth(): current user (for badge persistence)
 * - useBadges(): find/persist level-completion badges
 * - useScenarios(): refreshScenarioProgress()
 * - useLevels(): catalog of levels, used to validate/unlock next level
 *
 * Notes
 * - Icon URLs are normalized via resolveIconUrl() with a defensive fallback.
 * - Next-level unlock is sanitized against the known catalog to prevent bad IDs.
 * - Submission includes a harmless { suppressUnlock } hint if on the last level.
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { scenarioService } from "../services/scenarioService";
import { useScenarios } from "../hooks/useScenarios";
import { useAuth } from "../hooks/useAuth";
import { useBadges } from "../hooks/useBadges";
import { useLevels } from "../hooks/useLevels"; // uses catalog to validate unlocks
import BadgeEarnedModal from "../components/BadgeEarnedModal";

import "../styles/level.css";
import "../styles/scenario.css";

export default function ScenarioPage() {
  const { levelId, scenarioId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const id = Number(scenarioId);

  const { user } = useAuth();
  const { badges, createBadge } = useBadges();
  const { refreshScenarioProgress } = useScenarios();
  const { levels = [], fetchLevels } = useLevels();  // load catalog for validation

  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Step & answer state
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [_stepResults, setStepResults] = useState([]);
  const [revealed, setRevealed] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Level-completion badge (modal)
  const [levelBadge, setLevelBadge] = useState(null);

  // Per-step timer
  const SECS_PER_STEP = 30;
  const [secsLeft, setSecsLeft] = useState(SECS_PER_STEP);
  const timerRef = useRef(null);

  /**
   * Normalize raw icon paths/URLs from navigation state or API into a safe URL.
   * - Fixes "/assests" typo.
   * - Supports absolute http(s), root-relative (/assets/*), and bare filenames.
   */
  const resolveIconUrl = useMemo(
    () => (v) => {
      if (!v) return "/assets/fallback.png";
      let s = String(v).trim();
      if (s.startsWith("/assests/")) s = s.replace("/assests/", "/assets/");
      if (/^https?:\/\//i.test(s)) return s;
      if (s.startsWith("/")) return s;
      return `/assets/${s.replace(/^assets\//, "")}`;
    },
    []
  );

  // Load levels once (needed to know valid/max IDs)
  useEffect(() => {
    if (!levels.length) fetchLevels?.();
  }, [levels.length, fetchLevels]);

  // Valid level IDs + max (last) level ID from catalog
  const validLevelIds = useMemo(
    () =>
      new Set(
        (levels ?? [])
          .map((l) => Number(l.id ?? l.level_id))
          .filter((n) => Number.isFinite(n))
      ),
    [levels]
  );
  const maxLevelId = useMemo(
    () => (validLevelIds.size ? Math.max(...validLevelIds) : null),
    [validLevelIds]
  );

  // Load scenario and steps; reset local state
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");

        const passedUrl = location.state?.icon_url || null;
        const data = await scenarioService.getById(id);

        const steps = (data?.steps || [])
          .map((s) => ({
            id: Number(s.step_id ?? s.id ?? 0),
            order: Number(s.step_order ?? s.order ?? 0),
            q: s.question_text || s.question || "",
            options: s.options || {
              A: s.option_a,
              B: s.option_b,
              C: s.option_c,
              D: s.option_d,
            },
            correct: String(s.correct_action || s.correct_option || "").toUpperCase(),
            feedback: s.feedback_message || "",
          }))
          .sort((a, b) => a.order - b.order);

        const apiIcon = data.icon_url ?? data.icon ?? data.image_url ?? null;

        setScenario({
          id: Number(data.scenario_id ?? data.id ?? id),
          level_id: Number(data.level_id ?? levelId),
          title: data.title || "Scenario",
          description: data.description || "",
          icon_url: resolveIconUrl(passedUrl || apiIcon),
          steps,
        });

        setAnswers(new Array(steps.length).fill(null));
        setStepResults(new Array(steps.length).fill(null));
        setIdx(0);
        setRevealed(null);
        setResult(null);
        setSecsLeft(SECS_PER_STEP);
      } catch (e) {
        setError(e?.message || "Failed to load scenario");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, levelId, location.state, resolveIconUrl]);

  const total = scenario?.steps?.length ?? 0;
  const current = scenario?.steps?.[idx];

  /**
   * (Re)start the per-step countdown when the step changes.
   * Auto-reveals the correct answer if time elapses.
   */
  useEffect(() => {
    if (!current || result) return;
    clearInterval(timerRef.current);
    setSecsLeft(SECS_PER_STEP);

    timerRef.current = setInterval(() => {
      setSecsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleReveal(null, true);
          return SECS_PER_STEP;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, current, result]);

  /**
   * Reveal the correct option for the current step and record the attempt.
   * @param {"A"|"B"|"C"|"D"|null} pickedLetter User's selected option (or null if timeout)
   * @param {boolean} timedOut Whether the timer ended the step
   */
  function handleReveal(pickedLetter, timedOut = false) {
    if (!current) return;
    const correctLetter = current.correct;
    const wasCorrect = !!pickedLetter && pickedLetter === correctLetter;

    setRevealed({ correctLetter, wasCorrect, timedOut });

    setAnswers((prev) => {
      const copy = prev.slice();
      copy[idx] = pickedLetter;
      return copy;
    });

    setStepResults((prev) => {
      const copy = prev.slice();
      copy[idx] = {
        stepId: current.id,
        picked: pickedLetter,
        correct: !!wasCorrect,
        timedOut: !!timedOut,
      };
      return copy;
    });
  }

  /**
   * Handle picking an option; stops the timer and reveals correctness.
   * @param {"A"|"B"|"C"|"D"} letter
   */
  function onPick(letter) {
    if (revealed) return;
    clearInterval(timerRef.current);
    handleReveal(letter, false);
  }

  /** Advance to the next step (keeps current results intact). */
  function goNext() {
    setRevealed(null);
    if (idx < total - 1) setIdx((i) => i + 1);
  }

  /**
   * Submit the scenario:
   * - Sends answer letters to scenarioService.submit().
   * - When on the last level, hints API not to unlock a next level.
   * - Sanitizes any next_level_unlocked against the catalog.
   * - Stores result, refreshes scenario progress, and triggers badge modal.
   */
  async function submit() {
    if (submitting || !scenario) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    try {
      const letters = answers;

      // Frontend guard: if at last level, ask API not to unlock next
      const isAtLastLevel = maxLevelId != null && Number(levelId) === maxLevelId;

      const res = await scenarioService.submit(
        scenario.id,
        letters,
        { suppressUnlock: isAtLastLevel } // harmless if API ignores it
      );

      // Sanitize next_level_unlocked against known catalog
      const lp = res?.level_progress;
      let safeNext = null;
      if (lp?.next_level_unlocked != null) {
        const candidate = Number(lp.next_level_unlocked);
        if (Number.isFinite(candidate) && validLevelIds.has(candidate)) {
          safeNext = candidate;
        }
      }
      const safeRes = {
        ...res,
        level_progress: lp ? { ...lp, next_level_unlocked: safeNext } : lp,
      };

      setResult(safeRes);
      window.scrollTo({ top: 0, behavior: "smooth" });

      if (safeRes.score !== undefined) {
        refreshScenarioProgress({ id: scenario.id, progress: safeRes.score });
      }

      // Badge modal logic (uses sanitized progress)
      const lp2 = safeRes?.level_progress;
      if (lp2?.completed) {
        const levelKey = Number(lp2.level_id);
        const unlockedText = lp2.next_level_unlocked
          ? ` and unlocked Level ${lp2.next_level_unlocked}`
          : "";

        const guardKey = `level_badge_shown_u${user?.id}_l${levelKey}`;
        const alreadyShown = localStorage.getItem(guardKey) === "1";

        if (!alreadyShown) {
          const existingBadge =
            (badges || []).find((b) => Number(b.level_id) === levelKey) || null;

          const badgeToShow = existingBadge || {
            id: `temp-level-${levelKey}`,
            level_id: levelKey,
            name: `Level ${levelKey} Completed!`,
            description: `Great job — you completed all scenarios${unlockedText}.`,
            icon_url: scenario.icon_url || "/assets/trophy.png",
          };

          setLevelBadge(badgeToShow);
          localStorage.setItem(guardKey, "1");

          if (user?.id && typeof createBadge === "function" && !existingBadge) {
            try {
              await createBadge({
                user_id: user.id,
                level_id: levelKey,
                name: `Completed Level ${levelKey}`,
                description: `Completed all scenarios${unlockedText}.`,
                icon_url: "trophy",
              });
            } catch (e) {
              console.error("Failed to persist level badge:", e);
            }
          }
        }
      }
    } catch (e) {
      setError(e?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="scenario-shell">Loading…</div>;
  if (error) return <div className="scenario-shell error-text">{error}</div>;
  if (!scenario) return null;

  const totalSteps = scenario?.steps?.length ?? 0;
  const currentStep = scenario?.steps?.[idx];

  return (
    <div className="scenario-shell">
      {/* Top bar */}
      <header className="scn-topbar">
        <button className="icon-btn" onClick={() => navigate(-1)}>←</button>
        <div className="scn-title">
          <div className="title">{scenario.title}</div>
          <div className="sub">Step {idx + 1} of {totalSteps}</div>
        </div>
        <div />
      </header>

      {/* Hero */}
      <section className="scenario-hero" style={{ marginTop: 8 }}>
        <img
          src={scenario.icon_url || "/assets/fallback.png"}
          alt={scenario.title}
          className="scenario-image"
          style={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 12, backgroundColor: "#f5f5f5" }}
          onError={(e) => { e.currentTarget.src = "/assets/fallback.png"; }}
        />
        {scenario.description && <p className="muted" style={{ marginTop: 8 }}>{scenario.description}</p>}
      </section>

      {/* Progress + dots + timer */}
      <div className="scn-progress-wrap">
        <div className="thin-bar">
          {!revealed && !result && (
            <div className="thin-timer" style={{ width: `${((secsLeft / SECS_PER_STEP) * 100)}%` }} />
          )}
        </div>

        <div className="step-dots">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span key={i} className={i < idx ? "dot done" : i === idx ? "dot current" : "dot"} />
          ))}
        </div>
        {!revealed && !result && <div className="timer">{secsLeft}s</div>}
      </div>

      {/* Result banner */}
      {result && (
        <div className="result-banner">
          <div className="score">{Math.round(result.score)}%</div>

          <div className="desc">
            {result.score === 100 ? (
              <span>🎉 Good job! You aced this scenario!</span>
            ) : result.level_progress?.completed ? (
              <>
                Level {result.level_progress.level_id} complete
                {result.level_progress.next_level_unlocked
                  ? ` • Level ${result.level_progress.next_level_unlocked} unlocked`
                  : ""}
              </>
            ) : (
              "Review and try to improve your score."
            )}
          </div>

          <div className="row">
            <Link className="btn back" to={`/level/${scenario.level_id}`}>
              ← Back to Level
            </Link>

            <button
              className="btn review"
              onClick={() => {
                setResult(null);
                setIdx(0);
                setRevealed(null);
              }}
            >
              Review 🔁
            </button>
          </div>
        </div>
      )}

      {/* Current question flow */}
      {!result && currentStep && (
        <>
          <div className="question-card">{currentStep.q}</div>

          <div className="choice-list">
            {["A", "B", "C", "D"].map((L) => {
              const text = currentStep.options?.[L];
              if (!text) return null;

              const isPicked = answers[idx] === L;
              const isCorrect = revealed?.correctLetter === L;
              const showState = !!revealed;

              return (
                <button
                  key={L}
                  className={
                    "choice" +
                    (isPicked ? " active" : "") +
                    (showState && isCorrect ? " correct" : "") +
                    (showState && isPicked && !isCorrect ? " wrong" : "")
                  }
                  onClick={() => onPick(L)}
                  disabled={!!revealed}
                >
                  <span className="chip">{L}</span>
                  <span className="text">{text}</span>
                </button>
              );
            })}
          </div>

          {/* Reveal footer */}
          {revealed && (
            <div className="reveal-panel">
              {revealed.wasCorrect ? (
                <p className="ok">Correct!</p>
              ) : revealed.timedOut ? (
                <p className="warn">Time’s up. Correct answer: <strong>{revealed.correctLetter}</strong></p>
              ) : (
                <p className="warn">Not quite. Correct answer: <strong>{revealed.correctLetter}</strong></p>
              )}
              {currentStep.feedback && <p className="muted">{currentStep.feedback}</p>}

              <div className="nav-row">
                {idx < totalSteps - 1 ? (
                  <button className="btn flow" onClick={goNext}>Next</button>
                ) : (
                  <button className="btn flow" onClick={submit} disabled={submitting}>
                    {submitting ? "Submitting…" : "Finish Scenario"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Normal nav row (before reveal) */}
          {!revealed && (
            <div className="nav-row">
              {idx < totalSteps - 1 ? (
                <button className="btn flow" onClick={goNext} disabled={answers[idx] == null}>Next</button>
              ) : (
                <button className="btn flow" onClick={submit} disabled={answers.some((a) => a === null) || submitting}>
                  {submitting ? "Submitting…" : "Finish Scenario"}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Level-completion badge modal */}
      {levelBadge && (
        <BadgeEarnedModal
          badge={levelBadge}
          onClose={() => setLevelBadge(null)}
          onGoToLevel={() => {
            setLevelBadge(null);
            navigate(`/level/${levelId}`);
          }}
        />
      )}
    </div>
  );
}
