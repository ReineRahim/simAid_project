import { useState, useCallback } from 'react';
import { userService } from '../services/userService'; // ✅ add this

/**
 * Custom React hook for handling user registration.
 *
 * Handles:
 * - Submitting signup data to the API
 * - Managing loading and error states
 * - Exposing a clean API for UI components
 *
 * @returns {object} Hook API
 * @property {boolean} loading - Indicates if the signup process is in progress
 * @property {string} error - Error message from the signup process, if any
 * @property {Function} signup - Function to create a new user account
 * @property {Function} clearError - Function to reset the error state
 *
 * @example
 * const { loading, error, signup } = useSignUp();
 *
 * async function handleSubmit(formData) {
 *   try {
 *     await signup(formData);
 *     alert('Account created successfully!');
 *   } catch (err) {
 *     console.error('Signup failed:', err);
 *   }
 * }
 */
export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Register a new user.
   *
   * @param {object} data - Registration form data
   * @param {string} data.full_name - User's full name
   * @param {string} data.email - User's email address
   * @param {string} data.password - User's password
   * @returns {Promise<object>} The newly created user data
   * @throws {Error} If registration fails
   */
  const signup = useCallback(async (data) => {
    setLoading(true);
    setError('');
    try {
      const result = await userService.register(data); // ✅ now defined
      return result;
    } catch (e) {
      setError(e.message || 'Sign up failed.');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Clear any existing error message. */
  const clearError = () => setError('');

  return { loading, error, signup, clearError };
}
