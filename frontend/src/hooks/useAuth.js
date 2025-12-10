/**
 * Simple useAuth Hook
 * 
 * This hook demonstrates:
 * - Custom React hooks
 * - State management
 * - API integration
 * - Error handling
 */

import { useState, useCallback } from 'react';
import { authService } from '../services/authService';

/**
 * Provides authentication utilities and session persistence for React apps.
 *
 * Handles:
 * - User registration and login via `authService`
 * - Automatic session persistence using `localStorage`
 * - Current user loading and logout handling
 * - State tracking (`loading`, `error`, `token`, and `user`)
 *
 * @returns {object} Authentication state and action handlers
 * @property {object|null} user - Currently authenticated user object
 * @property {string|null} token - JWT access token
 * @property {boolean} loading - Indicates whether an auth request is in progress
 * @property {string|null} error - Error message from the latest failed auth operation
 * @property {boolean} isAuthed - Computed flag indicating whether the user is logged in
 * @property {Function} registerUser - Registers a new user and stores session data
 * @property {Function} login - Logs in a user and persists the session
 * @property {Function} loadMe - Loads the current user from the API using stored token
 * @property {Function} logout - Clears stored session and resets user/token
 * @property {Function} clearError - Resets any error state
 *
 * @example
 * const {
 *   user, token, login, logout, registerUser, loadMe, loading, error, isAuthed
 * } = useAuth();
 *
 * async function handleLogin(credentials) {
 *   try {
 *     await login(credentials);
 *     navigate('/dashboard');
 *   } catch (err) {
 *     console.error(err);
 *   }
 * }
 */
export function useAuth() {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Helper to persist user and token in localStorage.
     * @param {{ token?: string, user?: object }} session
     */
    const storeSession = useCallback(({ token, user }) => {
        if (token) {
            localStorage.setItem('token', token);
            setToken(token);
        }
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
        }
    }, []);

    /**
     * Register a new user via API.
     * Persists token and user on success.
     * @param {object} formData - Registration payload
     * @returns {Promise<object>} Created user object
     * @throws {Error} if registration fails
     */
    const registerUser = useCallback(async (formData) => {
        setLoading(true);
        setError(null);

        try {
            const data = await authService.register(formData); // { token, user }
            storeSession(data);
            return data.user;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [storeSession]);

    /**
     * Log in a user.
     * Persists session to localStorage.
     * @param {{ email: string, password: string }} credentials
     * @returns {Promise<object>} Authenticated user object
     * @throws {Error} if login fails
     */
    const login = useCallback(async (credentials) => {
        setLoading(true);
        setError(null);

        try {
            const data = await authService.login(credentials); // { token, user }
            storeSession(data);
            return data.user;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [storeSession]);

    /**
     * Load the current user using a stored token.
     * If token is invalid, clears the session.
     * @returns {Promise<object|null>} The current user or null if not authenticated
     */
    const loadMe = useCallback(async () => {
        if (!token) return null;
        setLoading(true);
        setError(null);

        try {
            const me = await authService.me(); // user
            localStorage.setItem('user', JSON.stringify(me));
            setUser(me);
            return me;
        } catch (err) {
            // token invalid → clear session
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [token]);

    /**
     * Log out the current user.
     * Clears token and user data from localStorage.
     */
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }, []);

    /** Clear the latest error message (if any). */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        user,
        token,
        loading,
        error,
        registerUser,
        login,
        loadMe,
        logout,
        clearError,
        isAuthed: !!token
    };
}
