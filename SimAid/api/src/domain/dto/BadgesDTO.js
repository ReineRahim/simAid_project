export default class BadgeDTO {
  constructor({ badge_id, name, description, level_id, icon_url}) {
    this.badge_id = badge_id;
    this.name = name;
    this.description = description;
    this.level_id = level_id;
    this.icon_url = icon_url;
  }

  static fromEntity(entity) {
    return new BadgeDTO(entity);
  }
}
