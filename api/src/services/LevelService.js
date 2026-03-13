import LevelDTO from '../domain/dto/LevelDTO.js';

/**
 * Service layer for handling Level-related business logic.
 *
 * This class manages interactions between controllers and repositories for
 * Level entities. It retrieves, creates, updates, and deletes levels, while
 * converting entities to DTOs (`LevelDTO`) before returning results.
 *
 * @class LevelService
 */
export class LevelService {
  /**
   * Creates an instance of LevelService.
   * @param {import('../domain/repositories/LevelRepository.js').LevelRepository} levelRepository - Repository for interacting with level data.
   */
  constructor(levelRepository) {
    this.levelRepository = levelRepository;
  }

  /**
   * Retrieve all levels from the repository.
   * @async
   * @returns {Promise<LevelDTO[]>} List of all levels.
   * @throws {Error} If retrieval fails.
   * @example
   * const levels = await levelService.listLevels();
   */
  async listLevels() {
    try {
      const levels = await this.levelRepository.findAll();
      return levels.map(LevelDTO.fromEntity);
    } catch (error) {
      throw new Error('Failed to list levels: ' + error.message);
    }
  }

  /**
   * Retrieve a single level by its ID.
   * @async
   * @param {number} id - The unique ID of the level.
   * @returns {Promise<LevelDTO|null>} The level DTO, or null if not found.
   * @throws {Error} If retrieval fails.
   * @example
   * const level = await levelService.getLevel(2);
   */
  async getLevel(id) {
    try {
      const level = await this.levelRepository.findById(id);
      return level ? LevelDTO.fromEntity(level) : null;
    } catch (error) {
      throw new Error(`Failed to get level with id ${id}: ${error.message}`);
    }
  }

  /**
   * Create a new level entry.
   * @async
   * @param {object} data - Data for the new level.
   * @param {string} data.title - The title of the level.
   * @param {string} data.description - Description of the level.
   * @param {number} data.difficulty_order - Numeric order representing difficulty.
   * @returns {Promise<LevelDTO>} The newly created level DTO.
   * @throws {Error} If creation fails.
   * @example
   * const newLevel = await levelService.createLevel({
   *   title: "Advanced",
   *   description: "High difficulty level",
   *   difficulty_order: 3
   * });
   */
  async createLevel(data) {
    try {
      const level = await this.levelRepository.create(data);
      return LevelDTO.fromEntity(level);
    } catch (error) {
      throw new Error('Failed to create level: ' + error.message);
    }
  }

  /**
   * Update an existing level entry by ID.
   * @async
   * @param {number} id - The ID of the level to update.
   * @param {object} data - Updated level fields.
   * @param {string} [data.title] - Updated title.
   * @param {string} [data.description] - Updated description.
   * @param {number} [data.difficulty_order] - Updated difficulty order.
   * @returns {Promise<LevelDTO|null>} The updated level DTO, or null if not found.
   * @throws {Error} If update fails.
   * @example
   * const updatedLevel = await levelService.updateLevel(3, { title: "Expert Level" });
   */
  async updateLevel(id, data) {
    try {
      const level = await this.levelRepository.update(id, data);
      return level ? LevelDTO.fromEntity(level) : null;
    } catch (error) {
      throw new Error(`Failed to update level with id ${id}: ${error.message}`);
    }
  }

  /**
   * Delete a level by its ID.
   * @async
   * @param {number} id - The ID of the level to delete.
   * @returns {Promise<boolean>} True if deletion succeeded, false otherwise.
   * @throws {Error} If deletion fails.
   * @example
   * const success = await levelService.deleteLevel(4);
   */
  async deleteLevel(id) {
    try {
      return await this.levelRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete level with id ${id}: ${error.message}`);
    }
  }
}
