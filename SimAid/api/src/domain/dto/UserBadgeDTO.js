export default class UserBadgeDTO {
  constructor({
    user_badge_id,
    user_id,
    badge_id,
    earned_at
  }) {
    this.user_badge_id = user_badge_id;
    this.user_id = user_id;
    this.badge_id = badge_id;
    this.earned_at = earned_at;
  }

  static fromEntity(entity) {
    return new UserBadgeDTO(entity);
  }
}
