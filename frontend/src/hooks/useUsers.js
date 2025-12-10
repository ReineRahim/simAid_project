/**
 * Simple useUsers Hook
 * 
 * This hook demonstrates:
 * - Custom React hooks
 * - State management
 * - API integration
 * - Error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';

/**
 * React hook for managing user data (Admin only).
 *
 * Handles:
 * - Fetching all users from the backend
 * - Creating, updating, and deleting users
 * - Managing loading and error states
 *
 * @returns {object} Hook API
 * @property {Array<object>} users - List of user records
 * @property {boolean} loading - Whether an API call is currently in progress
 * @property {string|null} error - Error message, if any
 * @property {Function} fetchUsers - Fetch all users from the API
 * @property {Function} createUser - Create a new user (admin action)
 * @property {Function} updateUser - Update an existing user
 * @property {Function} deleteUser - Delete a user by ID
 * @property {Function} clearError - Reset the error state
 *
 * @example
 * const { users, fetchUsers, createUser, deleteUser } = useUsers();
 * 
 * useEffect(() => {
 *   fetchUsers();
 * }, []);
 * 
 * async function addUser() {
 *   await createUser({ full_name: 'Jane Doe', email: 'jane@example.com', password: '123456' });
 * }
 */
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all users from the server (admin only).
   *
   * @returns {Promise<void>}
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new user (admin only).
   *
   * @param {object} userData - User data to create
   * @param {string} userData.full_name - The user's full name
   * @param {string} userData.email - The user's email address
   * @param {string} userData.password - The user's password
   * @param {string} [userData.role="user"] - Optional user role
   * @returns {Promise<object>} The created user record
   * @throws {Error} If the operation fails
   */
  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const created = await userService.create(userData);
      setUsers(prev => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing user (admin only).
   *
   * @param {number|string} id - User ID to update
   * @param {object} userData - Updated user data
   * @returns {Promise<object>} The updated user record
   * @throws {Error} If the operation fails
   */
  const updateUser = useCallback(async (id, userData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await userService.update(id, userData);
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a user by ID (admin only).
   *
   * @param {number|string} id - The user's ID
   * @returns {Promise<void>}
   * @throws {Error} If the operation fails
   */
  const deleteUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await userService.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Clear the current error message. */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Automatically load users when the hook mounts
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  };
}
