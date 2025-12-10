/**
 * Entity class representing a single step within a scenario in the database.
 *
 * Each scenario step corresponds to one interactive question or action point,
 * containing multiple-choice options, the correct answer, and feedback messaging.
 */
export default class ScenarioStepEntity {
  /**
   * @param {object} params - Scenario step entity properties.
   * @param {number} params.step_id - Unique identifier for the scenario step.
   * @param {number} params.scenario_id - ID of the scenario this step belongs to.
   * @param {number} params.step_order - The sequential order of the step within the scenario.
   * @param {string} params.question_text - The main question or prompt displayed to the user.
   * @param {string} params.option_a - Text for option A.
   * @param {string} params.option_b - Text for option B.
   * @param {string} params.option_c - Text for option C.
   * @param {string} params.option_d - Text for option D.
   * @param {string} params.correct_action - The correct option key ('A', 'B', 'C', or 'D').
   * @param {string} [params.feedback_message] - Optional feedback message shown after answering.
   */
  constructor({
    step_id,
    scenario_id,
    step_order,
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_action,
    feedback_message,
  }) {
    /**
     * Unique ID for the step.
     * @type {number}
     */
    this.step_id = step_id;

    /**
     * ID of the scenario this step belongs to.
     * @type {number}
     */
    this.scenario_id = scenario_id;

    /**
     * The order in which this step appears in the scenario.
     * @type {number}
     */
    this.step_order = step_order;

    /**
     * The main question or prompt for this scenario step.
     * @type {string}
     */
    this.question_text = question_text;

    /**
     * Available multiple-choice options for the step.
     * @type {{A: string, B: string, C: string, D: string}}
     */
    this.options = {
      A: option_a,
      B: option_b,
      C: option_c,
      D: option_d,
    };

    /**
     * The correct answer option key ('A', 'B', 'C', or 'D').
     * @type {string}
     */
    this.correct_action = correct_action;

    /**
     * Optional feedback message to display after the user's response.
     * @type {string|undefined}
     */
    this.feedback_message = feedback_message;
  }
}
