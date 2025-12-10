export default class StepAttemptDTO {
  constructor({step_attempt_id, attempt_id, step_id, user_action, is_correct }) {
    this.step_attempt_id = step_attempt_id;
    this.attempt_id = attempt_id;
    this.step_id = step_id;
    this.user_action = user_action;
    this.is_correct = is_correct;
  }

  static fromEntity(entity) {
    return new StepAttemptDTO(entity);
  }
}
