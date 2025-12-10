// src/domain/repositories/ScenarioRepository.js
import { pool } from "../../config/db.js";
import ScenarioEntity from "../entities/ScenarioEntity.js";

/**
 * Repository class responsible for managing CRUD operations on the `scenarios` table.
 *
 * Handles scenario persistence, retrieval, updates, and deletion.
 * All results are returned as {@link ScenarioEntity} instances for consistency across the domain layer.
 */
export class ScenarioRepository {
  /**
   * Retrieves all scenarios from the database, ordered by ID (descending).
   *
   * @async
   * @method findAll
   * @returns {Promise<ScenarioEntity[]>} A list of all scenarios.
   * @example
   * const scenarios = await scenarioRepo.findAll();
   */
  async findAll() {
    const sql = `
      SELECT scenario_id, level_id, title, description, image_url
      FROM scenarios
      ORDER BY scenario_id DESC;
    `;
    const [rows] = await pool.query(sql);
    return rows.map(row => new ScenarioEntity(row));
  }

  /**
   * Retrieves a scenario by its unique ID.
   *
   * @async
   * @method findById
   * @param {number} id - The scenario ID to search for.
   * @returns {Promise<ScenarioEntity|null>} The matching scenario or null if not found.
   * @example
   * const scenario = await scenarioRepo.findById(12);
   */
  async findById(id) {
    const sql = `
      SELECT scenario_id, level_id, title, description, image_url
      FROM scenarios
      WHERE scenario_id = ?;
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows.length ? new ScenarioEntity(rows[0]) : null;
  }

  /**
   * Lists all scenarios belonging to a specific level.
   *
   * @async
   * @method listByLevel
   * @param {number} level_id - The level ID to filter by.
   * @returns {Promise<ScenarioEntity[]>} A list of scenarios belonging to the given level.
   * @example
   * const levelScenarios = await scenarioRepo.listByLevel(2);
   */
  async listByLevel(level_id) {
    const sql = `
      SELECT scenario_id, level_id, title, description, image_url
      FROM scenarios
      WHERE level_id = ?
      ORDER BY scenario_id ASC;
    `;
    const [rows] = await pool.query(sql, [level_id]);
    return rows.map(row => new ScenarioEntity(row));
  }

  /**
   * Creates a new scenario record.
   *
   * @async
   * @method create
   * @param {object} params - Scenario creation properties.
   * @param {number} params.level_id - ID of the level this scenario belongs to.
   * @param {string} params.title - Title of the scenario.
   * @param {string} [params.description] - Optional scenario description.
   * @param {string} [params.image_url] - Optional URL to an image representing the scenario.
   * @returns {Promise<ScenarioEntity>} The newly created scenario entity.
   * @example
   * const newScenario = await scenarioRepo.create({
   *   level_id: 3,
   *   title: "Emergency Response Training",
   *   description: "Handle simulated crisis scenarios effectively.",
   *   image_url: "/images/scenario3.png"
   * });
   */
  async create({ level_id, title, description, image_url }) {
    const insertSql = `
      INSERT INTO scenarios (level_id, title, description, image_url)
      VALUES (?, ?, ?, ?);
    `;
    const [result] = await pool.query(insertSql, [level_id, title, description, image_url]);
    return this.findById(result.insertId);
  }

  /**
   * Updates an existing scenario record.
   *
   * @async
   * @method update
   * @param {number} id - The scenario ID to update.
   * @param {object} params - Updated scenario fields.
   * @param {number} params.level_id - Associated level ID.
   * @param {string} params.title - Updated title.
   * @param {string} [params.description] - Updated description.
   * @param {string} [params.image_url] - Updated image URL.
   * @returns {Promise<ScenarioEntity|null>} The updated scenario or null if not found.
   * @example
   * const updatedScenario = await scenarioRepo.update(5, {
   *   level_id: 2,
   *   title: "Advanced Safety Drill",
   *   description: "New procedure updates included.",
   *   image_url: "/assets/scenario5.png"
   * });
   */
  async update(id, { level_id, title, description, image_url }) {
    const updateSql = `
      UPDATE scenarios
      SET level_id = ?, title = ?, description = ?, image_url = ?
      WHERE scenario_id = ?;
    `;
    const [result] = await pool.query(updateSql, [level_id, title, description, image_url, id]);
    if (result.affectedRows === 0) return null;
    return this.findById(id);
  }

  /**
   * Deletes a scenario record by its ID.
   *
   * @async
   * @method delete
   * @param {number} id - The scenario ID to delete.
   * @returns {Promise<boolean>} True if the record was deleted, otherwise false.
   * @example
   * const deleted = await scenarioRepo.delete(7);
   */
  async delete(id) {
    const [result] = await pool.query(
      "DELETE FROM scenarios WHERE scenario_id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Counts the total number of scenarios within a given level.
   *
   * @async
   * @method countByLevel
   * @param {number} level_id - The level ID to count scenarios for.
   * @returns {Promise<number>} The total number of scenarios in the specified level.
   * @example
   * const count = await scenarioRepo.countByLevel(4);
   */
  async countByLevel(level_id) {
    const sql = `SELECT COUNT(*) AS total FROM scenarios WHERE level_id = ?;`;
    const [rows] = await pool.query(sql, [level_id]);
    return parseInt(rows[0].total, 10);
  }
}
