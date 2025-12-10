// src/repositories/mysql/LevelRepository.js
import { pool } from "../../config/db.js";
import LevelEntity from "../entities/LevelEntity.js";

/**
 * Repository class for managing CRUD operations on the `levels` table.
 *
 * Handles level data persistence, retrieval, and update logic,
 * returning all results as {@link LevelEntity} instances for consistency.
 */
export class LevelRepository {
  /**
   * Retrieves all levels ordered by their difficulty order (ascending).
   *
   * @async
   * @method findAll
   * @returns {Promise<LevelEntity[]>} A list of all level entities.
   * @example
   * const levels = await levelRepo.findAll();
   */
  async findAll() {
    const sql = `
      SELECT level_id, title, description, difficulty_order
      FROM levels
      ORDER BY difficulty_order ASC
    `;
    const [rows] = await pool.query(sql);
    return rows.map(r => new LevelEntity(r));
  }

  /**
   * Finds the next level’s ID that comes after the current level.
   *
   * @async
   * @method findNextLevelId
   * @param {number} currentLevelId - The current level ID.
   * @returns {Promise<number|null>} The next level ID or null if none exists.
   * @example
   * const nextId = await levelRepo.findNextLevelId(2);
   */
  async findNextLevelId(currentLevelId) {
    const [rows] = await pool.query(
      `SELECT MIN(level_id) AS next_level
         FROM levels
        WHERE level_id > ?`,
      [currentLevelId]
    );
    const next = rows?.[0]?.next_level;
    return next != null ? Number(next) : null;
  }

  /**
   * Retrieves a level by its ID.
   *
   * @async
   * @method findById
   * @param {number} id - The ID of the level to retrieve.
   * @returns {Promise<LevelEntity|null>} The matching level or null if not found.
   * @example
   * const level = await levelRepo.findById(1);
   */
  async findById(id) {
    const sql = `
      SELECT level_id, title, description, difficulty_order
      FROM levels
      WHERE level_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows.length ? new LevelEntity(rows[0]) : null;
  }

  /**
   * Creates a new level record in the database.
   *
   * @async
   * @method create
   * @param {object} params - Level creation parameters.
   * @param {string} params.title - Title or name of the level.
   * @param {string} [params.description] - Optional description of the level.
   * @param {number} params.difficulty_order - The difficulty or order ranking of the level.
   * @returns {Promise<LevelEntity>} The newly created level entity.
   * @example
   * const newLevel = await levelRepo.create({
   *   title: "Advanced",
   *   description: "High difficulty stage",
   *   difficulty_order: 3
   * });
   */
  async create({ title, description, difficulty_order }) {
    const insertSql = `
      INSERT INTO levels (title, description, difficulty_order)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.query(insertSql, [title, description, difficulty_order]);
    return this.findById(result.insertId);
  }

  /**
   * Updates an existing level record.
   *
   * @async
   * @method update
   * @param {number} id - The ID of the level to update.
   * @param {object} params - Updated level data.
   * @param {string} params.title - New level title.
   * @param {string} [params.description] - Updated description.
   * @param {number} params.difficulty_order - New difficulty or sequence order.
   * @returns {Promise<LevelEntity|null>} The updated level entity, or null if not found.
   * @example
   * const updated = await levelRepo.update(2, {
   *   title: "Expert Mode",
   *   description: "Updated description",
   *   difficulty_order: 4
   * });
   */
  async update(id, { title, description, difficulty_order }) {
    const updateSql = `
      UPDATE levels
      SET title = ?, description = ?, difficulty_order = ?
      WHERE level_id = ?
      LIMIT 1
    `;
    const [result] = await pool.query(updateSql, [title, description, difficulty_order, id]);
    if (result.affectedRows === 0) return null;
    return this.findById(id);
  }

  /**
   * Deletes a level record by its ID.
   *
   * @async
   * @method delete
   * @param {number} id - The ID of the level to delete.
   * @returns {Promise<boolean>} True if deletion succeeded, false otherwise.
   * @example
   * const deleted = await levelRepo.delete(5);
   */
  async delete(id) {
    const [result] = await pool.query(`DELETE FROM levels WHERE level_id = ? LIMIT 1`, [id]);
    return result.affectedRows > 0;
  }
}
