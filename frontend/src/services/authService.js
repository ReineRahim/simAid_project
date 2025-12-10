// src/services/authService.js

/**
 * AuthService
 * -----------------------------------------------------------------------------
 * Handles user authentication and account-related API calls:
 *  - Registering new users
 *  - Logging in existing users
 *  - Fetching the current authenticated user (via token)
 *
 * Notes:
 * - All requests go through a unified request() wrapper with consistent error handling.
 * - Automatically parses Express-style validation errors (from express-validator).
 * - Uses the browser's Fetch API.
 * - Defaults to localhost unless REACT_APP_API_URL is configured.
 */

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const API_BASE_URL = 'http://localhost:4000/api';

class AuthService {
  /**
   * Unified HTTP request helper.
   *
   * @param {string} url - API endpoint (relative to base).
   * @param {RequestInit} [options={}] - Fetch configuration (method, headers, body, etc.)
   * @returns {Promise<any>} Parsed JSON data or `null` for 204 responses.
   * @throws {Error} Network or HTTP error (with parsed message where available).
   */
  async request(url, options = {}) {
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, config);

      if (!response.ok) {
        // Attempt to parse common error payloads
        const errorData = await response.json().catch(() => ({}));
        const firstValidatorMsg =
          Array.isArray(errorData.errors) && errorData.errors[0]?.msg;
        const msg =
          errorData.message ||
          firstValidatorMsg ||
          `HTTP error! status: ${response.status}`;
        throw new Error(msg);
      }

      // Handle empty (204) responses
      if (response.status === 204) return null;

      return await response.json();
    } catch (error) {
      // Detect network-level failures
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Network error. Please check your connection.");
      }
      throw error;
    }
  }

  /**
   * Register a new user.
   * Expected response: `{ token, user }`
   *
   * @param {Object} payload - Registration data (e.g. { name, email, password })
   * @returns {Promise<{ token: string, user: Object }>}
   */
  async register(payload) {
    return this.request("/users/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * Log in an existing user.
   * Expected response: `{ token, user }`
   *
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ token: string, user: Object }>}
   */
  async login({ email, password }) {
    return this.request("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Get the currently authenticated user.
   * Requires a valid JWT stored in localStorage as `token`.
   *
   * @returns {Promise<Object>} Authenticated user data.
   */
  async me() {
    const token = localStorage.getItem("token");
    return this.request("/auth/me", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
