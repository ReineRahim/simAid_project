/**
 * Entity class representing an attempt record in the database.
 *
 * Encapsulates the raw data structure stored in persistence,
 * corresponding to a user's attempt at completing a scenario.
 */
export default class AttemptEntity {
  /**
   * @param {object} params - Attempt properties.
   * @param {number} params.attempt_id - Unique identifier of the attempt record.
   * @param {number} params.user_id - ID of the user who made the attempt.
   * @param {number} params.scenario_id - ID of the scenario associated with this attempt.
   * @param {number} params.score - The score obtained for this attempt.
   * @param {string|Date} params.completed_at - Timestamp when the attempt was completed.
   */
  constructor({ attempt_id, user_id, scenario_id, score, completed_at }) {
    /**
     * Unique ID of the attempt record.
     * @type {number}
     */
    this.attempt_id = attempt_id;

    /**
     * ID of the user who performed this attempt.
     * @type {number}
     */
    this.user_id = user_id;

    /**
     * ID of the associated scenario.
     * @type {number}
     */
    this.scenario_id = scenario_id;

    /**
     * Score earned by the user for this attempt.
     * @type {number}
     */
    this.score = score;

    /**
     * Date and time when the attempt was completed.
     * @type {string|Date}
     */
    this.completed_at = completed_at;
  }
}
