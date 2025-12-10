/**
 * Simple useAttempts Hook
 * 
 * This hook demonstrates:
 * - Custom React hooks
 * - State management
 * - API integration
 * - Error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { attemptService } from '../services/attemptService';

/**
 * Manage scenario attempt data and stats with convenient fetch/update helpers.
 *
 * Exposes loading and error states, the currently focused attempt,
 * aggregate stats (perfect/total), and several async actions that
 * call the underlying `attemptService`.
 *
 * Returned API:
 * - `attempts` {Array} — cached list of attempts
 * - `currentAttempt` {object|null} — last fetched/updated attempt
 * - `stats` {{perfect:number,total:number}} — aggregate counts
 * - `loading` {boolean} — network activity flag
 * - `error` {string|null} — last error message
 * - actions:
 *   - `fetchAttempts()` → Promise<void>
 *   - `fetchAttempt(id)` → Promise<object|null>
 *   - `fetchUserAttempt(userId, scenarioId)` → Promise<object|null>
 *   - `saveBestScore(payload)` → Promise<object>
 *   - `countPerfectByUserInLevel(userId, levelId)` → Promise<number>
 *   - `countScenariosInLevel(levelId)` → Promise<number>
 *   - `refreshCounts(userId, levelId)` → Promise<[number, number]>
 *   - `clearError()` → void
 *   - `fetchAttemptsByUserAndLevel(userId, levelId)` → Promise<void>
 *
 * @returns {object} Hook state and action methods.
 */
export function useAttempts() {
    const [attempts, setAttempts] = useState([]);
    const [currentAttempt, setCurrentAttempt] = useState(null);
    const [stats, setStats] = useState({ perfect: 0, total: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch all attempts.
     * Updates `attempts`, `loading`, and `error`.
     * @returns {Promise<void>}
     */
    const fetchAttempts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await attemptService.getAll();
            setAttempts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Fetch a single attempt by id.
     * Synchronizes it into the local attempts cache.
     * @param {number|string} id
     * @returns {Promise<object|null>}
     * @throws rethrows underlying error after setting `error`.
     */
    const fetchAttempt = useCallback(async (id) => {
        setLoading(true);
        setError(null);

        try {
            const attempt = await attemptService.getById(id);
            setCurrentAttempt(attempt);
            // keep local list in sync if present
            if (attempt?.id) {
                setAttempts(prev => {
                    const exists = prev.some(a => a.id === attempt.id);
                    return exists ? prev.map(a => a.id === attempt.id ? attempt : a) : [attempt, ...prev];
                });
            }
            return attempt;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Fetch an attempt by (userId, scenarioId).
     * Synchronizes it into the local attempts cache.
     * @param {number|string} userId
     * @param {number|string} scenarioId
     * @returns {Promise<object|null>}
     * @throws rethrows underlying error after setting `error`.
     */
    const fetchUserAttempt = useCallback(async (userId, scenarioId) => {
        setLoading(true);
        setError(null);

        try {
            const attempt = await attemptService.getByUserAndScenario(userId, scenarioId);
            setCurrentAttempt(attempt);
            if (attempt?.id) {
                setAttempts(prev => {
                    const exists = prev.some(a => a.id === attempt.id);
                    return exists ? prev.map(a => a.id === attempt.id ? attempt : a) : [attempt, ...prev];
                });
            }
            return attempt;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Upsert the best score for a user/scenario and sync cache.
     * @param {{user_id:number, scenario_id:number, score:number}} payload
     * @returns {Promise<object>}
     * @throws rethrows underlying error after setting `error`.
     */
    const saveBestScore = useCallback(async (payload) => {
        setLoading(true);
        setError(null);

        try {
            const saved = await attemptService.saveBestScore(payload);
            setCurrentAttempt(saved);
            setAttempts(prev => {
                const exists = prev.some(a => a.id === saved.id);
                return exists ? prev.map(a => a.id === saved.id ? saved : a) : [saved, ...prev];
            });
            return saved;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Count perfect (100%) attempts for a user in a given level.
     * Updates `stats.perfect`.
     * @param {number|string} userId
     * @param {number|string} levelId
     * @returns {Promise<number>}
     * @throws rethrows underlying error after setting `error`.
     */
    const countPerfectByUserInLevel = useCallback(async (userId, levelId) => {
        setLoading(true);
        setError(null);

        try {
            const count = await attemptService.countPerfectByUserInLevel(userId, levelId);
            setStats(prev => ({ ...prev, perfect: Number(count) || 0 }));
            return count;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Count total scenarios in a level.
     * Updates `stats.total`.
     * @param {number|string} levelId
     * @returns {Promise<number>}
     * @throws rethrows underlying error after setting `error`.
     */
    const countScenariosInLevel = useCallback(async (levelId) => {
        setLoading(true);
        setError(null);

        try {
            const count = await attemptService.countScenariosInLevel(levelId);
            setStats(prev => ({ ...prev, total: Number(count) || 0 }));
            return count;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Fetch attempts by user and level, and replace the local list.
     * @param {number|string} userId
     * @param {number|string} levelId
     * @returns {Promise<void>}
     */
    const fetchAttemptsByUserAndLevel = useCallback(async (userId, levelId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await attemptService.getByUserAndLevel(userId, levelId);
        setAttempts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, []);

    /**
     * Convenience helper to refresh both perfect & total counts together.
     * @param {number|string} userId
     * @param {number|string} levelId
     * @returns {Promise<[number, number]>} Resolves when both counts finish.
     */
    const refreshCounts = useCallback(async (userId, levelId) => {
        await Promise.all([
            countPerfectByUserInLevel(userId, levelId),
            countScenariosInLevel(levelId)
        ]);
    }, [countPerfectByUserInLevel, countScenariosInLevel]);

    /** Clear the last error message (if any). */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Load attempts on mount
    useEffect(() => {
        fetchAttempts();
    }, [fetchAttempts]);

    return {
        attempts,
        currentAttempt,
        stats,
        loading,
        error,
        fetchAttempts,
        fetchAttempt,
        fetchUserAttempt,
        saveBestScore,
        countPerfectByUserInLevel,
        countScenariosInLevel,
        refreshCounts,
        clearError,
        fetchAttemptsByUserAndLevel
    };
}
