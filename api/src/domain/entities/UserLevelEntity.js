/**
 * Entity class representing a user's progress for a specific level in the database.
 *
 * Each record connects a user to a level, indicating whether the level
 * has been unlocked and/or completed. This supports tracking user progression
 * through a learning path or game structure.
 */
export default class UserLevelEntity {
  /**
   * @param {object} params - User level entity properties.
   * @param {number} params.user_level_id - Unique identifier for the user-level record.
   * @param {number} params.user_id - ID of the user associated with this level.
   * @param {number} params.level_id - ID of the level this record corresponds to.
   * @param {boolean} params.unlocked - Indicates whether the user has unlocked this level.
   * @param {boolean} params.completed - Indicates whether the user has completed this level.
   */
  constructor({ user_level_id, user_id, level_id, unlocked, completed }) {
    /**
     * Unique ID for this user-level record.
     * @type {number}
     */
    this.user_level_id = user_level_id;

    /**
     * ID of the user who owns this level progress.
     * @type {number}
     */
    this.user_id = user_id;

    /**
     * ID of the associated level.
     * @type {number}
     */
    this.level_id = level_id;

    /**
     * Whether this level has been unlocked for the user.
     * @type {boolean}
     */
    this.unlocked = unlocked;

    /**
     * Whether the user has completed this level.
     * @type {boolean}
     */
    this.completed = completed;
  }
}
