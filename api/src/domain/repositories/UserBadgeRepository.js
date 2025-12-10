import { pool } from "../../config/db.js";
import UserBadgeEntity from "../entities/UserBadgeEntity.js";

/**
 * Repository class for managing user-badge relationships in the `user_badges` table.
 *
 * Each record represents a badge earned by a specific user.
 * Provides CRUD operations and convenience queries for finding badges by user or badge ID.
 */
export class UserBadgeRepository {
  /**
   * Retrieves all user-badge records from the database.
   *
   * @async
   * @method findAll
   * @returns {Promise<UserBadgeEntity[]>} A list of all user-badge entities, ordered by most recent.
   * @example
   * const allUserBadges = await userBadgeRepo.findAll();
   */
  async findAll() {
    const sql = `
      SELECT user_badge_id, user_id, badge_id, earned_at
      FROM user_badges
      ORDER BY user_badge_id DESC
    `;
    const [rows] = await pool.query(sql);
    return rows.map(row => new UserBadgeEntity(row));
  }

  /**
   * Retrieves all badges earned by a specific user.
   *
   * @async
   * @method findByUser
   * @param {number} user_id - The ID of the user.
   * @returns {Promise<UserBadgeEntity[]>} A list of badges earned by the user, ordered by `earned_at`.
   * @example
   * const userBadges = await userBadgeRepo.findByUser(5);
   */
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

  /**
   * Finds a specific user-badge record by user ID and badge ID.
   *
   * @async
   * @method findByUserAndBadge
   * @param {number} user_id - The user ID.
   * @param {number} badge_id - The badge ID.
   * @returns {Promise<UserBadgeEntity|null>} The matching record or null if not found.
   * @example
   * const existingBadge = await userBadgeRepo.findByUserAndBadge(2, 10);
   */
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

  /**
   * Creates a new record representing a badge earned by a user.
   * 
   * If no `earned_at` value is provided, the database will automatically set it to `NOW()`.
   *
   * @async
   * @method create
   * @param {object} params - User-badge creation data.
   * @param {number} params.user_id - The ID of the user earning the badge.
   * @param {number} params.badge_id - The ID of the badge earned.
   * @param {string|Date} [params.earned_at] - Optional timestamp of when the badge was earned.
   * @returns {Promise<UserBadgeEntity>} The newly created user-badge entity.
   * @example
   * const earnedBadge = await userBadgeRepo.create({
   *   user_id: 1,
   *   badge_id: 4
   * });
   */
  async create({ user_id, badge_id, earned_at }) {
    // Use explicit earned_at if provided, otherwise let MySQL auto-stamp
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

      // Optionally, re-fetch exact DB timestamp — here we approximate with current time.
      return new UserBadgeEntity({
        user_badge_id: result.insertId,
        user_id,
        badge_id,
        earned_at: new Date(),
      });
    }
  }

  /**
   * Deletes a user-badge record from the database by its unique ID.
   *
   * @async
   * @method delete
   * @param {number} user_badge_id - The ID of the user-badge record to delete.
   * @returns {Promise<boolean>} True if the record was successfully deleted, otherwise false.
   * @example
   * const deleted = await userBadgeRepo.delete(12);
   * if (deleted) console.log("User badge removed successfully.");
   */
  async delete(user_badge_id) {
    const sql = `DELETE FROM user_badges WHERE user_badge_id = ? LIMIT 1`;
    const [result] = await pool.query(sql, [user_badge_id]);
    return result.affectedRows > 0;
  }
}
