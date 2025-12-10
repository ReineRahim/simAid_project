// src/services/userService.js

/**
 * UserService
 * -----------------------------------------------------------------------------
 * Handles user management and authentication API requests.
 * Supports both public (register/login) and admin-protected CRUD endpoints.
 *
 * Features:
 * - Centralized request() wrapper with consistent JSON parsing and error handling.
 * - Automatically attaches Authorization headers for protected endpoints.
 * - Handles express-validator style error payloads gracefully.
 *
 * Notes:
 * - Uses Fetch API.
 * - Returns parsed JSON data or `null` for 204 (no-content) responses.
 * - Defaults to localhost if no `REACT_APP_API_URL` environment variable is set.
 */

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const API_BASE_URL = 'http://localhost:4000/api';

class UserService {
  /**
   * Generic HTTP request helper.
   *
   * @param {string} url - API endpoint (relative to base URL).
   * @param {RequestInit} [options={}] - Fetch configuration (method, headers, body, etc.)
   * @returns {Promise<any>} Parsed JSON or `null` for 204 responses.
   * @throws {Error} Network or HTTP-level error with descriptive message.
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
        const errorData = await response.json().catch(() => ({}));
        const firstMsg =
          Array.isArray(errorData.errors) && errorData.errors[0]?.msg;
        throw new Error(
          errorData.message || firstMsg || `HTTP error! status: ${response.status}`
        );
      }

      // Handle DELETE / no-content
      if (response.status === 204) return null;

      return await response.json();
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Network error. Please check your connection.");
      }
      throw error;
    }
  }

  // ──────────────────────────────── Public Endpoints ────────────────────────────────

  /**
   * Register a new user.
   * @param {Object} data - User registration payload.
   * @returns {Promise<Object>} Created user record.
   */
  async register(data) {
    return this.request("/users/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Authenticate a user and return credentials.
   * @param {{ email: string, password: string }} param0
   * @returns {Promise<{ user: Object, token: string }>} Login response.
   */
  async login({ email, password }) {
    return this.request("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // ──────────────────────────────── Authenticated (Admin) Endpoints ────────────────────────────────

  /**
   * Build authorization headers for authenticated requests.
   * @private
   * @returns {Object} Authorization header object if token exists.
   */
  _authHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Retrieve all users (admin access required).
   * @returns {Promise<Array>} List of all user records.
   */
  async getAll() {
    return this.request("/users", { headers: this._authHeaders() });
  }

  /**
   * Retrieve a specific user by ID (admin access required).
   * @param {number|string} id - User ID.
   * @returns {Promise<Object>} User record.
   */
  async getById(id) {
    return this.request(`/users/${id}`, { headers: this._authHeaders() });
  }

  /**
   * Create a new user (admin access required).
   * @param {Object} data - User payload.
   * @returns {Promise<Object>} Created user record.
   */
  async create(data) {
    return this.request("/users", {
      method: "POST",
      headers: this._authHeaders(),
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing user (admin access required).
   * @param {number|string} id - User ID.
   * @param {Object} data - Updated user fields.
   * @returns {Promise<Object>} Updated user record.
   */
  async update(id, data) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      headers: this._authHeaders(),
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a user (admin access required).
   * @param {number|string} id - User ID.
   * @returns {Promise<null>} Returns null on success.
   */
  async delete(id) {
    return this.request(`/users/${id}`, {
      method: "DELETE",
      headers: this._authHeaders(),
    });
  }
}

// Export singleton instance
export const userService = new UserService();
