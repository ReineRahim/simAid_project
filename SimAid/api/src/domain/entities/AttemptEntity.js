export default class AttemptEntity {
  constructor({ attempt_id, user_id, scenario_id, score, completed_at}) {
    this.attempt_id = attempt_id;
    this.user_id = user_id;
    this.scenario_id = scenario_id;
    this.score = score;
    this.completed_at = completed_at;
  }
}
