import { pool } from "../../config/db.js";
import UserEntity from "../entities/UserEntity.js";

/**
 * Repository class responsible for managing persistence operations
 * on the `users` table.
 *
 * Supports CRUD operations and user lookups by ID or email.
 * Returns all results as {@link UserEntity} instances.
 */
export class UserRepository {
  /**
   * Retrieves all users from the database.
   * Typically used by administrators.
   *
   * @async
   * @method findAll
   * @returns {Promise<UserEntity[]>} A list of all user entities.
   * @example
   * const users = await userRepo.findAll();
   */
  async findAll() {
    const sql = `
      SELECT user_id, full_name, email, password, role, created_at
      FROM users
      ORDER BY user_id DESC
    `;
    const [rows] = await pool.query(sql);
    return rows.map(row => new UserEntity(row));
  }

  /**
   * Finds a user by their unique ID.
   *
   * @async
   * @method findById
   * @param {number} id - The unique user ID.
   * @returns {Promise<UserEntity|null>} The matching user entity or null if not found.
   * @example
   * const user = await userRepo.findById(10);
   */
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

  /**
   * Finds a user by their email address.
   * Commonly used during authentication (login/register).
   *
   * @async
   * @method findByEmail
   * @param {string} email - The user’s email address.
   * @returns {Promise<UserEntity|null>} The user entity or null if not found.
   * @example
   * const user = await userRepo.findByEmail("jane.doe@example.com");
   */
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
   * Creates a new user record (for registration or admin creation).
   *
   * Accepts both `name` and `full_name` for flexibility in input.
   *
   * @async
   * @method create
   * @param {object} params - User creation parameters.
   * @param {string} [params.name] - The user’s name (alternative to `full_name`).
   * @param {string} [params.full_name] - The user’s full name.
   * @param {string} params.email - The user’s email address.
   * @param {string} params.password - The user’s hashed password.
   * @param {string} [params.role="user"] - The user’s assigned role.
   * @returns {Promise<UserEntity>} The newly created user entity.
   * @example
   * const newUser = await userRepo.create({
   *   full_name: "Alice Johnson",
   *   email: "alice@example.com",
   *   password: hashedPassword,
   *   role: "admin"
   * });
   */
  async create({ name, full_name, email, password, role = "user" }) {
    const finalName = full_name ?? name ?? null;

    const insertSql = `
      INSERT INTO users (full_name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(insertSql, [finalName, email, password, role]);

    return await this.findById(result.insertId);
  }

  /**
   * Updates an existing user’s data.
   *
   * Only updates fields that are provided — avoids overwriting with undefined values.
   * If no fields are specified, the current record is returned unchanged.
   *
   * @async
   * @method update
   * @param {number} id - The user’s unique ID.
   * @param {object} params - Fields to update.
   * @param {string} [params.full_name] - Updated full name.
   * @param {string} [params.name] - Alternative name field.
   * @param {string} [params.email] - Updated email.
   * @param {string} [params.password] - Updated (hashed) password.
   * @param {string} [params.role] - Updated role (e.g., `user`, `admin`).
   * @returns {Promise<UserEntity|null>} The updated user or null if not found.
   * @example
   * const updatedUser = await userRepo.update(4, {
   *   full_name: "Bob Smith",
   *   email: "bob.smith@example.com"
   * });
   */
  async update(id, { full_name, name, email, password, role }) {
    const finalName = full_name ?? name;

    const fields = [];
    const params = [];

    if (typeof finalName !== "undefined") { fields.push("full_name = ?"); params.push(finalName); }
    if (typeof email !== "undefined")     { fields.push("email = ?");     params.push(email); }
    if (typeof password !== "undefined")  { fields.push("password = ?");  params.push(password); }
    if (typeof role !== "undefined")      { fields.push("role = ?");      params.push(role); }

    if (fields.length === 0) {
      return await this.findById(id); // Nothing to update
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

  /**
   * Deletes a user record by ID.
   *
   * @async
   * @method delete
   * @param {number} id - The user ID to delete.
   * @returns {Promise<boolean>} True if deletion succeeded, false otherwise.
   * @example
   * const deleted = await userRepo.delete(9);
   * if (deleted) console.log("User successfully removed.");
   */
  async delete(id) {
    const [result] = await pool.query(
      "DELETE FROM users WHERE user_id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}
