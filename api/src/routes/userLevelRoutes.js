import { Router } from "express";
import { UserLevelRepository } from "../domain/repositories/UserLevelRepository.js";
import { UserLevelService } from "../services/UserLevelService.js";
import { UserLevelController } from "../Controllers/UserLevelController.js";
import { idParam /*, upsertUserLevel*/ } from "../validators/userLevelValidator.js";

/**
 * Express router module for managing user-level relationships.
 *
 * These routes handle user progression through levels — including tracking
 * which levels are unlocked or completed by specific users. This is useful
 * for gamified applications, learning systems, or achievement-based platforms.
 *
 * Supports:
 * - Listing all user-level relationships
 * - Fetching records by user, level, or ID
 * - Creating, updating, deleting, or upserting user-level progress
 *
 * @module userLevelRoutes
 *
 * @example
 * import express from "express";
 * import { userLevelRoutes } from "./routes/userLevelRoutes.js";
 *
 * const app = express();
 * app.use("/user-levels", userLevelRoutes);
 */
const repo = new UserLevelRepository();
const service = new UserLevelService(repo);
const controller = new UserLevelController(service);

/**
 * Express Router instance for user-level routes.
 * @type {import('express').Router}
 */
export const userLevelRoutes = Router();

/*
|--------------------------------------------------------------------------
| PUBLIC / ADMIN LISTING & QUERY ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route GET /user-levels
 * @summary Retrieve all user-level records or filter by user and/or level.
 * @access Public / Admin
 * @queryParam {number} [user_id] - Filter by user ID.
 * @queryParam {number} [level_id] - Filter by level ID.
 * @returns {UserLevel[]} 200 - List of user-level relationships.
 * @example
 * GET /user-levels
 * Response: [{ user_level_id: 1, user_id: 2, level_id: 1, unlocked: true, completed: false }]
 *
 * GET /user-levels?user_id=3
 * Response: [{ level_id: 2, unlocked: true, completed: true }]
 */
userLevelRoutes.get("/", controller.list);

/**
 * @route GET /user-levels/:id
 * @summary Retrieve a user-level record by its primary key (ID).
 * @access Admin / Debug
 * @param {number} id - Unique user-level record ID.
 * @returns {UserLevel} 200 - A specific user-level record.
 * @example
 * GET /user-levels/5
 * Response: { user_level_id: 5, user_id: 1, level_id: 2, unlocked: true, completed: false }
 */
userLevelRoutes.get("/:id", idParam, controller.getById);

/*
|--------------------------------------------------------------------------
| USER-SCOPED ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route GET /user-levels/by-user/:user_id/levels
 * @summary Retrieve all level progress records for a specific user.
 * @access Public / Authenticated User
 * @param {number} user_id - The ID of the user.
 * @returns {UserLevel[]} 200 - List of user-level progress records.
 * @example
 * GET /user-levels/by-user/4/levels
 * Response: [
 *   { level_id: 1, unlocked: true, completed: true },
 *   { level_id: 2, unlocked: true, completed: false }
 * ]
 */
userLevelRoutes.get("/by-user/:user_id/levels", controller.listByUser);

/**
 * @route GET /user-levels/by-user/:user_id/levels/:level_id
 * @summary Retrieve a specific level progress record for a user.
 * @access Public / Authenticated User
 * @param {number} user_id - The ID of the user.
 * @param {number} level_id - The ID of the level.
 * @returns {UserLevel} 200 - Specific progress record for the user and level.
 * @example
 * GET /user-levels/by-user/3/levels/2
 * Response: { user_id: 3, level_id: 2, unlocked: true, completed: false }
 */
userLevelRoutes.get(
  "/by-user/:user_id/levels/:level_id",
  controller.getByUserAndLevel
);

/*
|--------------------------------------------------------------------------
| CRUD ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route POST /user-levels
 * @summary Create a new user-level record.
 * @access Admin / System
 * @bodyParam {number} user_id - ID of the user.
 * @bodyParam {number} level_id - ID of the level.
 * @bodyParam {boolean} [unlocked=false] - Whether the level is unlocked.
 * @bodyParam {boolean} [completed=false] - Whether the level is completed.
 * @returns {UserLevel} 201 - The created user-level record.
 * @example
 * POST /user-levels
 * Body: { "user_id": 4, "level_id": 2, "unlocked": true, "completed": false }
 */
userLevelRoutes.post("/", /* upsertUserLevel,*/ controller.create);

/**
 * @route PUT /user-levels/:id
 * @summary Update an existing user-level record.
 * @access Admin / System
 * @param {number} id - The ID of the user-level record to update.
 * @bodyParam {boolean} [unlocked] - Updated unlocked status.
 * @bodyParam {boolean} [completed] - Updated completed status.
 * @returns {UserLevel} 200 - The updated user-level record.
 * @example
 * PUT /user-levels/5
 * Body: { "completed": true }
 */
userLevelRoutes.put("/:id", /* [...idParam, ...upsertUserLevel],*/ controller.update);

/**
 * @route DELETE /user-levels/:id
 * @summary Delete a user-level record by its ID.
 * @access Admin / Debug
 * @param {number} id - The ID of the record to delete.
 * @returns {void} 204 - Successfully deleted.
 * @example
 * DELETE /user-levels/8
 */
userLevelRoutes.delete("/:id", idParam, controller.delete);

/*
|--------------------------------------------------------------------------
| UPSERT ROUTE
|--------------------------------------------------------------------------
*/

/**
 * @route POST /user-levels/upsert
 * @summary Create or update a user’s progress for a specific level (idempotent operation).
 * @access System / Application
 * @bodyParam {number} user_id - ID of the user.
 * @bodyParam {number} level_id - ID of the level.
 * @bodyParam {boolean} [unlocked=false] - Unlock status.
 * @bodyParam {boolean} [completed=false] - Completion status.
 * @returns {UserLevel} 200 - The created or updated user-level record.
 * @example
 * POST /user-levels/upsert
 * Body: { "user_id": 3, "level_id": 1, "unlocked": true, "completed": true }
 */
userLevelRoutes.post("/upsert", /* upsertUserLevel,*/ controller.upsert);
