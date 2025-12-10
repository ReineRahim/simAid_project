import bcrypt from "bcrypt";
import UserDTO from "../domain/dto/UserDTO.js";
import { signAccess } from "../utils/jwt.js";

export class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(data) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new Error("Email already in use");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Default role = 'user' unless explicitly set (admin creating another admin)
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
      role: data.role || "user",
    });

    return UserDTO.fromEntity(user);
  }

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
  async listUsers() {
    try {
      const users = await this.userRepository.findAll();
      return users.map(UserDTO.fromEntity);
    } catch (error) {
      throw new Error("Failed to list users: " + error.message);
    }
  }

  async getUser(id) {
    try {
      const user = await this.userRepository.findById(id);
      return user ? UserDTO.fromEntity(user) : null;
    } catch (error) {
      throw new Error(`Failed to get user with id ${id}: ${error.message}`);
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await this.userRepository.findByEmail(email);
      return user ? UserDTO.fromEntity(user) : null;
    } catch (error) {
      throw new Error(`Failed to get user with email ${email}: ${error.message}`);
    }
  }

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

  async deleteUser(id) {
    try {
      return await this.userRepository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete user with id ${id}: ${error.message}`);
    }
  }
}
