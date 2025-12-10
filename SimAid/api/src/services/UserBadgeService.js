import UserBadgeDTO from '../domain/dto/UserBadgeDTO.js';

export class UserBadgeService {
  constructor(userBadgeRepository) {
    this.userBadgeRepository = userBadgeRepository;
  }

  async listUserBadges() {
    try {
      const badges = await this.userBadgeRepository.findAll();
      return badges.map(UserBadgeDTO.fromEntity);
    } catch (error) {
      throw new Error('Failed to list user badges: ' + error.message);
    }
  }

  async listUserBadgesByUserId(userId) {
  return this.repo.findAll({ where: { user_id: userId } }); // adjust to your ORM
}


  async getUserBadges(user_id) {
    try {
      const badges = await this.userBadgeRepository.findByUser(user_id);
      return badges.map(UserBadgeDTO.fromEntity);
    } catch (error) {
      throw new Error(`Failed to get badges for user ${user_id}: ${error.message}`);
    }
  }

  async getUserBadge(user_id, badge_id) {
    try {
      const badge = await this.userBadgeRepository.findByUserAndBadge(user_id, badge_id);
      return badge ? UserBadgeDTO.fromEntity(badge) : null;
    } catch (error) {
      throw new Error(`Failed to get badge ${badge_id} for user ${user_id}: ${error.message}`);
    }
  }

  async createUserBadge(data) {
    try {
      const badge = await this.userBadgeRepository.create(data);
      return UserBadgeDTO.fromEntity(badge);
    } catch (error) {
      throw new Error('Failed to create user badge: ' + error.message);
    }
  }

  async deleteUserBadge(user_badge_id) {
    try {
      return await this.userBadgeRepository.delete(user_badge_id);
    } catch (error) {
      throw new Error(`Failed to delete user badge with id ${user_badge_id}: ${error.message}`);
    }
  }
}
