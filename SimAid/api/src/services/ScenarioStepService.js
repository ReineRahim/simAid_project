import ScenarioStepDTO from "../domain/dto/ScenarioStepDTO.js";

export class ScenarioStepService {
  constructor(scenarioStepRepository) {
    this.scenarioStepRepository = scenarioStepRepository;
  }

  // 📋 Get all steps (mainly admin/debug)
  async listScenarioSteps() {
    try {
      const steps = await this.scenarioStepRepository.findAll();
      return steps.map(ScenarioStepDTO.fromEntity);
    } catch (error) {
      throw new Error("Failed to list scenario steps: " + error.message);
    }
  }

  // 🔍 Get one step by ID
  async getScenarioStep(id) {
    try {
      const step = await this.scenarioStepRepository.findById(id);
      return step ? ScenarioStepDTO.fromEntity(step) : null;
    } catch (error) {
      throw new Error(`Failed to get scenario step with id ${id}: ${error.message}`);
    }
  }

  // 🧩 Get all steps for a specific scenario (ordered)
  async getStepsByScenario(scenario_id) {
    try {
      const steps = await this.scenarioStepRepository.findByScenario(scenario_id);
      return steps.map(ScenarioStepDTO.fromEntity);
    } catch (error) {
      throw new Error(`Failed to get steps for scenario ${scenario_id}: ${error.message}`);
    }
  }

  // 🏗️ Create a new MCQ step
  async createScenarioStep(data) {
    try {
      const step = await this.scenarioStepRepository.create(data);
      return ScenarioStepDTO.fromEntity(step);
    } catch (error) {
      throw new Error("Failed to create scenario step: " + error.message);
    }
  }

  // 🔧 Update step (change question, options, etc.)
  async updateScenarioStep(id, data) {
    try {
      const step = await this.scenarioStepRepository.update(id, data);
      return step ? ScenarioStepDTO.fromEntity(step) : null;
    } catch (error) {
      throw new Error(`Failed to update scenario step with id ${id}: ${error.message}`);
    }
  }

  // ❌ Delete step
  async deleteScenarioStep(id) {
    try {
      return await this.scenarioStepRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete scenario step with id ${id}: ${error.message}`);
    }
  }
}
