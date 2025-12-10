// src/hooks/useLevels.js
import { useState, useEffect, useCallback } from 'react';
import { levelService } from '../services/levelService';

/**
 * Normalize a raw level record into a consistent structure.
 *
 * @param {object} raw - Level data from API
 * @returns {object} Normalized level object
 */
function normalizeLevel(raw) {
  const id = Number(raw.id ?? raw.level_id);
  return {
    id,
    title: raw.title ?? `Level ${id}`,
    description: raw.description ?? '',
    order: Number(raw.order ?? raw.difficulty_order ?? id),
    ...raw,
  };
}

/**
 * React hook for managing level data.
 *
 * Handles:
 * - Fetching and normalizing all levels
 * - CRUD operations via `levelService`
 * - Local state management (levels, loading, error)
 *
 * @returns {object} Hook API
 * @property {Array<object>} levels - Current list of levels (sorted ascending by order)
 * @property {boolean} loading - Indicates if an API request is in progress
 * @property {string|null} error - Error message, if any
 * @property {Function} fetchLevels - Fetch all levels and normalize them
 * @property {Function} fetchLevel - Fetch one level by ID and merge into state
 * @property {Function} createLevel - Create a new level
 * @property {Function} updateLevel - Update an existing level
 * @property {Function} deleteLevel - Delete a level
 * @property {Function} clearError - Clear any existing error
 * @property {Function} setLevels - (Optional) Directly override levels array (for local adjustments)
 *
 * @example
 * const { levels, loading, error, fetchLevels } = useLevels();
 *
 * useEffect(() => { fetchLevels(); }, [fetchLevels]);
 */
export function useLevels() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all levels from the API and normalize results.
   * @returns {Promise<void>}
   */
  const fetchLevels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await levelService.getAll();     // expects array
      const normalized = Array.isArray(data) ? data.map(normalizeLevel) : [];
      normalized.sort((a, b) => a.order - b.order);
      setLevels(normalized);
    } catch (err) {
      setError(err.message);
      setLevels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a single level by ID and merge it into local state.
   * @param {number|string} id - Level ID
   * @returns {Promise<object|null>} The fetched level or null
   */
  const fetchLevel = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const raw = await levelService.getById(id);
      const lvl = raw ? normalizeLevel(raw) : null;
      if (lvl) {
        setLevels(prev => {
          const others = prev.filter(x => x.id !== lvl.id);
          return [...others, lvl].sort((a, b) => a.order - b.order);
        });
      }
      return lvl;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new level and prepend it to local state.
   * @param {object} levelData - Level creation payload
   * @returns {Promise<object>} The created level
   * @throws {Error} if creation fails
   */
  const createLevel = useCallback(async (levelData) => {
    setLoading(true);
    setError(null);
    try {
      const created = await levelService.create(levelData);
      const lvl = normalizeLevel(created);
      setLevels(prev => [lvl, ...prev].sort((a, b) => a.order - b.order));
      return lvl;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing level and merge changes into state.
   * @param {number|string} id - Level ID
   * @param {object} levelData - Updated level data
   * @returns {Promise<object>} The updated level
   * @throws {Error} if update fails
   */
  const updateLevel = useCallback(async (id, levelData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await levelService.update(id, levelData);
      const lvl = normalizeLevel(updated);
      setLevels(prev =>
        prev.map(x => (x.id === lvl.id ? lvl : x)).sort((a, b) => a.order - b.order)
      );
      return lvl;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a level by ID and remove it from state.
   * @param {number|string} id - Level ID
   * @returns {Promise<void>}
   * @throws {Error} if deletion fails
   */
  const deleteLevel = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await levelService.delete(id);
      setLevels(prev => prev.filter(x => x.id !== Number(id)));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Clear the current error message. */
  const clearError = useCallback(() => setError(null), []);

  // Fetch levels on mount
  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  return {
    levels,
    loading,
    error,
    fetchLevels,
    fetchLevel,
    createLevel,
    updateLevel,
    deleteLevel,
    clearError,
    setLevels, // optional, handy for local tweaks
  };
}
