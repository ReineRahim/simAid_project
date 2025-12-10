export default class BadgesEntity {
  constructor({ badge_id, level_id, name, description, icon_url }) {
    this.badge_id = badge_id;
    this.level_id = level_id;
    this.name = name;
    this.description = description;
    this.icon_url = icon_url;
  }
}
