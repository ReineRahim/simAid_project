import { pool } from "../../config/db.js";
import UserEntity from "../entities/UserEntity.js";

export class UserRepository {
  // Fetch all users (Admin)
  async findAll() {
    const sql = `
      SELECT user_id, full_name, email, password, role, created_at
      FROM users
      ORDER BY user_id DESC
    `;
    const [rows] = await pool.query(sql);
    return rows.map(row => new UserEntity(row));
  }

  // Find user by ID
  async findById(id) {
    const sql = `
      SELECT user_id, full_name, email, password, role, created_at
      FROM users
      WHERE user_id = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [id]);
    return rows.length ? new UserEntity(rows[0]) : null;
  }

  // Find user by Email (used in login / register)
  async findByEmail(email) {
    const sql = `
      SELECT user_id, full_name, email, password, role, created_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [email]);
    return rows.length ? new UserEntity(rows[0]) : null;
  }

  /**
   * Create new user (Register or Admin)
   * Accepts either { name, ... } or { full_name, ... }.
   */
  async create({ name, full_name, email, password, role = "user" }) {
    const finalName = full_name ?? name ?? null;

    const insertSql = `
      INSERT INTO users (full_name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(insertSql, [finalName, email, password, role]);

    // Fetch inserted row
    return await this.findById(result.insertId);
  }

  /**
   * Update user (Admin or Profile Edit)
   * Only updates provided fields. If password is undefined, it won't be touched.
   */
  async update(id, { full_name, name, email, password, role }) {
    const finalName = full_name ?? name;

    // Build dynamic SET clause so we don't overwrite with undefined
    const fields = [];
    const params = [];

    if (typeof finalName !== "undefined") { fields.push("full_name = ?"); params.push(finalName); }
    if (typeof email !== "undefined")     { fields.push("email = ?");     params.push(email); }
    if (typeof password !== "undefined")  { fields.push("password = ?");  params.push(password); }
    if (typeof role !== "undefined")      { fields.push("role = ?");      params.push(role); }

    if (fields.length === 0) {
      // Nothing to update; just return current record
      return await this.findById(id);
    }

    const updateSql = `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE user_id = ?
    `;
    params.push(id);

    const [result] = await pool.query(updateSql, params);

    if (result.affectedRows === 0) return null;
    return await this.findById(id);
  }

  // Delete user (Admin only)
  async delete(id) {
    const [result] = await pool.query(
      "DELETE FROM users WHERE user_id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}
