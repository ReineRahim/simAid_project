import AttemptDTO from '../domain/dto/AttemptDTO.js';

/**
 * Service layer for managing user attempts within scenarios.
 *
 * Handles business logic such as retrieving, creating, and updating
 * user attempt data. This service converts raw repository entities
 * into DTOs (`AttemptDTO`) before returning them to the controller.
 *
 * @class AttemptService
 */
export class AttemptService {
  /**
   * Creates an instance of AttemptService.
   * @param {import('../domain/repositories/AttemptRepository.js').AttemptRepository} attemptRepository - The repository for attempt data.
   */
  constructor(attemptRepository) {
    this.attemptRepository = attemptRepository;
  }

  /**
   * Retrieve all attempts from the repository.
   * @async
   * @returns {Promise<AttemptDTO[]>} List of all user attempts.
   * @throws {Error} If database access fails.
   * @example
   * const attempts = await attemptService.listAttempts();
   */
  async listAttempts() {
    try {
      const attempts = await this.attemptRepository.findAll();
      return attempts.map(AttemptDTO.fromEntity);
    } catch (error) {
      throw new Error('Failed to list attempts: ' + error.message);
    }
  }

  /**
   * Retrieve a single attempt by its ID.
   * @async
   * @param {number} id - The unique ID of the attempt.
   * @returns {Promise<AttemptDTO|null>} The attempt DTO, or null if not found.
   * @throws {Error} If retrieval fails.
   * @example
   * const attempt = await attemptService.getAttempt(5);
   */
  async getAttempt(id) {
    try {
      const attempt = await this.attemptRepository.findById(id);
      return attempt ? AttemptDTO.fromEntity(attempt) : null;
    } catch (error) {
      throw new Error(`Failed to get attempt with id ${id}: ${error.message}`);
    }
  }

  /**
   * Retrieve a user's attempt for a specific scenario.
   * @async
   * @param {number} user_id - The ID of the user.
   * @param {number} scenario_id - The ID of the scenario.
   * @returns {Promise<AttemptDTO|null>} The user's attempt, or null if not found.
   * @throws {Error} If retrieval fails.
   * @example
   * const attempt = await attemptService.getUserAttempt(3, 10);
   */
  async getUserAttempt(user_id, scenario_id) {
    try {
      const attempt = await this.attemptRepository.findByUserAndScenario(user_id, scenario_id);
      return attempt ? AttemptDTO.fromEntity(attempt) : null;
    } catch (error) {
      throw new Error(`Failed to get user attempt: ${error.message}`);
    }
  }

  /**
   * Create or update the best score for a given user and scenario.
   * If a previous score exists, only updates if the new score is higher.
   * @async
   * @param {object} data - Attempt data (user_id, scenario_id, score).
   * @returns {Promise<AttemptDTO>} The updated or newly created attempt.
   * @throws {Error} If saving fails.
   * @example
   * await attemptService.saveBestScore({ user_id: 2, scenario_id: 4, score: 90 });
   */
  async saveBestScore(data) {
    try {
      const attempt = await this.attemptRepository.upsertBestScore(data);
      return AttemptDTO.fromEntity(attempt);
    } catch (error) {
      throw new Error('Failed to save best score: ' + error.message);
    }
  }

  /**
   * Count the number of perfect (100%) attempts for a user in a specific level.
   * @async
   * @param {number} user_id - The user ID.
   * @param {number} level_id - The level ID.
   * @returns {Promise<number>} The count of perfect attempts.
   * @example
   * const perfectCount = await attemptService.countPerfectByUserInLevel(5, 2);
   */
  async countPerfectByUserInLevel(user_id, level_id) {
    return await this.attemptRepository.countPerfectByUserInLevel(user_id, level_id);
  }

  /**
   * Count how many scenarios exist in a specific level.
   * @async
   * @param {number} level_id - The level ID.
   * @returns {Promise<number>} Total number of scenarios in that level.
   * @example
   * const totalScenarios = await attemptService.countScenariosInLevel(3);
   */
  async countScenariosInLevel(level_id) {
    return await this.attemptRepository.countScenariosInLevel(level_id);
  }

  /**
   * Retrieve all attempts by a user for a given level.
   * @async
   * @param {number} userId - The user ID.
   * @param {number} levelId - The level ID.
   * @returns {Promise<object[]>} Array of attempts with scenario IDs and scores.
   * @example
   * const attempts = await attemptService.getUserAttemptsByLevel(4, 2);
   */
  async getUserAttemptsByLevel(userId, levelId) {
    return this.attemptRepository.getUserAttemptsByLevel(userId, levelId);
  }
}
