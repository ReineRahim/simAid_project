// src/services/userLevelService.js

/**
 * UserLevelService
 * -----------------------------------------------------------------------------
 * Provides CRUD and utility operations for managing user-level progress.
 * Tracks which levels a user has unlocked or completed and supports
 * both admin and user-facing endpoints.
 *
 * Features:
 * - Unified request() wrapper for consistent error handling and JSON parsing.
 * - Includes `upsertUserLevel()` to automatically insert or update user-level rows.
 * - Handles both standard REST and query parameter APIs.
 *
 * Notes:
 * - Uses Fetch API.
 * - Returns parsed JSON or `null` for 204 (no-content) responses.
 * - Defaults to localhost if no `REACT_APP_API_URL` environment variable is set.
 */

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const API_BASE_URL = 'http://localhost:4000/api';

class UserLevelService {
  /**
   * Generic HTTP request handler for all service methods.
   *
   * @param {string} url - API endpoint (relative to base).
   * @param {RequestInit} [options={}] - Fetch configuration (method, headers, body, etc.).
   * @returns {Promise<any>} Parsed JSON data or `null` for 204.
   * @throws {Error} Descriptive network or HTTP error.
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
        // Supports both { message } and validator { errors: [{ msg }] } formats
        const firstMsg =
          Array.isArray(errorData.errors) && errorData.errors[0]?.msg;
        throw new Error(
          errorData.message || firstMsg || `HTTP error! status: ${response.status}`
        );
      }

      // Handle DELETE / no-content responses
      if (response.status === 204) return null;

      return await response.json();
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Network error. Please check your connection.");
      }
      throw error;
    }
  }

  // ────────────────────────────── Read Operations ──────────────────────────────

  /**
   * Retrieve all user-level records (admin use).
   * @returns {Promise<Array>} Array of user-level objects.
   */
  getAll() {
    return this.request("/user-levels");
  }

  /**
   * Retrieve a single user-level record by its ID.
   * @param {number|string} id - UserLevel primary key.
   * @returns {Promise<Object>} User-level record.
   */
  getById(id) {
    return this.request(`/user-levels/${id}`);
  }

  /**
   * Retrieve all user-level rows for a specific user.
   * @param {number|string} userId - User ID.
   * @returns {Promise<Array>} Array of level progress records.
   */
  async getByUserId(userId) {
    if (!userId) throw new Error("userId is required");
    // Uses query parameter endpoint
    return this.request(`/user-levels?user_id=${encodeURIComponent(userId)}`);
  }

  /**
   * Retrieve a specific user-level row by (user_id, level_id).
   * @param {number|string} userId
   * @param {number|string} levelId
   * @returns {Promise<Object|null>} Matching row or null if not found.
   */
  async findByUserAndLevel(userId, levelId) {
    if (!userId || !levelId) throw new Error("userId and levelId are required");

    const row = await this.request(
      `/user-levels?user_id=${encodeURIComponent(
        userId
      )}&level_id=${encodeURIComponent(levelId)}`
    );
    return row || null;
  }

  // ────────────────────────────── Write Operations ──────────────────────────────

  /**
   * Create a new user-level record.
   * @param {Object} data - Payload (e.g., { user_id, level_id, unlocked, completed }).
   * @returns {Promise<Object>} Created record.
   */
  create(data) {
    return this.request("/user-levels", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing user-level record by primary key.
   * @param {number|string} id - Record ID.
   * @param {Object} data - Updated fields.
   * @returns {Promise<Object>} Updated record.
   */
  update(id, data) {
    return this.request(`/user-levels/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a user-level record by primary key.
   * @param {number|string} id - Record ID.
   * @returns {Promise<null>} Returns null on success.
   */
  delete(id) {
    return this.request(`/user-levels/${id}`, { method: "DELETE" });
  }

  /**
   * Upsert (insert or update) a user-level record based on (user_id, level_id).
   * Ensures idempotency for user-level progress tracking.
   *
   * Example payload: `{ user_id, level_id, unlocked, completed }`
   *
   * @param {Object} param0
   * @param {number|string} param0.user_id
   * @param {number|string} param0.level_id
   * @param {boolean} [param0.unlocked=false]
   * @param {boolean} [param0.completed=false]
   * @returns {Promise<Object>} Created or updated record.
   */
  async upsertUserLevel({ user_id, level_id, unlocked = false, completed = false }) {
    // 1) Try to find existing row
    const existing = await this.findByUserAndLevel(user_id, level_id);

    if (existing?.user_level_id || existing?.id) {
      // 2) Update existing record
      const pk = existing.user_level_id ?? existing.id;
      return this.update(pk, { unlocked: !!unlocked, completed: !!completed });
    }

    // 3) Create new record
    return this.create({
      user_id,
      level_id,
      unlocked: !!unlocked,
      completed: !!completed,
    });
  }
}

// Export singleton instance
export const userLevelService = new UserLevelService();
