// src/services/attemptService.js

/**
 * AttemptService
 * -----------------------------------------------------------------------------
 * Provides an abstraction layer for interacting with the `/attempts` API endpoints.
 * Handles fetching attempt data, saving scores, and counting completions.
 *
 * Notes:
 * - Uses the browser Fetch API with JSON parsing and error handling.
 * - Defaults to localhost if no `REACT_APP_API_URL` is configured.
 * - Throws descriptive errors for network or HTTP failures.
 */

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const API_BASE_URL = 'http://localhost:4000/api';

class AttemptService {
  /**
   * Make an HTTP request to the backend API.
   *
   * @param {string} url - Request path (relative to API base).
   * @param {RequestInit} [options={}] - Fetch options (method, headers, body, etc.).
   * @returns {Promise<any>} Parsed JSON response data or `null` for 204 responses.
   * @throws {Error} On network or HTTP failure.
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

      // Throw for bad responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Handle DELETE / 204 (no content)
      if (response.status === 204) return null;

      return await response.json();
    } catch (error) {
      // Network-level errors (e.g., CORS, connection issues)
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Network error. Please check your connection.");
      }
      throw error;
    }
  }

  /**
   * Retrieve all attempts from the API.
   * @returns {Promise<Array>} Array of attempt objects.
   */
  async getAll() {
    return this.request("/attempts");
  }

  /**
   * Retrieve a specific attempt by its ID.
   * @param {number|string} id - Attempt ID.
   * @returns {Promise<Object>} Attempt record.
   */
  async getById(id) {
    return this.request(`/attempts/${id}`);
  }

  /**
   * Retrieve attempts for a given user and scenario pair.
   * @param {number|string} userId
   * @param {number|string} scenarioId
   * @returns {Promise<Object|null>} Attempt record for the user and scenario.
   */
  async getByUserAndScenario(userId, scenarioId) {
    return this.request(`/attempts/user/${userId}/scenario/${scenarioId}`);
  }

  /**
   * Save or update a user's best score for a scenario.
   * @param {Object} data - Attempt payload.
   * @returns {Promise<Object>} Updated or created attempt record.
   */
  async saveBestScore(data) {
    return this.request("/attempts/best", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Count perfect attempts (e.g., 100% score) by a user within a specific level.
   * @param {number|string} userId
   * @param {number|string} levelId
   * @returns {Promise<{count: number}>} Count result.
   */
  async countPerfectByUserInLevel(userId, levelId) {
    return this.request(
      `/attempts/count/perfect?user_id=${encodeURIComponent(
        userId
      )}&level_id=${encodeURIComponent(levelId)}`
    );
  }

  /**
   * Count total scenarios available in a given level.
   * @param {number|string} levelId
   * @returns {Promise<{count: number}>} Count result.
   */
  async countScenariosInLevel(levelId) {
    return this.request(
      `/attempts/count/scenarios?level_id=${encodeURIComponent(levelId)}`
    );
  }
}

// Export singleton instance for reuse
export const attemptService = new AttemptService();
