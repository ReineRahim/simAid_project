/**
 * Entity class representing a level record in the database.
 *
 * Encapsulates data for levels, which define progression stages or difficulty tiers
 * within the application’s learning or gameplay system.
 */
export default class LevelEntity {
  /**
   * @param {object} params - Level entity properties.
   * @param {number} params.level_id - Unique identifier for the level.
   * @param {string} params.title - Title or name of the level.
   * @param {string} [params.description] - Optional description of the level’s purpose or theme.
   * @param {number} params.difficulty_order - Numeric order indicating the difficulty or sequence of the level.
   */
  constructor({ level_id, title, description, difficulty_order }) {
    /**
     * Unique ID of the level.
     * @type {number}
     */
    this.level_id = level_id;

    /**
     * Title or name of the level.
     * @type {string}
     */
    this.title = title;

    /**
     * Description or summary of the level’s content or objectives.
     * @type {string|undefined}
     */
    this.description = description;

    /**
     * Numeric value representing the order or difficulty ranking of the level.
     * Lower numbers typically indicate earlier or easier levels.
     * @type {number}
     */
    this.difficulty_order = difficulty_order;
  }
}
