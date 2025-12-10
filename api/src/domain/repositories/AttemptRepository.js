import { pool } from "../../config/db.js";
import AttemptEntity from "../entities/AttemptEntity.js";

/**
 * Repository class responsible for managing database operations related to user attempts.
 *
 * Handles queries for retrieving, inserting, updating, and counting attempt records.
 * Each method returns raw data wrapped as an {@link AttemptEntity} instance.
 */
export class AttemptRepository {
  /**
   * Retrieves all attempts from the database.
   *
   * @async
   * @method findAll
   * @returns {Promise<AttemptEntity[]>} A list of all attempts ordered by completion time.
   * @example
   * const attempts = await attemptRepo.findAll();
   */
  async findAll() {
    const sql = `
      SELECT attempt_id, user_id, scenario_id, score, completed_at
      FROM attempts
      ORDER BY completed_at DESC;
    `;
    const [rows] = await pool.query(sql);
    return rows.map(row => new AttemptEntity(row));
  }

  /**
   * Finds a specific attempt by its ID.
   *
   * @async
   * @method findById
   * @param {number} id - The ID of the attempt to find.
   * @returns {Promise<AttemptEntity|null>} The matching attempt or null if not found.
   * @example
   * const attempt = await attemptRepo.findById(10);
   */
  async findById(id) {
    const sql = `
      SELECT attempt_id, user_id, scenario_id, score, completed_at
      FROM attempts
      WHERE attempt_id = ?;
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows.length ? new AttemptEntity(rows[0]) : null;
  }

  /**
   * Retrieves an attempt made by a specific user for a given scenario.
   *
   * @async
   * @method findByUserAndScenario
   * @param {number} user_id - The user ID.
   * @param {number} scenario_id - The scenario ID.
   * @returns {Promise<AttemptEntity|null>} The attempt or null if none exists.
   * @example
   * const attempt = await attemptRepo.findByUserAndScenario(1, 5);
   */
  async findByUserAndScenario(user_id, scenario_id) {
    const sql = `
      SELECT attempt_id, user_id, scenario_id, score, completed_at
      FROM attempts
      WHERE user_id = ? AND scenario_id = ?;
    `;
    const [rows] = await pool.query(sql, [user_id, scenario_id]);
    return rows.length ? new AttemptEntity(rows[0]) : null;
  }

  /**
   * Inserts or updates a user’s best score for a scenario.
   * If an attempt already exists, the higher score is kept and the timestamp updated.
   *
   * @async
   * @method upsertBestScore
   * @param {object} params - Score update parameters.
   * @param {number} params.user_id - The user ID.
   * @param {number} params.scenario_id - The scenario ID.
   * @param {number} params.score - The score achieved.
   * @returns {Promise<AttemptEntity|null>} The updated or inserted attempt.
   * @example
   * const attempt = await attemptRepo.upsertBestScore({ user_id: 1, scenario_id: 3, score: 95 });
   */
  async upsertBestScore({ user_id, scenario_id, score }) {
    const sql = `
      INSERT INTO attempts (user_id, scenario_id, score)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        score = GREATEST(score, VALUES(score)),
        completed_at = CURRENT_TIMESTAMP;
    `;
    await pool.query(sql, [user_id, scenario_id, score]);

    const [rows] = await pool.query(
      `SELECT attempt_id, user_id, scenario_id, score, completed_at
       FROM attempts
       WHERE user_id = ? AND scenario_id = ?`,
      [user_id, scenario_id]
    );
    return rows.length ? new AttemptEntity(rows[0]) : null;
  }

  /**
   * Counts the number of perfect attempts (score = 100) by a user in a specific level.
   *
   * @async
   * @method countPerfectByUserInLevel
   * @param {number} user_id - The user ID.
   * @param {number} level_id - The level ID.
   * @returns {Promise<number>} The number of perfect attempts.
   * @example
   * const perfectCount = await attemptRepo.countPerfectByUserInLevel(2, 4);
   */
  async countPerfectByUserInLevel(user_id, level_id) {
    const sql = `
      SELECT COUNT(*) AS perfect_count
      FROM attempts sa
      JOIN scenarios s ON s.scenario_id = sa.scenario_id
      WHERE sa.user_id = ? AND s.level_id = ? AND sa.score = 100;
    `;
    const [rows] = await pool.query(sql, [user_id, level_id]);
    return parseInt(rows[0].perfect_count || 0, 10);
  }

  /**
   * Counts the total number of scenarios available in a given level.
   *
   * @async
   * @method countScenariosInLevel
   * @param {number} level_id - The level ID.
   * @returns {Promise<number>} Total number of scenarios in that level.
   * @example
   * const total = await attemptRepo.countScenariosInLevel(1);
   */
  async countScenariosInLevel(level_id) {
    const sql = `SELECT COUNT(*) AS total FROM scenarios WHERE level_id = ?;`;
    const [rows] = await pool.query(sql, [level_id]);
    return parseInt(rows[0].total || 0, 10);
  }

  /**
   * Retrieves all user attempts and scores for a specific level.
   *
   * @async
   * @method getUserAttemptsByLevel
   * @param {number} user_id - The user ID.
   * @param {number} level_id - The level ID.
   * @returns {Promise<Array<{scenario_id: number, score: number}>>}
   * A list of scenario IDs and corresponding scores.
   * @example
   * const attempts = await attemptRepo.getUserAttemptsByLevel(5, 2);
   */
  async getUserAttemptsByLevel(user_id, level_id) {
    const sql = `
      SELECT a.scenario_id, a.score
      FROM attempts a
      JOIN scenarios s ON a.scenario_id = s.scenario_id
      WHERE a.user_id = ? AND s.level_id = ?;
    `;
    const [rows] = await pool.query(sql, [user_id, level_id]);
    return rows;
  }
}
