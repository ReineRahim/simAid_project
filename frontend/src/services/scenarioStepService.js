// src/services/scenarioStepService.js

/**
 * ScenarioStepService
 * -----------------------------------------------------------------------------
 * Provides CRUD operations for managing individual scenario steps.
 * Used primarily for admin or debug purposes to manipulate the step content
 * of scenarios in the backend API.
 *
 * Features:
 * - Centralized request() wrapper with consistent JSON parsing and error handling.
 * - Supports standard REST operations: create, read, update, delete.
 *
 * Notes:
 * - Uses Fetch API.
 * - Returns parsed JSON data or `null` for 204 (no-content) responses.
 * - Defaults to localhost if no `REACT_APP_API_URL` environment variable is set.
 */

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const API_BASE_URL = 'http://localhost:4000/api';

class ScenarioStepService {
  /**
   * Generic HTTP request wrapper for all endpoints.
   *
   * @param {string} url - Request path (relative to API base).
   * @param {RequestInit} [options={}] - Fetch configuration (method, headers, body, etc.)
   * @returns {Promise<any>} Parsed JSON response or `null` for 204 responses.
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

      // Handle DELETE / 204 No Content responses
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
   * Retrieve all scenario steps (admin/debug use).
   * @returns {Promise<Array>} Array of scenario step objects.
   */
  async getAll() {
    return this.request("/scenario-steps");
  }

  /**
   * Retrieve a specific step by its ID.
   * @param {number|string} id - Step ID.
   * @returns {Promise<Object>} Scenario step record.
   */
  async getById(id) {
    return this.request(`/scenario-steps/${id}`);
  }

  /**
   * Create a new scenario step.
   * @param {Object} stepData - Step payload (e.g. question, options, correct answer).
   * @returns {Promise<Object>} Created step record.
   */
  async create(stepData) {
    return this.request("/scenario-steps", {
      method: "POST",
      body: JSON.stringify(stepData),
    });
  }

  /**
   * Update an existing scenario step.
   * @param {number|string} id - Step ID.
   * @param {Object} stepData - Updated step data.
   * @returns {Promise<Object>} Updated step record.
   */
  async update(id, stepData) {
    return this.request(`/scenario-steps/${id}`, {
      method: "PUT",
      body: JSON.stringify(stepData),
    });
  }

  /**
   * Delete a scenario step by ID.
   * @param {number|string} id - Step ID.
   * @returns {Promise<null>} Returns null on success.
   */
  async delete(id) {
    return this.request(`/scenario-steps/${id}`, {
      method: "DELETE",
    });
  }
}

// Export singleton instance
export const scenarioStepService = new ScenarioStepService();
