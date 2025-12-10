/**
 * Data Transfer Object (DTO) representing a single step within a scenario.
 *
 * Each step includes a question, multiple-choice options, the correct action,
 * and an optional feedback message. Used to structure step data between
 * the database layer, services, and controllers.
 */
export default class ScenarioStepDTO {
  /**
   * @param {object} params - Step properties.
   * @param {number} params.step_id - Unique identifier for the step.
   * @param {number} params.scenario_id - ID of the scenario this step belongs to.
   * @param {number} params.step_order - Step sequence order within the scenario.
   * @param {string} params.question_text - Text of the question or prompt for this step.
   * @param {object} params.options - Object containing the multiple-choice options (A–D).
   * @param {string} params.correct_action - The correct answer/action for the step.
   * @param {string} [params.feedback_message] - Optional feedback shown after answering.
   */
  constructor({
    step_id,
    scenario_id,
    step_order,
    question_text,
    options,
    correct_action,
    feedback_message,
  }) {
    this.step_id = step_id;
    this.scenario_id = scenario_id;
    this.step_order = step_order;
    this.question_text = question_text;
    this.options = options;
    this.correct_action = correct_action;
    this.feedback_message = feedback_message;
  }

  /**
   * Creates a `ScenarioStepDTO` instance from a plain entity object.
   *
   * @static
   * @method fromEntity
   * @param {object} entity - The scenario step entity object (e.g., a database record).
   * @returns {ScenarioStepDTO} A new `ScenarioStepDTO` instance.
   * @example
   * const dto = ScenarioStepDTO.fromEntity(dbStepRecord);
   */
  static fromEntity(entity) {
    return new ScenarioStepDTO({
      step_id: entity.step_id,
      scenario_id: entity.scenario_id,
      step_order: entity.step_order,
      question_text: entity.question_text,
      options: entity.options,
      correct_action: entity.correct_action,
      feedback_message: entity.feedback_message,
    });
  }
}
