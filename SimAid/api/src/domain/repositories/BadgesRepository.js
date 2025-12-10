import { pool } from "../../config/db.js";
import BadgesEntity from "../entities/BadgesEntity.js";

export class BadgesRepository {
  async findAll() {
    const sql = `
      SELECT badge_id, level_id, name, description, icon_url
      FROM badges
      ORDER BY badge_id DESC;
    `;
    const [ rows ] = await pool.query(sql);
    return rows.map(row => new BadgesEntity(row));
  }

  async findById(id) {
    const sql = `
      SELECT badge_id, level_id, name, description, icon_url
      FROM badges
      WHERE badge_id = ?;
    `;
    const [ rows ] = await pool.query(sql, [id]);
    return rows.length ? new BadgesEntity(rows[0]) : null;
  }

async findByLevel(level_id) {
  const sql = `
    SELECT badge_id, level_id, name, description, icon_url
    FROM badges
    WHERE level_id = ?
    LIMIT 1;
  `;
  const [ rows ] = await pool.query(sql, [level_id]);
  return rows[0] || null;
}


  async create({ level_id, name, description, icon_url }) {
    const sql = `
      INSERT INTO badges (level_id, name, description, icon_url)
      VALUES (?, ?, ?, ?)
      RETURNING badge_id, level_id, name, description, icon_url;
    `;
    const [ rows ] = await pool.query(sql, [level_id, name, description, icon_url]);
    return rows.length ? new BadgesEntity(rows[0]) : null;
  }

  async update(id, { level_id, name, description, icon_url }) {
    const sql = `
      UPDATE badges
      SET level_id = ?, name = ?, description = ?, icon_url = ?
      WHERE badge_id = ?
      RETURNING badge_id, level_id, name, description, icon_url;
    `;
    const [ rows ] = await pool.query(sql, [level_id, name, description, icon_url, id]);
    return rows.length ? new BadgesEntity(rows[0]) : null;
  }

  async delete(id) {
    const [ rowCount ] = await pool.query('DELETE FROM badges WHERE badge_id = ?', [id]);
    return rowCount > 0;
  }

}
