import UserLevelDTO from "../domain/dto/UserLevelDTO.js";

/**
 * Service layer for managing user-level progress.
 *
 * Handles user progress through levels, including listing,
 * creation, updates, deletion, and upsert operations.
 * Converts repository entities into DTOs (`UserLevelDTO`)
 * before returning results to controllers.
 *
 * @class UserLevelService
 */
export class UserLevelService {
  /**
   * Creates an instance of UserLevelService.
   * @param {import("../domain/repositories/UserLevelRepository.js").UserLevelRepository} userLevelRepository - Repository managing user-level data.
   */
  constructor(userLevelRepository) {
    this.userLevelRepository = userLevelRepository;
  }

  /**
   * Retrieve all user-level records (admin/debug use).
   * @async
   * @returns {Promise<UserLevelDTO[]>} List of all user-level records.
   * @example
   * const allUserLevels = await userLevelService.listUserLevels();
   */
  async listUserLevels() {
    const records = await this.userLevelRepository.findAll();
    return records.map(UserLevelDTO.fromEntity);
  }

  /**
   * Retrieve all level progress records for a specific user.
   * @async
   * @param {number} user_id - The user ID.
   * @returns {Promise<UserLevelDTO[]>} List of user-level DTOs for the user.
   * @example
   * const userLevels = await userLevelService.getUserLevels(4);
   */
  async getUserLevels(user_id) {
    const records = await this.userLevelRepository.findByUser(user_id);
    return records.map(UserLevelDTO.fromEntity);
  }

  /**
   * Retrieve a single user-level progress record by user and level.
   * @async
   * @param {number} user_id - The user ID.
   * @param {number} level_id - The level ID.
   * @returns {Promise<UserLevelDTO|null>} User-level DTO or null if not found.
   * @example
   * const levelProgress = await userLevelService.getUserLevel(3, 2);
   */
  async getUserLevel(user_id, level_id) {
    const record = await this.userLevelRepository.findByUserAndLevel(user_id, level_id);
    return record ? UserLevelDTO.fromEntity(record) : null;
  }

  /**
   * Retrieve a single user-level record by its primary ID.
   * @async
   * @param {number} user_level_id - The user-level record ID.
   * @returns {Promise<UserLevelDTO|null>} The user-level DTO or null if not found.
   * @example
   * const record = await userLevelService.getById(12);
   */
  async getById(user_level_id) {
    const record = await this.userLevelRepository.findById(user_level_id);
    return record ? UserLevelDTO.fromEntity(record) : null;
  }

  /**
   * Create a new user-level record.
   * Usually used when initializing user progress in a new level.
   * @async
   * @param {object} data - New user-level data.
   * @param {number} data.user_id - The user ID.
   * @param {number} data.level_id - The level ID.
   * @param {boolean} [data.unlocked=false] - Whether the level is unlocked.
   * @param {boolean} [data.completed=false] - Whether the level is completed.
   * @returns {Promise<UserLevelDTO>} The created user-level DTO.
   * @example
   * const newLevel = await userLevelService.createUserLevel({ user_id: 3, level_id: 2, unlocked: true });
   */
  async createUserLevel(data) {
    const record = await this.userLevelRepository.create(data);
    return UserLevelDTO.fromEntity(record);
  }

  /**
   * Update an existing user-level record's status.
   * Called by the controller for `PUT /user-levels/:id`.
   * @async
   * @param {number} user_level_id - The user-level ID.
   * @param {object} data - Updated progress data.
   * @param {boolean} [data.unlocked] - Whether the level is unlocked.
   * @param {boolean} [data.completed] - Whether the level is completed.
   * @returns {Promise<UserLevelDTO|null>} Updated DTO or null if not found.
   * @example
   * const updated = await userLevelService.updateUserLevelStatus(5, { completed: true });
   */
  async updateUserLevelStatus(user_level_id, data) {
    const record = await this.userLevelRepository.updateStatus(user_level_id, data);
    return record ? UserLevelDTO.fromEntity(record) : null;
  }

  /**
   * Delete a user-level record by its ID.
   * @async
   * @param {number} user_level_id - The user-level ID.
   * @returns {Promise<boolean>} True if deleted successfully, false otherwise.
   * @example
   * const success = await userLevelService.deleteUserLevel(6);
   */
  async deleteUserLevel(user_level_id) {
    return this.userLevelRepository.delete(user_level_id);
  }

  /**
   * Create or update a user's level progress.
   * If the record exists, updates it; otherwise, creates a new one.
   * @async
   * @param {object} params - Progress update data.
   * @param {number} params.user_id - The user ID.
   * @param {number} params.level_id - The level ID.
   * @param {boolean} [params.unlocked=false] - Whether the level is unlocked.
   * @param {boolean} [params.completed=false] - Whether the level is completed.
   * @returns {Promise<UserLevelDTO>} The upserted user-level DTO.
   * @example
   * const result = await userLevelService.upsertUserLevelProgress({
   *   user_id: 4,
   *   level_id: 3,
   *   unlocked: true,
   *   completed: false
   * });
   */
  async upsertUserLevelProgress({ user_id, level_id, unlocked = false, completed = false }) {
    const record = await this.userLevelRepository.upsertProgress({
      user_id,
      level_id,
      unlocked,
      completed,
    });
    return UserLevelDTO.fromEntity(record);
  }
}
