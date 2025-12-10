/**
 * Data Transfer Object (DTO) representing a scenario record.
 *
 * Provides a structured format for transferring scenario data
 * between different layers (e.g., database, services, controllers).
 */
export default class ScenarioDTO {
  /**
   * @param {object} params - Scenario properties.
   * @param {number} params.scenario_id - Unique identifier of the scenario.
   * @param {number} params.level_id - Identifier of the level this scenario belongs to.
   * @param {string} params.title - Title of the scenario.
   * @param {string} [params.description] - Detailed description of the scenario.
   * @param {string} [params.image_url] - Optional image URL representing the scenario.
   */
  constructor({ scenario_id, level_id, title, description, image_url }) {
    this.scenario_id = scenario_id;
    this.level_id = level_id;
    this.title = title;
    this.description = description;
    this.image_url = image_url;
  }

  /**
   * Creates a `ScenarioDTO` instance from a plain entity object.
   *
   * @static
   * @method fromEntity
   * @param {object} entity - The scenario entity object (e.g., a database record).
   * @returns {ScenarioDTO} A new `ScenarioDTO` instance.
   * @example
   * const dto = ScenarioDTO.fromEntity(dbRecord);
   */
  static fromEntity(entity) {
    return new ScenarioDTO(entity);
  }
}
