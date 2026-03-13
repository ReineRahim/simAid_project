import bcrypt from "bcrypt";
import UserDTO from "../domain/dto/UserDTO.js";
import { signAccess } from "../utils/jwt.js";

/**
 * Service layer for user management and authentication.
 *
 * Handles registration, login, and administrative user management.
 * It performs password hashing, token generation, and converts
 * database entities into DTOs (`UserDTO`).
 *
 * @class UserService
 */
export class UserService {
  /**
   * Creates an instance of UserService.
   * @param {import("../domain/repositories/UserRepository.js").UserRepository} userRepository - Repository managing user data.
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Register a new user.
   * Hashes the password before saving and sets a default role (`user`).
   * @async
   * @param {object} data - User registration data.
   * @param {string} data.full_name - Full name of the user.
   * @param {string} data.email - Email address.
   * @param {string} data.password - Plain text password.
   * @param {string} [data.role="user"] - Optional role (e.g., "admin").
   * @returns {Promise<UserDTO>} The newly registered user DTO.
   * @throws {Error} If email already exists or creation fails.
   * @example
   * const user = await userService.register({
   *   full_name: "Jane Doe",
   *   email: "jane@example.com",
   *   password: "securePass123"
   * });
   */
  async register(data) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new Error("Email already in use");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Default role = 'user' unless explicitly set (e.g., admin creating another admin)
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
      role: data.role || "user",
    });

    return UserDTO.fromEntity(user);
  }

  /**
   * Authenticate a user and generate an access token.
   * Verifies email and password, then signs a JWT token with role information.
   * @async
   * @param {string} email - The user's email.
   * @param {string} password - The user's plain text password.
   * @returns {Promise<{user: UserDTO, token: string}>} Authenticated user data and access token.
   * @throws {Error} If authentication fails.
   * @example
   * const { user, token } = await userService.login("jane@example.com", "securePass123");
   */
  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("Invalid email or password");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid email or password");

    // Include role in token payload
    const token = signAccess({ sub: user.user_id, role: user.role });
    return {
      user: UserDTO.fromEntity(user),
      token,
    };
  }

  // -------------------------------------------------------------
  // 🔒 Admin-only methods
  // -------------------------------------------------------------

  /**
   * Retrieve all users (admin only).
   * @async
   * @returns {Promise<UserDTO[]>} List of all registered users.
   * @throws {Error} If retrieval fails.
   * @example
   * const users = await userService.listUsers();
   */
  async listUsers() {
    try {
      const users = await this.userRepository.findAll();
      return users.map(UserDTO.fromEntity);
    } catch (error) {
      throw new Error("Failed to list users: " + error.message);
    }
  }

  /**
   * Retrieve a single user by their ID.
   * @async
   * @param {number} id - The user ID.
   * @returns {Promise<UserDTO|null>} The user DTO or null if not found.
   * @throws {Error} If retrieval fails.
   * @example
   * const user = await userService.getUser(3);
   */
  async getUser(id) {
    try {
      const user = await this.userRepository.findById(id);
      return user ? UserDTO.fromEntity(user) : null;
    } catch (error) {
      throw new Error(`Failed to get user with id ${id}: ${error.message}`);
    }
  }

  /**
   * Retrieve a user by their email.
   * @async
   * @param {string} email - The user's email.
   * @returns {Promise<UserDTO|null>} The user DTO or null if not found.
   * @throws {Error} If retrieval fails.
   * @example
   * const user = await userService.getUserByEmail("jane@example.com");
   */
  async getUserByEmail(email) {
    try {
      const user = await this.userRepository.findByEmail(email);
      return user ? UserDTO.fromEntity(user) : null;
    } catch (error) {
      throw new Error(`Failed to get user with email ${email}: ${error.message}`);
    }
  }

  /**
   * Create a new user (admin only).
   * Automatically hashes the password before saving.
   * @async
   * @param {object} data - User creation data.
   * @param {string} data.full_name - Full name.
   * @param {string} data.email - Email address.
   * @param {string} data.password - Plain text password.
   * @param {string} [data.role="user"] - Optional role.
   * @returns {Promise<UserDTO>} The created user DTO.
   * @throws {Error} If creation fails.
   * @example
   * const adminUser = await userService.createUser({
   *   full_name: "Admin One",
   *   email: "admin@example.com",
   *   password: "admin123",
   *   role: "admin"
   * });
   */
  async createUser(data) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await this.userRepository.create({
        ...data,
        password: hashedPassword,
        role: data.role || "user",
      });
      return UserDTO.fromEntity(user);
    } catch (error) {
      throw new Error("Failed to create user: " + error.message);
    }
  }

  /**
   * Update an existing user record.
   * Hashes password if provided before saving.
   * @async
   * @param {number} id - The user ID.
   * @param {object} data - Updated fields.
   * @param {string} [data.full_name] - Updated full name.
   * @param {string} [data.email] - Updated email.
   * @param {string} [data.password] - Updated password (will be hashed).
   * @param {string} [data.role] - Updated role.
   * @returns {Promise<UserDTO|null>} The updated user DTO, or null if not found.
   * @throws {Error} If update fails.
   * @example
   * const updated = await userService.updateUser(5, { full_name: "Jane Updated" });
   */
  async updateUser(id, data) {
    try {
      let updatedData = { ...data };
      if (data.password) {
        updatedData.password = await bcrypt.hash(data.password, 10);
      }
      const user = await this.userRepository.update(id, updatedData);
      return user ? UserDTO.fromEntity(user) : null;
    } catch (error) {
      throw new Error(`Failed to update user with id ${id}: ${error.message}`);
    }
  }

  /**
   * Delete a user record by ID.
   * @async
   * @param {number} id - The user ID.
   * @returns {Promise<boolean>} True if deleted successfully, false otherwise.
   * @throws {Error} If deletion fails.
   * @example
   * const deleted = await userService.deleteUser(4);
   */
  async deleteUser(id) {
    try {
      return await this.userRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete user with id ${id}: ${error.message}`);
    }
  }
}
