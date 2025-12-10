// src/domain/repositories/ScenarioRepository.js
import { pool } from "../../config/db.js";
import ScenarioEntity from "../entities/ScenarioEntity.js";

export class ScenarioRepository {
  async findAll() {
    const sql = `
      SELECT scenario_id, level_id, title, description, image_url
      FROM scenarios
      ORDER BY scenario_id DESC;
    `;
    const [rows] = await pool.query(sql);
    return rows.map(row => new ScenarioEntity(row));
  }

  async findById(id) {
    const sql = `
      SELECT scenario_id, level_id, title, description, image_url
      FROM scenarios
      WHERE scenario_id = ?;
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows.length ? new ScenarioEntity(rows[0]) : null;
  }
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

  async create({ level_id, title, description, image_url }) {
    const insertSql = `
      INSERT INTO scenarios (level_id, title, description, image_url)
      VALUES (?, ?, ?, ?);
    `;
    const [result] = await pool.query(insertSql, [level_id, title, description, image_url]);
    return this.findById(result.insertId);
  }

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

  async delete(id) {
    const [result] = await pool.query(
      "DELETE FROM scenarios WHERE scenario_id = ?",
      [id]
    );
    return result.affectedRows > 0; // ✅ MySQL
  }

  async countByLevel(level_id) {
    const sql = `SELECT COUNT(*) AS total FROM scenarios WHERE level_id = ?;`;
    const [rows] = await pool.query(sql, [level_id]);
    return parseInt(rows[0].total, 10);
  }

}
