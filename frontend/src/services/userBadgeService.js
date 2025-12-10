// src/services/userBadgeService.js

/**
 * UserBadgeService
 * -----------------------------------------------------------------------------
 * Provides CRUD and query operations for managing user_badges relations.
 * Handles linking badges to users, fetching user badges, and updating/deleting entries.
 *
 * Features:
 * - Unified request() wrapper for JSON parsing and error handling.
 * - Supports both RESTful and fallback query-based endpoints.
 * - Handles express-validator style errors gracefully.
 *
 * Notes:
 * - Uses Fetch API.
 * - Returns parsed JSON data or `null` for 204 (no-content) responses.
 * - Defaults to localhost if no `REACT_APP_API_URL` environment variable is set.
 */

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const API_BASE_URL = 'http://localhost:4000/api';

class UserBadgeService {
  /**
   * Generic HTTP request handler.
   *
   * @param {string} url - Request path (relative to API base).
   * @param {RequestInit} [options={}] - Fetch configuration (method, headers, body, etc.)
   * @returns {Promise<any>} Parsed JSON or `null` for 204 responses.
   * @throws {Error} On network or HTTP errors.
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
        // express-validator typically returns { errors: [{ msg }] }
        const firstMsg =
          Array.isArray(errorData.errors) && errorData.errors[0]?.msg;
        throw new Error(
          errorData.message || firstMsg || `HTTP error! status: ${response.status}`
        );
      }

      // Handle 204 (DELETE / no-content)
      if (response.status === 204) return null;

      return await response.json();
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Network error. Please check your connection.");
      }
      throw error;
    }
  }

  // ────────────────────────────── Standard Endpoints ──────────────────────────────

  /**
   * Retrieve all user-badge associations.
   * @returns {Promise<Array>} Array of user_badge objects.
   */
  async getAll() {
    return this.request("/user-badges");
  }

  /**
   * Retrieve a user badge record by its ID.
   * @param {number|string} id - UserBadge ID.
   * @returns {Promise<Object>} UserBadge record.
   */
  async getById(id) {
    return this.request(`/user-badges/${id}`);
  }

  /**
   * Create a new user-badge link.
   * Example body: `{ user_id, badge_id, earned_at }`
   *
   * @param {Object} data - UserBadge payload.
   * @returns {Promise<Object>} Created record.
   */
  async create(data) {
    return this.request("/user-badges", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing user-badge record.
   * @param {number|string} id - Record ID.
   * @param {Object} data - Updated fields.
   * @returns {Promise<Object>} Updated record.
   */
  async update(id, data) {
    return this.request(`/user-badges/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a user-badge record by its ID.
   * @param {number|string} id - Record ID.
   * @returns {Promise<null>} Null on success.
   */
  async delete(id) {
    return this.request(`/user-badges/${id}`, {
      method: "DELETE",
    });
  }

  // ────────────────────────────── Extended Methods ──────────────────────────────

  /**
   * Get all badges for a specific user.
   * Tries `/users/:id/badges` first, falls back to query param endpoint.
   *
   * @param {number|string} userId - User ID.
   * @returns {Promise<Array>} Array of badge records linked to the user.
   */
  async getByUserId(userId) {
    if (!userId) throw new Error("userId is required");

    try {
      // Prefer RESTful route
      return await this.request(`/users/${userId}/badges`);
    } catch (err) {
      // Fallback for APIs that use query param format
      if (/HTTP 404|Not Found/i.test(err.message)) {
        return this.request(`/user-badges?user_id=${encodeURIComponent(userId)}`);
      }
      throw err;
    }
  }

  /**
   * Placeholder method for ORM-backed repository systems.
   * Not used in REST mode, but demonstrates local ORM-style querying.
   * (May be removed or replaced with actual backend integration.)
   *
   * @param {number|string} userId - User ID.
   * @returns {Promise<any>} Result of ORM query.
   */
  async listUserBadgesByUserId(userId) {
    return this.repo.findAll({ where: { user_id: userId } }); // adjust for ORM
  }
}

// Export singleton instance
export const userBadgeService = new UserBadgeService();
