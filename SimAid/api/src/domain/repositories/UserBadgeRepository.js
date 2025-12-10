import { pool } from "../../config/db.js";
import UserBadgeEntity from "../entities/UserBadgeEntity.js";

export class UserBadgeRepository {
  async findAll() {
    const sql = `
      SELECT user_badge_id, user_id, badge_id, earned_at
      FROM user_badges
      ORDER BY user_badge_id DESC
    `;
    const [rows] = await pool.query(sql);
    return rows.map(row => new UserBadgeEntity(row));
  }

  async findByUser(user_id) {
    const sql = `
      SELECT user_badge_id, user_id, badge_id, earned_at
      FROM user_badges
      WHERE user_id = ?
      ORDER BY earned_at DESC
    `;
    const [rows] = await pool.query(sql, [user_id]);
    return rows.map(row => new UserBadgeEntity(row));
  }

  async findByUserAndBadge(user_id, badge_id) {
    const sql = `
      SELECT user_badge_id, user_id, badge_id, earned_at
      FROM user_badges
      WHERE user_id = ? AND badge_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [user_id, badge_id]);
    return rows.length ? new UserBadgeEntity(rows[0]) : null;
  }

  async create({ user_id, badge_id, earned_at }) {
    // Let MySQL stamp the time unless you explicitly pass one
    if (earned_at) {
      const sql = `
        INSERT INTO user_badges (user_id, badge_id, earned_at)
        VALUES (?, ?, ?)
      `;
      const [result] = await pool.query(sql, [user_id, badge_id, earned_at]);
      return new UserBadgeEntity({
        user_badge_id: result.insertId,
        user_id,
        badge_id,
        earned_at,
      });
    } else {
      const sql = `
        INSERT INTO user_badges (user_id, badge_id, earned_at)
        VALUES (?, ?, NOW())
      `;
      const [result] = await pool.query(sql, [user_id, badge_id]);

      // if you want the exact timestamp from DB, re-fetch; otherwise construct:
      return new UserBadgeEntity({
        user_badge_id: result.insertId,
        user_id,
        badge_id,
        earned_at: new Date(), // close enough without extra roundtrip
      });
    }
  }

  async delete(user_badge_id) {
    const sql = `DELETE FROM user_badges WHERE user_badge_id = ? LIMIT 1`;
    const [result] = await pool.query(sql, [user_badge_id]);
    return result.affectedRows > 0;
  }
}
