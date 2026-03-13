import ScenarioStepDTO from "../domain/dto/ScenarioStepDTO.js";

/**
 * Service layer for managing scenario steps.
 *
 * Handles business logic for retrieving, creating, updating,
 * and deleting scenario step records. Converts raw repository
 * entities into DTOs (`ScenarioStepDTO`) before returning them
 * to controllers.
 *
 * @class ScenarioStepService
 */
export class ScenarioStepService {
  /**
   * Creates an instance of ScenarioStepService.
   * @param {import("../domain/repositories/ScenarioStepRepository.js").ScenarioStepRepository} scenarioStepRepository - Repository used for scenario step data operations.
   */
  constructor(scenarioStepRepository) {
    this.scenarioStepRepository = scenarioStepRepository;
  }

  // 📋 Get all steps (mainly admin/debug)

  /**
   * Retrieve all scenario steps.
   * Typically used by admins for debugging or management.
   * @async
   * @returns {Promise<ScenarioStepDTO[]>} List of all scenario steps.
   * @throws {Error} If retrieval fails.
   * @example
   * const steps = await scenarioStepService.listScenarioSteps();
   */
  async listScenarioSteps() {
    try {
      const steps = await this.scenarioStepRepository.findAll();
      return steps.map(ScenarioStepDTO.fromEntity);
    } catch (error) {
      throw new Error("Failed to list scenario steps: " + error.message);
    }
  }

  // 🔍 Get one step by ID

  /**
   * Retrieve a single scenario step by its ID.
   * @async
   * @param {number} id - The ID of the step.
   * @returns {Promise<ScenarioStepDTO|null>} The step DTO or null if not found.
   * @throws {Error} If retrieval fails.
   * @example
   * const step = await scenarioStepService.getScenarioStep(5);
   */
  async getScenarioStep(id) {
    try {
      const step = await this.scenarioStepRepository.findById(id);
      return step ? ScenarioStepDTO.fromEntity(step) : null;
    } catch (error) {
      throw new Error(`Failed to get scenario step with id ${id}: ${error.message}`);
    }
  }

  // 🧩 Get all steps for a specific scenario (ordered)

  /**
   * Retrieve all steps belonging to a specific scenario, ordered by step order.
   * @async
   * @param {number} scenario_id - The scenario ID.
   * @returns {Promise<ScenarioStepDTO[]>} Ordered list of steps for the scenario.
   * @throws {Error} If retrieval fails.
   * @example
   * const steps = await scenarioStepService.getStepsByScenario(2);
   */
  async getStepsByScenario(scenario_id) {
    try {
      const steps = await this.scenarioStepRepository.findByScenario(scenario_id);
      return steps.map(ScenarioStepDTO.fromEntity);
    } catch (error) {
      throw new Error(`Failed to get steps for scenario ${scenario_id}: ${error.message}`);
    }
  }

  // 🏗️ Create a new MCQ step

  /**
   * Create a new multiple-choice question (MCQ) step.
   * @async
   * @param {object} data - Step creation data.
   * @param {number} data.scenario_id - ID of the associated scenario.
   * @param {number} data.step_order - Order of the step in the scenario.
   * @param {string} data.question_text - The question text.
   * @param {object} data.options - Available answer choices.
   * @param {string} data.correct_action - The correct answer (e.g., 'A', 'B', 'C', 'D').
   * @param {string} [data.feedback_message] - Optional feedback message.
   * @returns {Promise<ScenarioStepDTO>} The created step DTO.
   * @throws {Error} If creation fails.
   * @example
   * const step = await scenarioStepService.createScenarioStep({
   *   scenario_id: 1,
   *   step_order: 2,
   *   question_text: "What is 2 + 2?",
   *   options: { A: "3", B: "4", C: "5", D: "6" },
   *   correct_action: "B",
   *   feedback_message: "The correct answer is 4."
   * });
   */
  async createScenarioStep(data) {
    try {
      const step = await this.scenarioStepRepository.create(data);
      return ScenarioStepDTO.fromEntity(step);
    } catch (error) {
      throw new Error("Failed to create scenario step: " + error.message);
    }
  }

  // 🔧 Update step (change question, options, etc.)

  /**
   * Update an existing scenario step by ID.
   * Allows modification of question text, options, or feedback.
   * @async
   * @param {number} id - The ID of the step to update.
   * @param {object} data - Updated step fields.
   * @param {number} [data.step_order] - Updated order of the step.
   * @param {string} [data.question_text] - Updated question text.
   * @param {object} [data.options] - Updated answer options.
   * @param {string} [data.correct_action] - Updated correct answer.
   * @param {string} [data.feedback_message] - Updated feedback message.
   * @returns {Promise<ScenarioStepDTO|null>} The updated step DTO, or null if not found.
   * @throws {Error} If update fails.
   * @example
   * const updated = await scenarioStepService.updateScenarioStep(3, {
   *   question_text: "What is the capital of France?",
   *   options: { A: "Berlin", B: "Madrid", C: "Paris", D: "Rome" },
   *   correct_action: "C"
   * });
   */
  async updateScenarioStep(id, data) {
    try {
      const step = await this.scenarioStepRepository.update(id, data);
      return step ? ScenarioStepDTO.fromEntity(step) : null;
    } catch (error) {
      throw new Error(`Failed to update scenario step with id ${id}: ${error.message}`);
    }
  }

  // ❌ Delete step

  /**
   * Delete a scenario step by ID.
   * @async
   * @param {number} id - The step ID.
   * @returns {Promise<boolean>} True if deleted successfully, false otherwise.
   * @throws {Error} If deletion fails.
   * @example
   * const success = await scenarioStepService.deleteScenarioStep(4);
   */
  async deleteScenarioStep(id) {
    try {
      return await this.scenarioStepRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete scenario step with id ${id}: ${error.message}`);
    }
  }
}
