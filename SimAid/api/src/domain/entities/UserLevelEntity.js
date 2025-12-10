export default class UserLevelEntity {
  constructor({ user_level_id, user_id, level_id, unlocked, completed }) {
    this.user_level_id = user_level_id;
    this.user_id = user_id;
    this.level_id = level_id;
    this.unlocked = unlocked;
    this.completed = completed;
  }
}
