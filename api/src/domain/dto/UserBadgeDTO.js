/**
 * Data Transfer Object (DTO) representing the relationship between a user and a badge.
 *
 * Used to encapsulate and transfer information about badges earned by users,
 * typically for achievement tracking and reward systems.
 */
export default class UserBadgeDTO {
  /**
   * @param {object} params - User badge properties.
   * @param {number} params.user_badge_id - Unique identifier for the user-badge record.
   * @param {number} params.user_id - ID of the user who earned the badge.
   * @param {number} params.badge_id - ID of the badge earned.
   * @param {string|Date} params.earned_at - Timestamp when the badge was earned.
   */
  constructor({ user_badge_id, user_id, badge_id, earned_at }) {
    this.user_badge_id = user_badge_id;
    this.user_id = user_id;
    this.badge_id = badge_id;
    this.earned_at = earned_at;
  }

  /**
   * Creates a `UserBadgeDTO` instance from a plain entity object.
   *
   * @static
   * @method fromEntity
   * @param {object} entity - The user-badge entity object (e.g., database record).
   * @returns {UserBadgeDTO} A new `UserBadgeDTO` instance.
   * @example
   * const dto = UserBadgeDTO.fromEntity(dbRecord);
   */
  static fromEntity(entity) {
    return new UserBadgeDTO(entity);
  }
}
