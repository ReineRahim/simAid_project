/**
 * Entity class representing a badge record in the database.
 *
 * Encapsulates the raw data structure for badges,
 * which are typically associated with specific levels and awarded to users
 * as recognition for completing achievements or milestones.
 */
export default class BadgesEntity {
  /**
   * @param {object} params - Badge entity properties.
   * @param {number} params.badge_id - Unique identifier for the badge.
   * @param {number} params.level_id - ID of the level associated with this badge.
   * @param {string} params.name - Name of the badge.
   * @param {string} params.description - Description of what the badge represents.
   * @param {string} [params.icon_url] - Optional URL to the badge icon image.
   */
  constructor({ badge_id, level_id, name, description, icon_url }) {
    /**
     * Unique ID of the badge.
     * @type {number}
     */
    this.badge_id = badge_id;

    /**
     * ID of the level this badge is linked to.
     * @type {number}
     */
    this.level_id = level_id;

    /**
     * Display name of the badge.
     * @type {string}
     */
    this.name = name;

    /**
     * Description of what this badge signifies or rewards.
     * @type {string}
     */
    this.description = description;

    /**
     * Optional URL for the badge’s icon image.
     * @type {string|undefined}
     */
    this.icon_url = icon_url;
  }
}
