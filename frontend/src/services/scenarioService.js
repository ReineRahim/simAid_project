// src/services/scenarioService.js

/**
 * ScenarioService
 * -----------------------------------------------------------------------------
 * Handles all CRUD operations and submissions related to training scenarios.
 * Provides both user-level (play/submit) and admin-level (create/update/delete)
 * endpoints via the backend API.
 *
 * Features:
 * - Includes authorization header if JWT token is present in localStorage.
 * - Consistent JSON parsing and descriptive error messages.
 * - Common request() wrapper shared by all endpoints.
 *
 * Notes:
 * - Uses Fetch API.
 * - Returns parsed JSON or throws descriptive errors for network/HTTP failures.
 * - Defaults to localhost if `REACT_APP_API_URL` is not configured.
 */

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const API_BASE_URL = 'http://localhost:4000/api';

class ScenarioService {
  /**
   * Generic HTTP request wrapper.
   *
   * @param {string} url - Endpoint path relative to API base.
   * @param {RequestInit} [options={}] - Fetch configuration (method, headers, body, etc.).
   * @returns {Promise<any>} Parsed JSON response data.
   * @throws {Error} On network or HTTP failure with descriptive message.
   */
  async request(url, options = {}) {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    const res = await fetch(`${API_BASE_URL}${url}`, config);
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = data?.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }

    return data;
  }

  // ──────────────────────────── User-Facing Endpoints ────────────────────────────

  /**
   * Retrieve a single scenario by ID (includes its steps).
   * @param {number|string} id - Scenario ID.
   * @returns {Promise<Object>} Scenario data.
   */
  async getById(id) {
    return this.request(`/scenarios/${id}`);
  }

  /**
   * Submit answers for a given scenario.
   * Expected payload: `{ userAnswers: string[] }`
   *
   * @param {number|string} id - Scenario ID.
   * @param {string[]} answers - Array of user-selected answers (A–D).
   * @returns {Promise<Object>} Submission result (score, progress, etc.).
   */
  async submit(id, answers) {
    return this.request(`/scenarios/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ userAnswers: answers }),
    });
  }

  /**
   * List all scenarios for a specific level.
   * @param {number|string} levelId - Level ID.
   * @returns {Promise<Array>} Array of scenario objects.
   */
  async listByLevel(levelId) {
    return this.request(`/scenarios/level/${levelId}`);
  }

  // ──────────────────────────── Admin Endpoints ────────────────────────────────

  /**
   * Retrieve all scenarios (admin).
   * @returns {Promise<Array>} Array of all scenario records.
   */
  async getAll() {
    return this.request('/scenarios');
  }

  /**
   * Create a new scenario (admin).
   * @param {Object} data - Scenario payload (title, description, steps, etc.).
   * @returns {Promise<Object>} Created scenario record.
   */
  async create(data) {
    return this.request('/scenarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing scenario (admin).
   * @param {number|string} id - Scenario ID.
   * @param {Object} data - Updated scenario data.
   * @returns {Promise<Object>} Updated scenario record.
   */
  async update(id, data) {
    return this.request(`/scenarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a scenario by ID (admin).
   * @param {number|string} id - Scenario ID.
   * @returns {Promise<null>} Returns null on successful deletion.
   */
  async delete(id) {
    return this.request(`/scenarios/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const scenarioService = new ScenarioService();
