export default class ScenarioStepEntity {
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
    this.step_id = step_id;
    this.scenario_id = scenario_id;
    this.step_order = step_order;
    this.question_text = question_text;
    this.options = {
      A: option_a,
      B: option_b,
      C: option_c,
      D: option_d,
    };
    this.correct_action = correct_action; // 'A', 'B', 'C', or 'D'
    this.feedback_message = feedback_message;
  }
}
