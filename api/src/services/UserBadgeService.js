import UserBadgeDTO from '../domain/dto/UserBadgeDTO.js';

/**
 * Service layer for managing user badges.
 *
 * Handles the logic for fetching, creating, and deleting user badge records.
 * Converts database entities into DTOs (`UserBadgeDTO`) before returning results.
 *
 * @class UserBadgeService
 */
export class UserBadgeService {
  /**
   * Creates an instance of UserBadgeService.
   * @param {import('../domain/repositories/UserBadgeRepository.js').UserBadgeRepository} userBadgeRepository - Repository for managing user badge data.
   */
  constructor(userBadgeRepository) {
    this.userBadgeRepository = userBadgeRepository;
  }

  /**
   * Retrieve all user badges.
   * Primarily used for administrative or debugging purposes.
   * @async
   * @returns {Promise<UserBadgeDTO[]>} List of all user badges.
   * @throws {Error} If retrieval fails.
   * @example
   * const allUserBadges = await userBadgeService.listUserBadges();
   */
  async listUserBadges() {
    try {
      const badges = await this.userBadgeRepository.findAll();
      return badges.map(UserBadgeDTO.fromEntity);
    } catch (error) {
      throw new Error('Failed to list user badges: ' + error.message);
    }
  }

  /**
   * Retrieve badges for a specific user by their user ID.
   * ⚠️ NOTE: This method references `this.repo` which may need adjustment depending on your ORM or repository setup.
   * @async
   * @param {number} userId - The user's ID.
   * @returns {Promise<object[]>} List of user badges.
   * @example
   * const badges = await userBadgeService.listUserBadgesByUserId(3);
   */
  async listUserBadgesByUserId(userId) {
    return this.repo.findAll({ where: { user_id: userId } }); // adjust to your ORM
  }

  /**
   * Retrieve all badges earned by a specific user.
   * @async
   * @param {number} user_id - The user's ID.
   * @returns {Promise<UserBadgeDTO[]>} List of the user's badges.
   * @throws {Error} If retrieval fails.
   * @example
   * const badges = await userBadgeService.getUserBadges(5);
   */
  async getUserBadges(user_id) {
    try {
      const badges = await this.userBadgeRepository.findByUser(user_id);
      return badges.map(UserBadgeDTO.fromEntity);
    } catch (error) {
      throw new Error(`Failed to get badges for user ${user_id}: ${error.message}`);
    }
  }

  /**
   * Retrieve a specific badge earned by a user.
   * @async
   * @param {number} user_id - The user's ID.
   * @param {number} badge_id - The badge's ID.
   * @returns {Promise<UserBadgeDTO|null>} The user badge DTO, or null if not found.
   * @throws {Error} If retrieval fails.
   * @example
   * const badge = await userBadgeService.getUserBadge(5, 2);
   */
  async getUserBadge(user_id, badge_id) {
    try {
      const badge = await this.userBadgeRepository.findByUserAndBadge(user_id, badge_id);
      return badge ? UserBadgeDTO.fromEntity(badge) : null;
    } catch (error) {
      throw new Error(`Failed to get badge ${badge_id} for user ${user_id}: ${error.message}`);
    }
  }

  /**
   * Create a new user badge record (assign a badge to a user).
   * @async
   * @param {object} data - Badge assignment data.
   * @param {number} data.user_id - The user ID.
   * @param {number} data.badge_id - The badge ID.
   * @param {Date} [data.earned_at] - Optional timestamp for when the badge was earned.
   * @returns {Promise<UserBadgeDTO>} The created user badge DTO.
   * @throws {Error} If creation fails.
   * @example
   * const newBadge = await userBadgeService.createUserBadge({ user_id: 3, badge_id: 5 });
   */
  async createUserBadge(data) {
    try {
      const badge = await this.userBadgeRepository.create(data);
      return UserBadgeDTO.fromEntity(badge);
    } catch (error) {
      throw new Error('Failed to create user badge: ' + error.message);
    }
  }

  /**
   * Delete a user badge record by its ID.
   * @async
   * @param {number} user_badge_id - The user badge ID.
   * @returns {Promise<boolean>} True if deleted successfully, false otherwise.
   * @throws {Error} If deletion fails.
   * @example
   * const deleted = await userBadgeService.deleteUserBadge(7);
   */
  async deleteUserBadge(user_badge_id) {
    try {
      return await this.userBadgeRepository.delete(user_badge_id);
    } catch (error) {
      throw new Error(`Failed to delete user badge with id ${user_badge_id}: ${error.message}`);
    }
  }
}
