import { pool } from "../../config/db.js";
import UserLevelEntity from "../entities/UserLevelEntity.js";

/**
 * Repository class responsible for managing user progress across levels in the `user_levels` table.
 *
 * Each record represents a user's state (unlocked/completed) for a particular level.
 * Provides CRUD and upsert functionality to support progress tracking and updating.
 */
export class UserLevelRepository {
  /**
   * Retrieves all user-level records, ordered by user and level ID.
   *
   * @async
   * @method findAll
   * @returns {Promise<UserLevelEntity[]>} A list of all user-level entities.
   * @example
   * const allProgress = await userLevelRepo.findAll();
   */
  async findAll() {
    const sql = `
      SELECT user_level_id, user_id, level_id, unlocked, completed
      FROM user_levels
      ORDER BY user_id ASC, level_id ASC
    `;
    const [rows] = await pool.query(sql);
    return rows.map((r) => new UserLevelEntity(r));
  }

  /**
   * Retrieves all level progress records for a specific user.
   *
   * @async
   * @method findByUser
   * @param {number} user_id - The ID of the user whose levels to retrieve.
   * @returns {Promise<UserLevelEntity[]>} A list of levels associated with the user.
   * @example
   * const userLevels = await userLevelRepo.findByUser(3);
   */
  async findByUser(user_id) {
    const sql = `
      SELECT user_level_id, user_id, level_id, unlocked, completed
      FROM user_levels
      WHERE user_id = ?
      ORDER BY level_id ASC
    `;
    const [rows] = await pool.query(sql, [user_id]);
    return rows.map((r) => new UserLevelEntity(r));
  }

  /**
   * Retrieves a single user-level record based on both user ID and level ID.
   *
   * @async
   * @method findByUserAndLevel
   * @param {number} user_id - The ID of the user.
   * @param {number} level_id - The ID of the level.
   * @returns {Promise<UserLevelEntity|null>} The matching record, or null if not found.
   * @example
   * const record = await userLevelRepo.findByUserAndLevel(2, 5);
   */
  async findByUserAndLevel(user_id, level_id) {
    const sql = `
      SELECT user_level_id, user_id, level_id, unlocked, completed
      FROM user_levels
      WHERE user_id = ? AND level_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [user_id, level_id]);
    return rows.length ? new UserLevelEntity(rows[0]) : null;
  }

  /**
   * Retrieves a user-level record by its unique ID.
   *
   * @async
   * @method findById
   * @param {number} user_level_id - The unique ID of the user-level record.
   * @returns {Promise<UserLevelEntity|null>} The corresponding user-level entity or null if not found.
   * @example
   * const record = await userLevelRepo.findById(15);
   */
  async findById(user_level_id) {
    const sql = `
      SELECT user_level_id, user_id, level_id, unlocked, completed
      FROM user_levels
      WHERE user_level_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [user_level_id]);
    return rows.length ? new UserLevelEntity(rows[0]) : null;
  }

  /**
   * Creates a new user-level record to track a user's progress on a level.
   *
   * @async
   * @method create
   * @param {object} params - User-level creation data.
   * @param {number} params.user_id - The ID of the user.
   * @param {number} params.level_id - The level ID.
   * @param {boolean} [params.unlocked=false] - Whether the level is unlocked.
   * @param {boolean} [params.completed=false] - Whether the level is completed.
   * @returns {Promise<UserLevelEntity>} The newly created user-level entity.
   * @example
   * const progress = await userLevelRepo.create({
   *   user_id: 4,
   *   level_id: 2,
   *   unlocked: true
   * });
   */
  async create({ user_id, level_id, unlocked = false, completed = false }) {
    const insertSql = `
      INSERT INTO user_levels (user_id, level_id, unlocked, completed)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(insertSql, [
      user_id,
      level_id,
      unlocked,
      completed,
    ]);
    return this.findById(result.insertId);
  }

  /**
   * Updates the unlocked/completed status of a user-level record.
   *
   * @async
   * @method updateStatus
   * @param {number} user_level_id - The unique ID of the user-level record.
   * @param {object} params - Updated progress flags.
   * @param {boolean} params.unlocked - Updated unlocked status.
   * @param {boolean} params.completed - Updated completion status.
   * @returns {Promise<UserLevelEntity|null>} The updated entity, or null if no record was updated.
   * @example
   * const updated = await userLevelRepo.updateStatus(8, {
   *   unlocked: true,
   *   completed: true
   * });
   */
  async updateStatus(user_level_id, { unlocked, completed }) {
    const updateSql = `
      UPDATE user_levels
      SET unlocked = ?, completed = ?
      WHERE user_level_id = ?
      LIMIT 1
    `;
    const [result] = await pool.query(updateSql, [
      unlocked,
      completed,
      user_level_id,
    ]);
    if (result.affectedRows === 0) return null;
    return this.findById(user_level_id);
  }

  /**
   * Inserts or updates a user’s progress for a level.
   *
   * If a record already exists for the user and level, it will be updated instead.
   * Requires a unique key constraint on `(user_id, level_id)` in the database.
   *
   * @async
   * @method upsertProgress
   * @param {object} params - User progress data.
   * @param {number} params.user_id - The user ID.
   * @param {number} params.level_id - The level ID.
   * @param {boolean} params.unlocked - Whether the level is unlocked.
   * @param {boolean} params.completed - Whether the level is completed.
   * @returns {Promise<UserLevelEntity>} The inserted or updated user-level entity.
   * @example
   * const progress = await userLevelRepo.upsertProgress({
   *   user_id: 2,
   *   level_id: 3,
   *   unlocked: true,
   *   completed: false
   * });
   */
  async upsertProgress({ user_id, level_id, unlocked, completed }) {
    // Ensure UNIQUE KEY (user_id, level_id) exists in table
    const sql = `
      INSERT INTO user_levels (user_id, level_id, unlocked, completed)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        unlocked = VALUES(unlocked),
        completed = VALUES(completed)
    `;
    await pool.query(sql, [user_id, level_id, unlocked, completed]);
    return this.findByUserAndLevel(user_id, level_id);
  }

  /**
   * Deletes a user-level record from the database.
   *
   * @async
   * @method delete
   * @param {number} user_level_id - The ID of the record to delete.
   * @returns {Promise<boolean>} True if deletion succeeded, false otherwise.
   * @example
   * const removed = await userLevelRepo.delete(12);
   */
  async delete(user_level_id) {
    const [result] = await pool.query(
      `DELETE FROM user_levels WHERE user_level_id = ? LIMIT 1`,
      [user_level_id]
    );
    return result.affectedRows > 0;
  }
}
