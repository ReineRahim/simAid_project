/**
 * Data Transfer Object (DTO) representing a user's progress at a specific level.
 *
 * Encapsulates information about whether a level is unlocked or completed for a user.
 * Used for data transfer between persistence and presentation layers.
 */
export default class UserLevelDTO {
  /**
   * @param {object} params - User level properties.
   * @param {number} params.user_level_id - Unique identifier for the user-level record.
   * @param {number} params.user_id - ID of the user associated with the level.
   * @param {number} params.level_id - ID of the level associated with the user.
   * @param {boolean} params.unlocked - Whether the level has been unlocked for the user.
   * @param {boolean} params.completed - Whether the user has completed the level.
   */
  constructor({ user_level_id, user_id, level_id, unlocked, completed }) {
    /**
     * Unique ID for this user-level record.
     * @type {number}
     */
    this.user_level_id = user_level_id;

    /**
     * ID of the user who owns this level progress record.
     * @type {number}
     */
    this.user_id = user_id;

    /**
     * ID of the associated level.
     * @type {number}
     */
    this.level_id = level_id;

    /**
     * Whether the level is unlocked for the user.
     * @type {boolean}
     */
    this.unlocked = unlocked;

    /**
     * Whether the user has completed this level.
     * @type {boolean}
     */
    this.completed = completed;
  }

  /**
   * Creates a `UserLevelDTO` instance from a plain entity object.
   *
   * @static
   * @method fromEntity
   * @param {object} entity - The user-level entity object (e.g., a database record).
   * @returns {UserLevelDTO} A new `UserLevelDTO` instance.
   * @example
   * const dto = UserLevelDTO.fromEntity(dbRecord);
   */
  static fromEntity(entity) {
    return new UserLevelDTO(entity);
  }
}
