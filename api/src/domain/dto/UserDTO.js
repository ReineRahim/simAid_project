/**
 * Data Transfer Object (DTO) representing a user.
 *
 * Used to standardize and encapsulate user data when transferring
 * information between application layers (e.g., from database to API responses).
 */
export default class UserDTO {
  /**
   * @param {object} params - User properties.
   * @param {number} params.user_id - Unique identifier of the user.
   * @param {string} params.full_name - Full name of the user.
   * @param {string} params.email - Email address of the user.
   * @param {string} params.role - User role (e.g., "admin", "student", "instructor").
   * @param {string|Date} params.created_at - Timestamp when the user was created.
   */
  constructor({ user_id, full_name, email, role, created_at }) {
    /**
     * Unique identifier for the user.
     * @type {number}
     */
    this.id = user_id;

    /**
     * The full name of the user.
     * @type {string}
     */
    this.name = full_name;

    /**
     * The user's email address.
     * @type {string}
     */
    this.email = email;

    /**
     * The user's role within the system (e.g., admin, learner).
     * @type {string}
     */
    this.role = role;

    /**
     * The date and time the user record was created.
     * @type {string|Date}
     */
    this.created_at = created_at;
  }

  /**
   * Creates a `UserDTO` instance from a plain entity object.
   *
   * @static
   * @method fromEntity
   * @param {object|null} entity - The user entity object (e.g., a database record).
   * @returns {UserDTO|null} A new `UserDTO` instance, or `null` if the input is invalid.
   * @example
   * const dto = UserDTO.fromEntity(dbRecord);
   */
  static fromEntity(entity) {
    if (!entity) return null;

    const { user_id, full_name, email, role, created_at } = entity;
    return new UserDTO({ user_id, full_name, email, role, created_at });
  }
}
