// src/repositories/mysql/LevelRepository.js
import { pool } from "../../config/db.js";
import LevelEntity from "../entities/LevelEntity.js";

export class LevelRepository {
  async findAll() {
    const sql = `
      SELECT level_id, title, description, difficulty_order
      FROM levels
      ORDER BY difficulty_order ASC
    `;
    const [rows] = await pool.query(sql);
    return rows.map(r => new LevelEntity(r));
  }

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

  async create({ title, description, difficulty_order }) {
    const insertSql = `
      INSERT INTO levels (title, description, difficulty_order)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.query(insertSql, [title, description, difficulty_order]);
    return this.findById(result.insertId);
  }

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

  async delete(id) {
    const [result] = await pool.query(`DELETE FROM levels WHERE level_id = ? LIMIT 1`, [id]);
    return result.affectedRows > 0;
  }
}
