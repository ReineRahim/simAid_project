import ScenarioDTO from '../domain/dto/ScenarioDTO.js';

export class ScenarioService {
  constructor(scenarioRepository) {
    this.scenarioRepository = scenarioRepository;
  }

  // ------------------------------------------------------------
  // 📋 List all scenarios
  // ------------------------------------------------------------
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
  async getScenario(id) {
    try {
      const scenario = await this.scenarioRepository.findById(id);
      return scenario ? ScenarioDTO.fromEntity(scenario) : null;
    } catch (error) {
      throw new Error(`Failed to get scenario with id ${id}: ${error.message}`);
    }
  }

  async listByLevel(levelId) {
    if (!this.scenarioRepository || typeof this.scenarioRepository.listByLevel !== "function") {
      throw new Error("ScenarioRepository not initialized properly");
    }

    return this.scenarioRepository.listByLevel(levelId);
  }


  // ------------------------------------------------------------
  // 📚 Get all scenarios in a level
  // ------------------------------------------------------------
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
  async getScenarioWithSteps(scenarioId, scenarioStepService) {
    try {
      const scenario = await this.scenarioRepository.findById(scenarioId);
      if (!scenario) return null;

      // 🔹 Use getStepsByScenario (correct method name)
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
  async deleteScenario(id) {
    try {
      return await this.scenarioRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete scenario with id ${id}: ${error.message}`);
    }
  }
}

