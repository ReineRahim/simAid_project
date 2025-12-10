import { pool } from "../../config/db.js";
import UserLevelEntity from "../entities/UserLevelEntity.js";

export class UserLevelRepository {
  async findAll() {
    const sql = `
      SELECT user_level_id, user_id, level_id, unlocked, completed
      FROM user_levels
      ORDER BY user_id ASC, level_id ASC
    `;
    const [rows] = await pool.query(sql);
    return rows.map((r) => new UserLevelEntity(r));
  }

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

  async updateStatus(user_level_id, { unlocked, completed }) {
    const updateSql = `
      UPDATE user_levels
      SET unlocked = ?, completed = ?
      WHERE user_level_id = ?
      LIMIT 1
    `;
    const [result] = await pool.query(updateSql, [unlocked, completed, user_level_id]);
    if (result.affectedRows === 0) return null;
    return this.findById(user_level_id);
  }

  async upsertProgress({ user_id, level_id, unlocked, completed }) {
    // IMPORTANT: ensure there is a UNIQUE KEY on (user_id, level_id)
    //   ALTER TABLE user_levels ADD UNIQUE KEY uniq_user_level (user_id, level_id);
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

  async delete(user_level_id) {
    const [result] = await pool.query(
      `DELETE FROM user_levels WHERE user_level_id = ? LIMIT 1`,
      [user_level_id]
    );
    return result.affectedRows > 0;
  }
}
