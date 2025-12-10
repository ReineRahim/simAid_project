// src/services/levelService.js

/**
 * LevelService
 * -----------------------------------------------------------------------------
 * Provides CRUD operations for managing level data via the backend API.
 *
 * Features:
 * - Common request() wrapper for all HTTP calls.
 * - Handles create, read, update, delete, and list operations.
 * - Automatic JSON parsing and consistent error handling.
 *
 * Notes:
 * - Uses Fetch API for requests.
 * - Returns parsed JSON or `null` for 204 (no content) responses.
 * - Defaults to localhost if no `REACT_APP_API_URL` environment variable is set.
 */

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const API_BASE_URL = 'http://localhost:4000/api';

class LevelService {
  /**
   * Generic HTTP request helper.
   *
   * @param {string} url - Request path (relative to API base).
   * @param {RequestInit} [options={}] - Fetch configuration (method, headers, body, etc.)
   * @returns {Promise<any>} Parsed JSON response or `null` for 204.
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
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
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

  /**
   * Retrieve all levels.
   * @returns {Promise<Array>} Array of level records.
   */
  async getAll() {
    return this.request("/levels");
  }

  /**
   * Retrieve a specific level by ID.
   * @param {number|string} id - Level ID.
   * @returns {Promise<Object>} Level data.
   */
  async getById(id) {
    return this.request(`/levels/${id}`);
  }

  /**
   * Create a new level record.
   * @param {Object} levelData - New level payload.
   * @returns {Promise<Object>} Created level record.
   */
  async create(levelData) {
    return this.request("/levels", {
      method: "POST",
      body: JSON.stringify(levelData),
    });
  }

  /**
   * Update an existing level.
   * @param {number|string} id - Level ID.
   * @param {Object} levelData - Updated level fields.
   * @returns {Promise<Object>} Updated level record.
   */
  async update(id, levelData) {
    return this.request(`/levels/${id}`, {
      method: "PUT",
      body: JSON.stringify(levelData),
    });
  }

  /**
   * Delete a level by ID.
   * @param {number|string} id - Level ID.
   * @returns {Promise<null>} Returns null on success.
   */
  async delete(id) {
    return this.request(`/levels/${id}`, {
      method: "DELETE",
    });
  }
}

// Export singleton instance
export const levelService = new LevelService();
