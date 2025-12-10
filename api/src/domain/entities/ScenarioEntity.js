/**
 * Entity class representing a scenario record in the database.
 *
 * A scenario defines a specific challenge or learning situation
 * associated with a level, including its descriptive content and optional media.
 */
export default class ScenarioEntity {
  /**
   * @param {object} params - Scenario entity properties.
   * @param {number} params.scenario_id - Unique identifier for the scenario.
   * @param {number} params.level_id - ID of the level this scenario belongs to.
   * @param {string} params.title - Title or short name of the scenario.
   * @param {string} [params.description] - Optional detailed description of the scenario.
   * @param {string} [params.image_url] - Optional URL of an image representing the scenario.
   */
  constructor({ scenario_id, level_id, title, description, image_url }) {
    /**
     * Unique ID of the scenario.
     * @type {number}
     */
    this.scenario_id = scenario_id;

    /**
     * ID of the level this scenario is associated with.
     * @type {number}
     */
    this.level_id = level_id;

    /**
     * The title or short name of the scenario.
     * @type {string}
     */
    this.title = title;

    /**
     * Detailed description or context for the scenario.
     * @type {string|undefined}
     */
    this.description = description;

    /**
     * Optional image URL representing the scenario visually.
     * @type {string|undefined}
     */
    this.image_url = image_url;
  }
}
