import BadgesDTO from '../domain/dto/BadgesDTO.js';

/**
 * Service layer for managing badges.
 *
 * Handles the business logic related to badges, such as retrieving,
 * creating, updating, and deleting badge records. Converts repository
 * entities into DTOs (`BadgesDTO`) before returning them to controllers.
 *
 * @class BadgesService
 */
export class BadgesService {
  /**
   * Creates an instance of BadgesService.
   * @param {import('../domain/repositories/BadgesRepository.js').BadgesRepository} badgesRepository - Repository handling badge data.
   */
  constructor(badgesRepository) {
    this.badgesRepository = badgesRepository;
  }

  /**
   * Retrieve all available badges.
   * @async
   * @returns {Promise<BadgesDTO[]>} A list of all badges.
   * @throws {Error} If fetching badges fails.
   * @example
   * const badges = await badgesService.listBadges();
   */
  async listBadges() {
    try {
      const badges = await this.badgesRepository.findAll();
      return badges.map(BadgesDTO.fromEntity);
    } catch (error) {
      throw new Error('Failed to list badges: ' + error.message);
    }
  }

  /**
   * Retrieve a specific badge by its ID.
   * @async
   * @param {number} id - The ID of the badge to fetch.
   * @returns {Promise<BadgesDTO|null>} The badge DTO, or null if not found.
   * @throws {Error} If retrieval fails.
   * @example
   * const badge = await badgesService.getBadge(3);
   */
  async getBadge(id) {
    try {
      const badge = await this.badgesRepository.findById(id);
      return badge ? BadgesDTO.fromEntity(badge) : null;
    } catch (error) {
      throw new Error(`Failed to get badge with id ${id}: ${error.message}`);
    }
  }

  /**
   * Retrieve badges associated with a specific level.
   * @async
   * @param {number} level_id - The level ID to filter badges by.
   * @returns {Promise<BadgesDTO[]>} List of badges for that level.
   * @throws {Error} If retrieval fails.
   * @example
   * const levelBadges = await badgesService.getBadgesByLevel(2);
   */
  async getBadgesByLevel(level_id) {
    try {
      const badges = await this.badgesRepository.findByLevel(level_id);
      return badges.map(BadgesDTO.fromEntity);
    } catch (error) {
      throw new Error(`Failed to get badges for level ${level_id}: ${error.message}`);
    }
  }

  /**
   * Create a new badge record.
   * @async
   * @param {object} data - The badge data to create.
   * @param {number} data.level_id - The associated level ID.
   * @param {string} data.name - The badge name.
   * @param {string} data.description - Badge description.
   * @param {string} [data.icon_url] - Optional icon URL.
   * @returns {Promise<BadgesDTO>} The created badge DTO.
   * @throws {Error} If badge creation fails.
   * @example
   * const newBadge = await badgesService.createBadge({
   *   level_id: 3,
   *   name: "Expert",
   *   description: "Completed all level 3 challenges"
   * });
   */
  async createBadge(data) {
    try {
      const badge = await this.badgesRepository.create(data);
      return BadgesDTO.fromEntity(badge);
    } catch (error) {
      throw new Error('Failed to create badge: ' + error.message);
    }
  }

  /**
   * Update an existing badge record.
   * @async
   * @param {number} id - The ID of the badge to update.
   * @param {object} data - Updated badge data.
   * @param {number} [data.level_id] - Updated level ID.
   * @param {string} [data.name] - Updated name.
   * @param {string} [data.description] - Updated description.
   * @param {string} [data.icon_url] - Updated icon URL.
   * @returns {Promise<BadgesDTO|null>} Updated badge DTO, or null if not found.
   * @throws {Error} If update fails.
   * @example
   * const updated = await badgesService.updateBadge(4, { name: "Elite Performer" });
   */
  async updateBadge(id, data) {
    try {
      const badge = await this.badgesRepository.update(id, data);
      return badge ? BadgesDTO.fromEntity(badge) : null;
    } catch (error) {
      throw new Error(`Failed to update badge with id ${id}: ${error.message}`);
    }
  }

  /**
   * Delete a badge by its ID.
   * @async
   * @param {number} id - The badge ID.
   * @returns {Promise<boolean>} True if deletion succeeded, false otherwise.
   * @throws {Error} If deletion fails.
   * @example
   * const success = await badgesService.deleteBadge(2);
   */
  async deleteBadge(id) {
    try {
      return await this.badgesRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete badge with id ${id}: ${error.message}`);
    }
  }
}
