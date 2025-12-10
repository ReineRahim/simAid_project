/**
 * Data Transfer Object (DTO) representing an attempt record.
 *
 * Encapsulates attempt-related data for transport between
 * layers of the application (e.g., between database and controllers).
 */
export default class AttemptDTO {
  /**
   * @param {object} params - Attempt properties.
   * @param {number} params.attempt_id - Unique identifier of the attempt.
   * @param {number} params.user_id - ID of the user who made the attempt.
   * @param {number} params.scenario_id - ID of the related scenario.
   * @param {number} params.score - Score achieved in the attempt.
   * @param {string|Date} params.completed_at - Timestamp when the attempt was completed.
   */
  constructor({ attempt_id, user_id, scenario_id, score, completed_at }) {
    this.attempt_id = attempt_id;
    this.user_id = user_id;
    this.scenario_id = scenario_id;
    this.score = score;
    this.completed_at = completed_at;
  }

  /**
   * Creates an AttemptDTO instance from a plain entity object.
   *
   * @static
   * @method fromEntity
   * @param {object} entity - The attempt entity object.
   * @returns {AttemptDTO} A new AttemptDTO instance.
   * @example
   * const dto = AttemptDTO.fromEntity(dbRecord);
   */
  static fromEntity(entity) {
    return new AttemptDTO(entity);
  }
}
