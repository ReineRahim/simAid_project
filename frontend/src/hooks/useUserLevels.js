// src/hooks/useUserLevels.js
import { useState, useCallback } from "react";
import { userLevelService } from "../services/userLevelService";

/**
 * React hook for managing user level progress.
 *
 * Handles:
 * - Fetching user levels from the backend
 * - Marking levels as completed or unlocked
 * - Automatically unlocking the next level
 * - CRUD operations for user-level relations
 * - Error and loading state management
 *
 * @returns {object} Hook API
 * @property {Array<object>} userLevels - List of user-level progress objects
 * @property {boolean} loading - Whether an API request is in progress
 * @property {string|null} error - Error message, if any
 * @property {Function} fetchUserLevels - Fetch all user levels for a given user
 * @property {Function} clearError - Clear the current error message
 * @property {Function} markLevelCompleted - Mark a level as completed (and unlocked)
 * @property {Function} unlockLevel - Unlock a level without marking it completed
 * @property {Function} unlockNextLevel - Unlock the next level based on order or ID
 * @property {Function} createUserLevel - (Optional) Create a new user-level record
 * @property {Function} updateUserLevel - (Optional) Update a user-level record
 * @property {Function} deleteUserLevel - (Optional) Delete a user-level record
 *
 * @example
 * const { userLevels, fetchUserLevels, markLevelCompleted, unlockNextLevel } = useUserLevels();
 *
 * useEffect(() => {
 *   fetchUserLevels(currentUser.id);
 * }, [currentUser.id]);
 */
export function useUserLevels() {
  const [userLevels, setUserLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all user-level progress for a given user.
   *
   * @param {number|string} userId - The user's ID
   * @returns {Promise<void>}
   */
  const fetchUserLevels = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userLevelService.getByUserId(userId);
      // Expected fields: user_level_id, user_id, level_id, unlocked, completed
      setUserLevels(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setUserLevels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Clear any existing error message. */
  const clearError = useCallback(() => setError(null), []);

  /**
   * Mark a level as completed (and unlocked) for a user.
   *
   * @param {number|string} userId - The user's ID
   * @param {number|string} levelId - The level's ID
   * @returns {Promise<object|null>} The updated user-level record
   */
  const markLevelCompleted = useCallback(async (userId, levelId) => {
    if (!userId || !levelId) return null;
    const updated = await userLevelService.upsertUserLevel({
      user_id: userId,
      level_id: levelId,
      unlocked: true,
      completed: true,
    });

    setUserLevels((prev) => {
      const lid = Number(levelId);
      const idx = prev.findIndex(
        (x) => Number(x.level_id ?? x.levelId ?? x.id) === lid
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...updated };
        return copy;
      }
      return [updated, ...prev];
    });

    return updated;
  }, []);

  /**
   * Unlock a level for a user without marking it as completed.
   *
   * @param {number|string} userId - The user's ID
   * @param {number|string} levelId - The level's ID
   * @returns {Promise<object|null>} The updated user-level record
   */
  const unlockLevel = useCallback(async (userId, levelId) => {
    if (!userId || !levelId) return null;
    const updated = await userLevelService.upsertUserLevel({
      user_id: userId,
      level_id: levelId,
      unlocked: true,
      completed: false,
    });

    setUserLevels((prev) => {
      const lid = Number(levelId);
      const idx = prev.findIndex(
        (x) => Number(x.level_id ?? x.levelId ?? x.id) === lid
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...updated };
        return copy;
      }
      return [updated, ...prev];
    });

    return updated;
  }, []);

  /**
   * Unlock the next level in sequence after completing the current one.
   *
   * Uses:
   * - `order` field from the catalog if available
   * - Fallback: numeric `levelId + 1`
   *
   * @param {number|string} userId - The user's ID
   * @param {number|string} currentLevelId - The current level's ID
   * @param {Array<object>} [levelsCatalog=[]] - Optional array of level metadata
   * @returns {Promise<void>}
   */
  const unlockNextLevel = useCallback(
    async (userId, currentLevelId, levelsCatalog = []) => {
      if (!userId || !currentLevelId) return;

      let nextId = null;

      // Determine next level ID based on ordering
      if (Array.isArray(levelsCatalog) && levelsCatalog.length > 0) {
        const ordered = [...levelsCatalog].sort(
          (a, b) => Number(a.order ?? a.id) - Number(b.order ?? b.id)
        );
        const idx = ordered.findIndex(
          (l) => Number(l.id ?? l.level_id) === Number(currentLevelId)
        );
        if (idx >= 0 && ordered[idx + 1]) {
          nextId = Number(ordered[idx + 1].id ?? ordered[idx + 1].level_id);
        }
      }

      // Fallback: sequential unlock
      if (!nextId) nextId = Number(currentLevelId) + 1;

      // Skip if already unlocked or completed
      const already = userLevels.some(
        (ul) =>
          Number(ul.level_id ?? ul.levelId ?? ul.id) === nextId &&
          (ul.unlocked === true || ul.completed === true)
      );
      if (already) return;

      await unlockLevel(userId, nextId);
      await fetchUserLevels(userId); // Refresh state
    },
    [unlockLevel, fetchUserLevels, userLevels]
  );

  /**
   * (Optional) Create a new user-level record.
   *
   * @param {object} payload - New user-level data
   * @returns {Promise<object>} The created record
   * @throws {Error} If creation fails
   */
  const createUserLevel = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const created = await userLevelService.create(payload);
      setUserLevels((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * (Optional) Update an existing user-level record.
   *
   * @param {number|string} id - Record ID
   * @param {object} payload - Updated fields
   * @returns {Promise<object>} The updated record
   * @throws {Error} If update fails
   */
  const updateUserLevel = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await userLevelService.update(id, payload);
      setUserLevels((prev) =>
        prev.map((ul) =>
          ul.user_level_id === id || ul.id === id ? updated : ul
        )
      );
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * (Optional) Delete a user-level record.
   *
   * @param {number|string} id - Record ID
   * @returns {Promise<void>}
   * @throws {Error} If deletion fails
   */
  const deleteUserLevel = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await userLevelService.delete(id);
      setUserLevels((prev) =>
        prev.filter((ul) => ul.user_level_id !== id && ul.id !== id)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    userLevels,
    loading,
    error,
    fetchUserLevels,
    clearError,
    // unlocking helpers
    markLevelCompleted,
    unlockLevel,
    unlockNextLevel,
    // optional CRUD methods
    createUserLevel,
    updateUserLevel,
    deleteUserLevel,
  };
}
