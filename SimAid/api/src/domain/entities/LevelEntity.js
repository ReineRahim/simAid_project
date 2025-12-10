export default class LevelEntity {
  constructor({ level_id, title, description, difficulty_order }) {
    this.level_id = level_id;
    this.title = title;
    this.description = description;
    this.difficulty_order = difficulty_order;
  }
}
