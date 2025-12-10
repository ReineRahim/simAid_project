// src/pages/ProfilePage.jsx

/**
 * ProfilePage
 * -----------------------------------------------------------------------------
 * Shows the signed-in user's profile with:
 * - Account info (name, email, joined date)
 * - Overall level progress (computed from user-levels)
 * - Badge collection (locked vs unlocked)
 * - Certificate download when all 6 levels are completed
 *
 * Data sources
 * - useAuth(): user identity, loadMe(), logout()
 * - useBadges(): catalog of all badges
 * - useLevels(): catalog of all levels
 * - useUserBadges(): user_badges rows (per-user badge unlocks)
 * - useUserLevels(): user-level completion/unlock states
 *
 * Behavior
 * - Fetch sequencing runs once per user session (guarded by ref).
 * - Icon URLs are normalized and made robust via resolveIconUrl().
 * - Level progress = completedLevels / totalLevels (percentage).
 * - Certificate is shown only when totalLevels === 6 AND completedLevels === 6.
 */

import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useBadges } from "../hooks/useBadges";
import { useUserBadges } from "../hooks/useUserBadges";
import { useUserLevels } from "../hooks/useUserLevels";
import { useLevels } from "../hooks/useLevels";
import "../styles/profile.css";

export default function ProfilePage() {
  const navigate = useNavigate();

  // Auth
  const { user, loadMe, loading: meLoading, logout } = useAuth();

  // Catalog data
  const { badges = [], loading: badgesLoading, fetchBadges } = useBadges();
  const { levels = [], loading: levelsAllLoading, fetchLevels } = useLevels();

  // User-scoped data
  const {
    userBadges = [], // rows from user_badges table
    loading: userBadgesLoading,
    fetchUserBadges,
  } = useUserBadges();

  const {
    userLevels = [],
    loading: levelsLoading,
    fetchUserLevels,
  } = useUserLevels();

  // ---------- Utilities ----------

  /**
   * Safely coerce a value to Number; returns null if not finite.
   * @param {any} v
   * @returns {number|null}
   */
  const normNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  /**
   * Normalize truthy representations often found in DB rows (1/"1"/"true"/true).
   * @param {any} v
   * @returns {boolean}
   */
  const toBool = (v) => v === true || v === 1 || v === "1" || v === "true";

  /**
   * Resolve an icon reference (URL, data URI, root path, or filename) into a
   * safe usable image src; includes guard for "/assests" typo and a fallback.
   * @param {string} v
   * @returns {string}
   */
  const resolveIconUrl = (v) => {
    if (!v) return "/assets/fallback.png";
    let s = String(v).trim();
    if (s.startsWith("/assests/")) s = s.replace("/assests/", "/assets/");
    if (/^https?:\/\//i.test(s)) return s;
    if (/^data:image\//i.test(s)) return s;
    if (s.startsWith("/")) return s;
    return `/assets/${s.replace(/^assets\//i, "")}`;
  };

  // ---------- Fetch sequencing ----------
  const fetchedOnce = useRef(false);
  useEffect(() => {
    if (!user?.id) {
      loadMe?.();
      return;
    }
    if (fetchedOnce.current) return;
    fetchBadges?.();
    fetchLevels?.();
    fetchUserBadges?.(user.id);
    fetchUserLevels?.(user.id);
    fetchedOnce.current = true;
  }, [user?.id, loadMe, fetchBadges, fetchLevels, fetchUserBadges, fetchUserLevels]);

  // ---------- Display header fields ----------
  const displayName = user?.full_name || user?.name || "First Aid Learner";
  const displayEmail = user?.email || "";
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "Unknown";

  // ---------- BADGES (use userBadges table directly) ----------
  const latestUserBadgeById = useMemo(() => {
    const map = new Map();
    const currentUserId = String(user?.id ?? "");

    for (const ub of userBadges ?? []) {
      if (String(ub.user_id) !== currentUserId) continue;
      const badgeId = normNum(ub.badge_id);
      if (badgeId == null) continue;

      const t = ub.earned_at ? new Date(ub.earned_at).getTime() : 0;
      const existing = map.get(badgeId);
      if (!existing || t > existing.earnedAtMs) {
        map.set(badgeId, { earnedAtMs: t, row: ub });
      }
    }
    return map; // badge_id → latest record for user
  }, [userBadges, user?.id]);

  const unlockedBadgeIds = useMemo(
    () => new Set([...latestUserBadgeById.keys()]),
    [latestUserBadgeById]
  );

  const displayBadges = useMemo(() => {
    const list = (badges ?? []).map((b) => {
      const id = normNum(b.id ?? b.badge_id);
      const title = b.title || b.name || "Badge";
      const description = b.description || "";
      const iconSrc = resolveIconUrl(
        b.icon_url ?? b.icon ?? b.iconUrl ?? b.image ?? b.image_url ?? ""
      );
      const unlocked = id != null && unlockedBadgeIds.has(id);
      return { id, title, description, iconSrc, unlocked };
    });

    list.sort(
      (a, b) =>
        Number(b.unlocked) - Number(a.unlocked) || a.title.localeCompare(b.title)
    );
    return list;
  }, [badges, unlockedBadgeIds]);

  const unlockedCount = useMemo(
    () => displayBadges.filter((b) => b.unlocked).length,
    [displayBadges]
  );

  // ---------- LEVELS ----------
  const orderedLevels = useMemo(() => {
    let arr = (levels ?? [])
      .map((lvl) => ({
        id: normNum(lvl.level_id ?? lvl.id),
        title: lvl.title || `Level ${lvl.level_id ?? lvl.id}`,
        order: normNum(lvl.order ?? lvl.sort_order) ?? null,
      }))
      .filter((x) => x.id != null);

    // Fallback: infer level list from userLevels if catalog is empty
    if (!arr.length && userLevels?.length) {
      const ids = Array.from(
        new Set(userLevels.map((ul) => normNum(ul.level_id ?? ul.id)))
      ).filter(Boolean);
      arr = ids.map((id) => ({ id, title: `Level ${id}`, order: id }));
    }

    arr.sort((a, b) => {
      const ao = a.order ?? a.id;
      const bo = b.order ?? b.id;
      return ao - bo;
    });

    return arr;
  }, [levels, userLevels]);

  const userLevelStateById = useMemo(() => {
    const map = new Map();
    for (const ul of userLevels ?? []) {
      const lid = normNum(ul.level_id ?? ul.id);
      if (lid == null) continue;
      map.set(lid, { completed: toBool(ul.completed), unlocked: toBool(ul.unlocked) });
    }
    return map;
  }, [userLevels]);

  const completedLevelIds = useMemo(() => {
    const set = new Set();
    for (const lvl of orderedLevels) {
      if (userLevelStateById.get(lvl.id)?.completed) set.add(lvl.id);
    }
    return set;
  }, [orderedLevels, userLevelStateById]);

  const currentLevelMeta = useMemo(() => {
    const ids = orderedLevels.map((l) => l.id);
    const completed = Array.from(completedLevelIds);
    if (completed.length) {
      const next = ids.find((id) => id > Math.max(...completed));
      const nextMeta = orderedLevels.find((l) => l.id === (next ?? completed.at(-1)));
      return { id: nextMeta?.id ?? 1, title: nextMeta?.title ?? `Level ${nextMeta?.id ?? 1}` };
    }
    const first = orderedLevels[0];
    return { id: first?.id ?? 1, title: first?.title ?? "Level 1" };
  }, [orderedLevels, completedLevelIds]);

  const totalLevels = orderedLevels.length || 1;
  const completedLevels = completedLevelIds.size;
  const levelProgress = Math.round((completedLevels / totalLevels) * 100);

  const loading =
    meLoading || badgesLoading || userBadgesLoading || levelsLoading || levelsAllLoading;

  // Condition for certificate: exactly 6 levels and all completed
  const showCertificate = totalLevels === 6 && completedLevels === 6;

  // ---------- Render ----------
  return (
    <div className="profile-page">
      <header className="profile-topbar">
        <button className="btn small ghost" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Your Profile</h1>
        <button
          className="btn small danger"
          onClick={async () => {
            try { await logout?.(); } finally { navigate("/login"); }
          }}
        >
          Log Out
        </button>
      </header>

      {/* Profile header */}
      <section className="profile-header-card">
        <div className="profile-avatar">
          <div className="avatar-icon">🧑‍⚕️</div>
          <div className="profile-info">
            <h2>{displayName}</h2>
            <p className="muted">
              {displayEmail && <span>{displayEmail}</span>}
            </p>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="progress-bar-container">
          <span className="progress-label">Level Progress</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${levelProgress}%` }} />
          </div>
          <span className="progress-text">
            {completedLevels} / {totalLevels} levels
          </span>
        </div>
      </section>

      {/* Stats */}
      <section className="profile-stats-row">
        <div className="stat-box yellow">
          <div className="stat-icon">🏅</div>
          <div className="stat-value">{unlockedCount}</div>
          <div className="stat-label">Badges Earned</div>
        </div>

        <div className="stat-box red">
          <div className="stat-icon">🎮</div>
          <div className="stat-value">{currentLevelMeta.id}</div>
          <div className="stat-label">
            Current Level — {currentLevelMeta.title}
          </div>
        </div>

        <div className="stat-box green">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{joinedDate}</div>
          <div className="stat-label">Joined</div>
        </div>
      </section>

      {/* Badges */}
      <section className="badges-section">
        <h3>Your Badges 🥇</h3>

        {loading ? (
          <p className="subtle-status">Loading profile…</p>
        ) : displayBadges.length > 0 ? (
          <div className="badges-grid">
            {displayBadges.map((b) => (
              <div
                key={b.id}
                className={`badge-card ${b.unlocked ? "unlocked" : "locked"}`}
                title={b.unlocked ? "Unlocked" : "Locked"}
              >
                <div className="badge-icon">
                  {b.unlocked ? (
                    <img
                      src={b.iconSrc}
                      alt={`${b.title} badge`}
                      loading="lazy"
                      onError={(e) => (e.currentTarget.src = "/assets/fallback.png")}
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8 }}
                    />
                  ) : (
                    "🔒"
                  )}
                </div>
                <p>{b.title}</p>
                <p>{b.description}</p>
                <span className={`chip ${b.unlocked ? "ok" : "muted"}`}>
                  {b.unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-badges">
            <div className="no-badges-icon">🎯</div>
            <p>No badges yet. Complete levels to earn your first badge!</p>
          </div>
        )}
      </section>

      {/* Certificate (only when 6/6 levels completed) */}
      {showCertificate && (
        <section className="certificate-section">
          <h3>🎉 Certificate of Completion</h3>

          <div className="certificate-card">
            <img
              src="/assets/certificate.png"
              alt="Completion Certificate"
              className="certificate-image"
              loading="lazy"
              onError={(e) => (e.currentTarget.src = "/assets/fallback.png")}
            />
          </div>

          {/* Download link button */}
          <a
            className="btn primary"
            href="/assets/certificate.png"
            download={`certificate-${(displayName || "learner")
              .replace(/\s+/g, "-")
              .toLowerCase()}.png`}
          >
            ⬇️ Download Certificate
          </a>
        </section>
      )}
    </div>
  );
}
