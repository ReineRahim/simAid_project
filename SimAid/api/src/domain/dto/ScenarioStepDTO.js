export default class ScenarioStepDTO {
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
