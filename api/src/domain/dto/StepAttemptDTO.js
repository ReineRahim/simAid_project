/**
 * Data Transfer Object (DTO) representing a single step attempt within a scenario attempt.
 *
 * Encapsulates data about the user’s response to an individual step,
 * including which action they chose and whether it was correct.
 */
export default class StepAttemptDTO {
  /**
   * @param {object} params - Step attempt properties.
   * @param {number} params.step_attempt_id - Unique identifier for this step attempt.
   * @param {number} params.attempt_id - Identifier of the parent attempt record.
   * @param {number} params.step_id - Identifier of the related scenario step.
   * @param {string} params.user_action - The user’s selected answer/action.
   * @param {boolean} params.is_correct - Indicates whether the user’s action was correct.
   */
  constructor({ step_attempt_id, attempt_id, step_id, user_action, is_correct }) {
    this.step_attempt_id = step_attempt_id;
    this.attempt_id = attempt_id;
    this.step_id = step_id;
    this.user_action = user_action;
    this.is_correct = is_correct;
  }

  /**
   * Creates a `StepAttemptDTO` instance from a plain entity object.
   *
   * @static
   * @method fromEntity
   * @param {object} entity - The step attempt entity object (e.g., database record).
   * @returns {StepAttemptDTO} A new `StepAttemptDTO` instance.
   * @example
   * const dto = StepAttemptDTO.fromEntity(dbRecord);
   */
  static fromEntity(entity) {
    return new StepAttemptDTO(entity);
  }
}
