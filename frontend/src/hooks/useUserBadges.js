/**
 * Simple useUserBadges Hook
 * 
 * This hook demonstrates:
 * - Custom React hooks
 * - State management
 * - API integration
 * - Error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { userBadgeService } from '../services/userBadgeService';

/**
 * React hook for managing user badges.
 *
 * Handles:
 * - Fetching badges for a specific user
 * - Creating, updating, and deleting user badges
 * - Local caching of badge state
 * - Loading and error handling
 *
 * @returns {object} Hook API
 * @property {Array<object>} userBadges - List of badges earned by the user
 * @property {boolean} loading - Indicates if a badge operation is in progress
 * @property {string|null} error - Error message if a request fails
 * @property {Function} fetchUserBadges - Fetch all badges for a user by their ID
 * @property {Function} createUserBadge - Add a new user badge record
 * @property {Function} updateUserBadge - Update an existing user badge record
 * @property {Function} deleteUserBadge - Delete a user badge record
 * @property {Function} clearError - Reset the error state
 *
 * @example
 * const { userBadges, fetchUserBadges, createUserBadge } = useUserBadges();
 * 
 * useEffect(() => {
 *   fetchUserBadges(currentUser.id);
 * }, [currentUser.id]);
 */
export function useUserBadges() {
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all user badges for a given user.
   *
   * @param {number|string} userId - The user's ID
   * @returns {Promise<void>}
   */
  const fetchUserBadges = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userBadgeService.getByUserId(userId);
      setUserBadges(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setUserBadges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new user badge and add it to the local list.
   *
   * @param {object} badgeData - The data for the new user badge
   * @returns {Promise<object>} The created user badge
   * @throws {Error} If the operation fails
   */
  const createUserBadge = useCallback(async (badgeData) => {
    setLoading(true);
    setError(null);
    try {
      const created = await userBadgeService.create(badgeData);
      setUserBadges(prev => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing user badge record.
   *
   * @param {number|string} id - The badge record ID
   * @param {object} badgeData - Updated badge fields
   * @returns {Promise<object>} The updated badge record
   * @throws {Error} If the operation fails
   */
  const updateUserBadge = useCallback(async (id, badgeData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await userBadgeService.update(id, badgeData);
      setUserBadges(prev => prev.map(ub => ub.id === id ? updated : ub));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a user badge and remove it from local state.
   *
   * @param {number|string} id - The badge record ID
   * @returns {Promise<void>}
   * @throws {Error} If deletion fails
   */
  const deleteUserBadge = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await userBadgeService.delete(id);
      setUserBadges(prev => prev.filter(ub => ub.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Clear any existing error message. */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch badges on mount (if desired, may require user ID context)
  useEffect(() => {
    fetchUserBadges();
  }, [fetchUserBadges]);

  return {
    userBadges,
    loading,
    error,
    fetchUserBadges,
    createUserBadge,
    updateUserBadge,
    deleteUserBadge,
    clearError
  };
}
