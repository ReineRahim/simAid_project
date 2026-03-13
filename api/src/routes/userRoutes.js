import { Router } from 'express';
import { UserRepository } from '../domain/repositories/UserRepository.js';
import { UserService } from '../services/UserService.js';
import { UserController } from '../Controllers/UserController.js';
import { idParam, upsertUser } from '../validators/userValidator.js';
import { requireAuth } from "../middlewares/requireAuth.js"; 
import { isAdmin } from "../middlewares/isAdmin.js";  

/**
 * Express router module for handling user management and authentication.
 *
 * Provides routes for user registration, login, and admin-level CRUD operations.
 * Authentication middleware (`requireAuth`) and authorization checks (`isAdmin`)
 * are applied to protect sensitive endpoints.
 *
 * @module userRoutes
 *
 * @example
 * import express from "express";
 * import { userRoutes } from "./routes/userRoutes.js";
 *
 * const app = express();
 * app.use("/users", userRoutes);
 */
const repo = new UserRepository();
const service = new UserService(repo);
const controller = new UserController(service);

/**
 * Express Router instance for user-related routes.
 * @type {import('express').Router}
 */
export const userRoutes = Router();

/**
 * @route POST /users/register
 * @summary Register a new user account.
 * @access Public
 * @bodyParam {string} full_name - The user's full name.
 * @bodyParam {string} email - The user's email address.
 * @bodyParam {string} password - The user's chosen password.
 * @returns {User} 201 - Newly created user account.
 * @example
 * POST /users/register
 * Body: { "full_name": "John Doe", "email": "john@example.com", "password": "secret123" }
 */
userRoutes.post("/register", controller.register);

/**
 * @route POST /users/login
 * @summary Authenticate a user and return a JWT token.
 * @access Public
 * @bodyParam {string} email - User's registered email.
 * @bodyParam {string} password - User's password.
 * @returns {object} 200 - Authentication token and user info.
 * @example
 * POST /users/login
 * Body: { "email": "john@example.com", "password": "secret123" }
 * Response: { "token": "jwt_token_here", "user": {...} }
 */
userRoutes.post("/login", controller.login);

/**
 * @route GET /users
 * @summary Retrieve a list of all users (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures authentication.
 * @middleware isAdmin - Restricts access to admin users.
 * @returns {User[]} 200 - List of all registered users.
 * @example
 * GET /users
 * Response: [{ user_id: 1, full_name: "John Doe", email: "john@example.com", role: "user" }]
 */
userRoutes.get("/", requireAuth, isAdmin, controller.list);

/**
 * @route GET /users/:id
 * @summary Retrieve a user by their ID (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures authentication.
 * @middleware isAdmin - Restricts to admins.
 * @param {number} id - User ID.
 * @returns {User} 200 - User details.
 * @example
 * GET /users/3
 * Response: { user_id: 3, full_name: "Alice Smith", email: "alice@example.com" }
 */
userRoutes.get("/:id", requireAuth, isAdmin, idParam, controller.get);

/**
 * @route POST /users
 * @summary Create a new user manually (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures authentication.
 * @middleware isAdmin - Restricts access to admins.
 * @middleware upsertUser - Validates body parameters.
 * @bodyParam {string} full_name - User’s full name.
 * @bodyParam {string} email - User’s email address.
 * @bodyParam {string} password - User’s password.
 * @bodyParam {string} [role="user"] - Optional user role.
 * @returns {User} 201 - Created user record.
 * @example
 * POST /users
 * Body: { "full_name": "Admin User", "email": "admin@example.com", "password": "admin123", "role": "admin" }
 */
userRoutes.post("/", requireAuth, isAdmin, upsertUser, controller.create);

/**
 * @route PUT /users/:id
 * @summary Update an existing user (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures authentication.
 * @middleware isAdmin - Restricts access to admins.
 * @middleware idParam - Validates user ID parameter.
 * @middleware upsertUser - Validates update fields.
 * @param {number} id - User ID to update.
 * @bodyParam {string} [full_name] - Updated name.
 * @bodyParam {string} [email] - Updated email.
 * @bodyParam {string} [password] - Updated password.
 * @bodyParam {string} [role] - Updated role (e.g., "user" or "admin").
 * @returns {User} 200 - Updated user details.
 * @example
 * PUT /users/5
 * Body: { "full_name": "Updated Name", "role": "admin" }
 */
userRoutes.put("/:id", requireAuth, isAdmin, [...idParam, ...upsertUser], controller.update);

/**
 * @route DELETE /users/:id
 * @summary Delete a user account by ID (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures authentication.
 * @middleware isAdmin - Restricts access to admins.
 * @param {number} id - The ID of the user to delete.
 * @returns {void} 204 - Successfully deleted, no content returned.
 * @example
 * DELETE /users/4
 */
userRoutes.delete("/:id", requireAuth, isAdmin, idParam, controller.delete);
