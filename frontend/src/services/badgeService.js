// src/services/badgeService.js

/**
 * BadgeService
 * -----------------------------------------------------------------------------
 * Provides CRUD operations for badge resources in the backend API.
 *
 * Features:
 * - Centralized `request()` wrapper for error-handled fetch calls.
 * - Supports create, read, update, delete, and list endpoints.
 * - Automatically parses JSON and provides network error feedback.
 *
 * Notes:
 * - Uses the browser Fetch API with async/await.
 * - Defaults to localhost if no `REACT_APP_API_URL` environment variable is set.
 */

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const API_BASE_URL = 'http://localhost:4000/api';

class BadgeService {
  /**
   * Unified HTTP request helper.
   *
   * @param {string} url - Request path (relative to API base).
   * @param {RequestInit} [options={}] - Fetch configuration (method, headers, body, etc.).
   * @returns {Promise<any>} Parsed JSON data or `null` for 204 (no content) responses.
   * @throws {Error} Throws descriptive network or HTTP errors.
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
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Handle empty 204 responses (e.g., after DELETE)
      if (response.status === 204) return null;

      return await response.json();
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Network error. Please check your connection.");
      }
      throw error;
    }
  }

  /**
   * Fetch all badges.
   * @returns {Promise<Array>} List of badge objects.
   */
  async getAll() {
    return this.request("/badges");
  }

  /**
   * Retrieve a specific badge by its ID.
   * @param {number|string} id - Badge ID.
   * @returns {Promise<Object>} Badge record.
   */
  async getById(id) {
    return this.request(`/badges/${id}`);
  }

  /**
   * Create a new badge record.
   * @param {Object} badgeData - Badge details (e.g. { name, description, icon_url }).
   * @returns {Promise<Object>} Created badge.
   */
  async create(badgeData) {
    return this.request("/badges", {
      method: "POST",
      body: JSON.stringify(badgeData),
    });
  }

  /**
   * Update an existing badge.
   * @param {number|string} id - Badge ID.
   * @param {Object} badgeData - Updated badge fields.
   * @returns {Promise<Object>} Updated badge record.
   */
  async update(id, badgeData) {
    return this.request(`/badges/${id}`, {
      method: "PUT",
      body: JSON.stringify(badgeData),
    });
  }

  /**
   * Delete a badge by ID.
   * @param {number|string} id - Badge ID.
   * @returns {Promise<null>} Returns null on success.
   */
  async delete(id) {
    return this.request(`/badges/${id}`, {
      method: "DELETE",
    });
  }
}

// Export singleton instance
export const badgeService = new BadgeService();
