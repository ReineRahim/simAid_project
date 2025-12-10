/**
 * Entity class representing a user record in the database.
 *
 * Encapsulates user data including authentication details, role,
 * and creation metadata. This class models the persisted structure
 * of user data as stored in the database layer.
 */
export default class UserEntity {
  /**
   * @param {object} params - User entity properties.
   * @param {number} params.user_id - Unique identifier for the user.
   * @param {string} params.full_name - Full name of the user.
   * @param {string} params.email - Email address of the user (must be unique).
   * @param {string} params.password - Hashed password for authentication.
   * @param {string} params.role - Role assigned to the user (e.g., 'admin', 'student', 'instructor').
   * @param {string|Date} params.created_at - Timestamp indicating when the user was created.
   */
  constructor({ user_id, full_name, email, password, role, created_at }) {
    /**
     * Unique ID for the user.
     * @type {number}
     */
    this.user_id = user_id;

    /**
     * Full name of the user.
     * @type {string}
     */
    this.full_name = full_name;

    /**
     * User's email address.
     * @type {string}
     */
    this.email = email;

    /**
     * Hashed password of the user.
     * Note: This should never be returned in API responses.
     * @type {string}
     */
    this.password = password;

    /**
     * Role of the user (e.g., admin, instructor, student).
     * @type {string}
     */
    this.role = role;

    /**
     * Date and time when the user record was created.
     * @type {string|Date}
     */
    this.created_at = created_at;
  }
}
