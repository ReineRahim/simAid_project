import ScenarioDTO from '../domain/dto/ScenarioDTO.js';

/**
 * Service layer for handling all Scenario-related operations.
 *
 * Provides business logic for retrieving, creating, updating,
 * and deleting scenarios. Also supports fetching scenarios by level
 * and retrieving combined scenario-step data.
 *
 * @class ScenarioService
 */
export class ScenarioService {
  /**
   * Creates an instance of ScenarioService.
   * @param {import('../domain/repositories/ScenarioRepository.js').ScenarioRepository} scenarioRepository - Repository for interacting with scenario data.
   */
  constructor(scenarioRepository) {
    this.scenarioRepository = scenarioRepository;
  }

  // ------------------------------------------------------------
  // 📋 List all scenarios
  // ------------------------------------------------------------

  /**
   * Retrieve all scenarios.
   * @async
   * @returns {Promise<ScenarioDTO[]>} List of all scenarios.
   * @throws {Error} If retrieval fails.
   * @example
   * const scenarios = await scenarioService.listScenarios();
   */
  async listScenarios() {
    try {
      const scenarios = await this.scenarioRepository.findAll();
      return scenarios.map(ScenarioDTO.fromEntity);
    } catch (error) {
      throw new Error('Failed to list scenarios: ' + error.message);
    }
  }

  // ------------------------------------------------------------
  // 📘 Get one scenario by ID
  // ------------------------------------------------------------

  /**
   * Retrieve a specific scenario by its unique ID.
   * @async
   * @param {number} id - The scenario ID.
   * @returns {Promise<ScenarioDTO|null>} The scenario DTO, or null if not found.
   * @throws {Error} If retrieval fails.
   * @example
   * const scenario = await scenarioService.getScenario(5);
   */
  async getScenario(id) {
    try {
      const scenario = await this.scenarioRepository.findById(id);
      return scenario ? ScenarioDTO.fromEntity(scenario) : null;
    } catch (error) {
      throw new Error(`Failed to get scenario with id ${id}: ${error.message}`);
    }
  }

  /**
   * Retrieve all scenarios belonging to a specific level.
   * (Wrapper around repository's listByLevel method.)
   * @async
   * @param {number} levelId - The level ID.
   * @returns {Promise<ScenarioDTO[]>} List of scenarios for the given level.
   * @throws {Error} If repository is not initialized or retrieval fails.
   * @example
   * const scenarios = await scenarioService.listByLevel(2);
   */
  async listByLevel(levelId) {
    if (!this.scenarioRepository || typeof this.scenarioRepository.listByLevel !== "function") {
      throw new Error("ScenarioRepository not initialized properly");
    }

    return this.scenarioRepository.listByLevel(levelId);
  }

  // ------------------------------------------------------------
  // 📚 Get all scenarios in a level
  // ------------------------------------------------------------

  /**
   * Retrieve all scenarios associated with a specific level ID.
   * @async
   * @param {number} level_id - The level ID.
   * @returns {Promise<ScenarioDTO[]>} List of scenarios in the specified level.
   * @throws {Error} If retrieval fails.
   * @example
   * const levelScenarios = await scenarioService.getScenariosByLevel(1);
   */
  async getScenariosByLevel(level_id) {
    try {
      const scenarios = await this.scenarioRepository.findByLevel(level_id);
      return scenarios.map(ScenarioDTO.fromEntity);
    } catch (error) {
      throw new Error(`Failed to get scenarios for level ${level_id}: ${error.message}`);
    }
  }

  // ------------------------------------------------------------
  // 🔗 Get scenario + its steps (combined view)
  // ------------------------------------------------------------

  /**
   * Retrieve a scenario along with all its ordered steps.
   * Combines results from ScenarioRepository and ScenarioStepService.
   * @async
   * @param {number} scenarioId - The scenario ID.
   * @param {object} scenarioStepService - The ScenarioStepService instance.
   * @returns {Promise<{scenario: ScenarioDTO, steps: object[]} | null>} Scenario with its steps, or null if not found.
   * @throws {Error} If retrieval fails.
   * @example
   * const result = await scenarioService.getScenarioWithSteps(3, stepService);
   */
  async getScenarioWithSteps(scenarioId, scenarioStepService) {
    try {
      const scenario = await this.scenarioRepository.findById(scenarioId);
      if (!scenario) return null;

      // 🔹 Retrieve ordered steps for the scenario
      const steps = await scenarioStepService.getStepsByScenario(scenarioId);

      return {
        scenario: ScenarioDTO.fromEntity(scenario),
        steps,
      };
    } catch (error) {
      throw new Error(`Failed to get scenario with steps: ${error.message}`);
    }
  }

  // ------------------------------------------------------------
  // 🛠 Admin: Create
  // ------------------------------------------------------------

  /**
   * Create a new scenario record.
   * @async
   * @param {object} data - Scenario creation data.
   * @param {number} data.level_id - Associated level ID.
   * @param {string} data.title - Scenario title.
   * @param {string} data.description - Description of the scenario.
   * @param {string} [data.image_url] - Optional image URL.
   * @returns {Promise<ScenarioDTO>} The created scenario DTO.
   * @throws {Error} If creation fails.
   * @example
   * const scenario = await scenarioService.createScenario({
   *   level_id: 2,
   *   title: "Cybersecurity Training",
   *   description: "Simulated phishing defense exercise"
   * });
   */
  async createScenario(data) {
    try {
      const scenario = await this.scenarioRepository.create(data);
      return ScenarioDTO.fromEntity(scenario);
    } catch (error) {
      throw new Error('Failed to create scenario: ' + error.message);
    }
  }

  // ------------------------------------------------------------
  // 🔧 Admin: Update
  // ------------------------------------------------------------

  /**
   * Update an existing scenario by ID.
   * @async
   * @param {number} id - Scenario ID.
   * @param {object} data - Updated scenario fields.
   * @returns {Promise<ScenarioDTO|null>} Updated scenario DTO, or null if not found.
   * @throws {Error} If update fails.
   * @example
   * const updated = await scenarioService.updateScenario(3, { title: "Updated Scenario" });
   */
  async updateScenario(id, data) {
    try {
      const scenario = await this.scenarioRepository.update(id, data);
      return scenario ? ScenarioDTO.fromEntity(scenario) : null;
    } catch (error) {
      throw new Error(`Failed to update scenario with id ${id}: ${error.message}`);
    }
  }

  // ------------------------------------------------------------
  // ❌ Admin: Delete
  // ------------------------------------------------------------

  /**
   * Delete a scenario by its ID.
   * @async
   * @param {number} id - The scenario ID.
   * @returns {Promise<boolean>} True if deletion succeeded, false otherwise.
   * @throws {Error} If deletion fails.
   * @example
   * const success = await scenarioService.deleteScenario(4);
   */
  async deleteScenario(id) {
    try {
      return await this.scenarioRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete scenario with id ${id}: ${error.message}`);
    }
  }
}
