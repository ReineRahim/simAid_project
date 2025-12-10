/**
 * Data Transfer Object (DTO) representing a badge record.
 *
 * Used to transfer badge data between layers of the application,
 * ensuring a consistent structure for responses and logic handling.
 */
export default class BadgeDTO {
  /**
   * @param {object} params - Badge properties.
   * @param {number} params.badge_id - Unique identifier of the badge.
   * @param {string} params.name - Name of the badge.
   * @param {string} params.description - Description of the badge.
   * @param {number} params.level_id - Associated level ID for which this badge applies.
   * @param {string} [params.icon_url] - Optional URL for the badge icon.
   */
  constructor({ badge_id, name, description, level_id, icon_url }) {
    this.badge_id = badge_id;
    this.name = name;
    this.description = description;
    this.level_id = level_id;
    this.icon_url = icon_url;
  }

  /**
   * Creates a BadgeDTO instance from a plain entity object.
   *
   * @static
   * @method fromEntity
   * @param {object} entity - The badge entity object.
   * @returns {BadgeDTO} A new BadgeDTO instance.
   * @example
   * const dto = BadgeDTO.fromEntity(dbRecord);
   */
  static fromEntity(entity) {
    return new BadgeDTO(entity);
  }
}
