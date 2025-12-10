import { pool } from "../../config/db.js";
import AttemptEntity from "../entities/AttemptEntity.js";

export class AttemptRepository {
  async findAll() {
    const sql = `
      SELECT attempt_id, user_id, scenario_id, score, completed_at
      FROM attempts
      ORDER BY completed_at DESC;
    `;
    const [rows] = await pool.query(sql);
    return rows.map(row => new AttemptEntity(row));
  }

  async findById(id) {
    const sql = `
      SELECT attempt_id, user_id, scenario_id, score, completed_at
      FROM attempts
      WHERE attempt_id = ?;
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows.length ? new AttemptEntity(rows[0]) : null;
  }

  async findByUserAndScenario(user_id, scenario_id) {
    const sql = `
      SELECT attempt_id, user_id, scenario_id, score, completed_at
      FROM attempts
      WHERE user_id = ? AND scenario_id = ?;
    `;
    const [rows] = await pool.query(sql, [user_id, scenario_id]);
    return rows.length ? new AttemptEntity(rows[0]) : null;
  }

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

  async countScenariosInLevel(level_id) {
    const sql = `SELECT COUNT(*) AS total FROM scenarios WHERE level_id = ?;`;
    const [rows] = await pool.query(sql, [level_id]);
    return parseInt(rows[0].total || 0, 10);
  }

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
