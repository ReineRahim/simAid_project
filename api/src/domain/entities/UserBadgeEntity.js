/**
 * Entity class representing a record of a badge earned by a user.
 *
 * This maps the many-to-many relationship between users and badges,
 * tracking when a user earned a specific badge.
 */
export default class UserBadgeEntity {
  /**
   * @param {object} params - User badge entity properties.
   * @param {number} params.user_badge_id - Unique identifier for the user-badge record.
   * @param {number} params.user_id - ID of the user who earned the badge.
   * @param {number} params.badge_id - ID of the badge earned by the user.
   * @param {string|Date} params.earned_at - Timestamp indicating when the badge was earned.
   */
  constructor({ user_badge_id, user_id, badge_id, earned_at }) {
    /**
     * Unique ID for this user-badge record.
     * @type {number}
     */
    this.user_badge_id = user_badge_id;

    /**
     * ID of the user who earned the badge.
     * @type {number}
     */
    this.user_id = user_id;

    /**
     * ID of the badge associated with this record.
     * @type {number}
     */
    this.badge_id = badge_id;

    /**
     * Date and time when the user earned the badge.
     * @type {string|Date}
     */
    this.earned_at = earned_at;
  }
}
