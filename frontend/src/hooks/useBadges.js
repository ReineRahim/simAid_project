// src/hooks/useBadges.js
import { useState, useEffect, useCallback } from 'react';
import { badgeService } from '../services/badgeService';

/**
 * Normalize an ID value into a canonical string.
 * Handles numeric, UUID, or string forms consistently.
 *
 * @param {string|number|null|undefined} v - Input ID value
 * @returns {string|null} Normalized identifier or `null`
 */
const normId = (v) => {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) return String(Number(s)); // canonical numeric key (no leading zeros)
  return s.toLowerCase(); // case-insensitive for string/UUID ids
};

/**
 * Resolve a valid image URL for a badge.
 * Ensures fallback and fixes common path typos.
 *
 * @param {string|null|undefined} v - Raw icon path or URL
 * @returns {string} A valid image URL or fallback asset
 */
const resolveIconUrl = (v) => {
  if (!v) return '/assets/fallback.png';
  let s = String(v).trim();
  if (s.startsWith('/assests/')) s = s.replace('/assests/', '/assets/'); // common typo
  if (/^https?:\/\//i.test(s)) return s;
  if (/^data:image\//i.test(s)) return s;
  if (s.startsWith('/')) return s;
  return `/assets/${s.replace(/^assets\//i, '')}`;
};

/**
 * Normalize a badge record into a consistent shape.
 * 
 * @param {object} b - Raw badge data from API
 * @returns {object} Normalized badge object
 */
const normalizeBadge = (b) => {
  const id = normId(b?.id ?? b?.badge_id);
  return {
    id,
    badge_id: id, // optional alias if the UI expects badge_id sometimes
    title: b?.title ?? b?.name ?? 'Badge',
    description: b?.description ?? '',
    icon_url: resolveIconUrl(
      b?.icon_url ?? b?.iconUrl ?? b?.icon ?? b?.image_url ?? b?.image
    ),
    // keep original fields in case some screens rely on them
    ...b,
  };
};

/**
 * Extracts a list of badges from potentially nested API payloads.
 * Supports `data`, `results`, or plain array shapes.
 *
 * @param {object|Array} payload - API response
 * @returns {Array<object>} List of badge records
 */
const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  // nothing usable
  return [];
};

/**
 * Custom React hook for managing badges.
 *
 * Provides badge CRUD operations and local state synchronization
 * with loading/error tracking.
 *
 * @returns {object} Hook API
 * @property {Array<object>} badges - Current list of badges
 * @property {boolean} loading - Whether a badge operation is in progress
 * @property {string|null} error - Last error message, if any
 * @property {Function} fetchBadges - Fetch all badges from the API
 * @property {Function} createBadge - Create a new badge
 * @property {Function} updateBadge - Update an existing badge
 * @property {Function} deleteBadge - Delete a badge
 * @property {Function} clearError - Reset the current error state
 *
 * @example
 * const { badges, loading, error, createBadge } = useBadges();
 *
 * useEffect(() => {
 *   if (!badges.length) fetchBadges();
 * }, [fetchBadges]);
 */
export function useBadges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all badges and normalize results.
   * Updates `badges`, `loading`, and `error`.
   * @returns {Promise<void>}
   */
  const fetchBadges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await badgeService.getAll();
      const list = extractList(raw).map(normalizeBadge);
      console.log('📛 Fetched badges (normalized):', list);
      setBadges(list);
    } catch (err) {
      console.error('❌ Badge fetch error:', err);
      setError(err?.message ?? 'Failed to fetch badges');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new badge and prepend it to the local list.
   * @param {object} badgeData - Badge creation payload
   * @returns {Promise<object>} Created badge
   * @throws {Error} if creation fails
   */
  const createBadge = useCallback(async (badgeData) => {
    setLoading(true);
    setError(null);
    try {
      const created = await badgeService.create(badgeData);
      const nb = normalizeBadge(created);
      setBadges(prev => [nb, ...prev.filter(b => b.id !== nb.id)]);
      return nb;
    } catch (err) {
      setError(err?.message ?? 'Failed to create badge');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing badge and merge it into the local list.
   * @param {string|number} id - Badge identifier
   * @param {object} badgeData - Updated badge fields
   * @returns {Promise<object>} Updated badge
   * @throws {Error} if update fails
   */
  const updateBadge = useCallback(async (id, badgeData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await badgeService.update(id, badgeData);
      const ub = normalizeBadge(updated);
      const matchId = ub.id ?? normId(id);
      setBadges(prev => prev.map(b => (b.id === matchId ? ub : b)));
      return ub;
    } catch (err) {
      setError(err?.message ?? 'Failed to update badge');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a badge by ID and remove it from the local list.
   * @param {string|number} id - Badge identifier
   * @returns {Promise<void>}
   * @throws {Error} if deletion fails
   */
  const deleteBadge = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await badgeService.delete(id);
      const matchId = normId(id);
      setBadges(prev => prev.filter(b => b.id !== matchId));
    } catch (err) {
      setError(err?.message ?? 'Failed to delete badge');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Clear any existing error message. */
  const clearError = useCallback(() => setError(null), []);

  // Load badges on mount
  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  return {
    badges,
    loading,
    error,
    fetchBadges,
    createBadge,
    updateBadge,
    deleteBadge,
    clearError
  };
}
