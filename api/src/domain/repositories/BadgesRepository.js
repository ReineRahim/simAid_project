import { pool } from "../../config/db.js";
import BadgesEntity from "../entities/BadgesEntity.js";

/**
 * Repository class for managing CRUD operations on the `badges` table.
 *
 * Provides methods to create, retrieve, update, and delete badge records.
 * Returns results as {@link BadgesEntity} instances for consistency across layers.
 */
export class BadgesRepository {
  /**
   * Retrieves all badges from the database.
   *
   * @async
   * @method findAll
   * @returns {Promise<BadgesEntity[]>} A list of all badges ordered by badge ID (descending).
   * @example
   * const badges = await badgesRepo.findAll();
   */
  async findAll() {
    const sql = `
      SELECT badge_id, level_id, name, description, icon_url
      FROM badges
      ORDER BY badge_id DESC;
    `;
    const [rows] = await pool.query(sql);
    return rows.map(row => new BadgesEntity(row));
  }

  /**
   * Finds a single badge by its ID.
   *
   * @async
   * @method findById
   * @param {number} id - The badge ID to search for.
   * @returns {Promise<BadgesEntity|null>} The matching badge entity or null if not found.
   * @example
   * const badge = await badgesRepo.findById(3);
   */
  async findById(id) {
    const sql = `
      SELECT badge_id, level_id, name, description, icon_url
      FROM badges
      WHERE badge_id = ?;
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows.length ? new BadgesEntity(rows[0]) : null;
  }

  /**
   * Finds a badge associated with a specific level.
   * Returns the first match found for that level.
   *
   * @async
   * @method findByLevel
   * @param {number} level_id - The level ID to search for.
   * @returns {Promise<BadgesEntity|null>} The badge entity or null if not found.
   * @example
   * const badge = await badgesRepo.findByLevel(2);
   */
  async findByLevel(level_id) {
    const sql = `
      SELECT badge_id, level_id, name, description, icon_url
      FROM badges
      WHERE level_id = ?
      LIMIT 1;
    `;
    const [rows] = await pool.query(sql, [level_id]);
    return rows.length ? new BadgesEntity(rows[0]) : null;
  }

  /**
   * Creates a new badge record in the database.
   *
   * @async
   * @method create
   * @param {object} params - Badge creation properties.
   * @param {number} params.level_id - The level ID this badge is linked to.
   * @param {string} params.name - The badge name.
   * @param {string} params.description - Description of the badge.
   * @param {string} [params.icon_url] - Optional icon URL for the badge.
   * @returns {Promise<BadgesEntity|null>} The newly created badge entity or null if creation failed.
   * @example
   * const newBadge = await badgesRepo.create({
   *   level_id: 3,
   *   name: "Master Explorer",
   *   description: "Awarded for completing level 3",
   *   icon_url: "https://cdn.example.com/icons/master.png"
   * });
   */
  async create({ level_id, name, description, icon_url }) {
    const sql = `
      INSERT INTO badges (level_id, name, description, icon_url)
      VALUES (?, ?, ?, ?)
      RETURNING badge_id, level_id, name, description, icon_url;
    `;
    const [rows] = await pool.query(sql, [level_id, name, description, icon_url]);
    return rows.length ? new BadgesEntity(rows[0]) : null;
  }

  /**
   * Updates an existing badge record in the database.
   *
   * @async
   * @method update
   * @param {number} id - The ID of the badge to update.
   * @param {object} params - Updated badge fields.
   * @param {number} params.level_id - Level associated with the badge.
   * @param {string} params.name - Updated badge name.
   * @param {string} params.description - Updated badge description.
   * @param {string} [params.icon_url] - Updated badge icon URL.
   * @returns {Promise<BadgesEntity|null>} The updated badge entity or null if not found.
   * @example
   * const updated = await badgesRepo.update(4, {
   *   level_id: 2,
   *   name: "Expert Challenger",
   *   description: "Updated description",
   *   icon_url: "https://cdn.example.com/icons/expert.png"
   * });
   */
  async update(id, { level_id, name, description, icon_url }) {
    const sql = `
      UPDATE badges
      SET level_id = ?, name = ?, description = ?, icon_url = ?
      WHERE badge_id = ?
      RETURNING badge_id, level_id, name, description, icon_url;
    `;
    const [rows] = await pool.query(sql, [level_id, name, description, icon_url, id]);
    return rows.length ? new BadgesEntity(rows[0]) : null;
  }

  /**
   * Deletes a badge record from the database.
   *
   * @async
   * @method delete
   * @param {number} id - The ID of the badge to delete.
   * @returns {Promise<boolean>} True if the badge was deleted successfully; otherwise false.
   * @example
   * const deleted = await badgesRepo.delete(5);
   * if (deleted) console.log("Badge removed successfully!");
   */
  async delete(id) {
    const [result] = await pool.query("DELETE FROM badges WHERE badge_id = ?", [id]);
    return result.affectedRows > 0;
  }
}
