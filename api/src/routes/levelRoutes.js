import { Router } from "express";
import { LevelRepository } from "../domain/repositories/LevelRepository.js";
import { LevelService } from "../services/LevelService.js";
import { LevelController } from "../controllers/LevelController.js";
import { idParam, upsertLevel } from "../validators/levelValidator.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

/**
 * Express router module for managing game or course levels.
 *
 * Defines endpoints for listing, retrieving, creating, updating,
 * and deleting levels. Includes both public and admin-protected routes.
 *
 * @module levelRoutes
 *
 * @example
 * import express from "express";
 * import { levelRoutes } from "./routes/levelRoutes.js";
 *
 * const app = express();
 * app.use("/levels", levelRoutes);
 */
const repo = new LevelRepository();
const service = new LevelService(repo);
const controller = new LevelController(service);

/**
 * Express Router instance for level routes.
 * @type {import('express').Router}
 */
export const levelRoutes = Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route GET /levels
 * @summary Retrieve a list of all available levels.
 * @access Public
 * @returns {Level[]} 200 - List of level entities.
 * @example
 * GET /levels
 * Response: [{ level_id: 1, title: "Beginner", description: "Introduction level" }]
 */
levelRoutes.get("/", controller.list);

/**
 * @route GET /levels/:id
 * @summary Retrieve details of a specific level by its ID.
 * @access Public
 * @param {number} id - The level ID.
 * @returns {Level} 200 - The level details.
 * @example
 * GET /levels/3
 * Response: { level_id: 3, title: "Advanced", description: "High difficulty level" }
 */
levelRoutes.get("/:id", idParam, controller.get);

/*
|--------------------------------------------------------------------------
| ADMIN-PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route POST /levels
 * @summary Create a new level (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures the user is authenticated.
 * @middleware isAdmin - Ensures the user has administrative privileges.
 * @middleware upsertLevel - Validates the request body.
 * @bodyParam {string} title - The level title.
 * @bodyParam {string} description - The level description.
 * @bodyParam {number} difficulty_order - The order or difficulty ranking.
 * @returns {Level} 201 - The created level entity.
 * @example
 * POST /levels
 * Body: { "title": "Expert", "description": "Hardest stage", "difficulty_order": 5 }
 */
levelRoutes.post("/", requireAuth, isAdmin, upsertLevel, controller.create);

/**
 * @route PUT /levels/:id
 * @summary Update an existing level (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures authentication.
 * @middleware isAdmin - Restricts access to admins only.
 * @middleware idParam - Validates the level ID parameter.
 * @middleware upsertLevel - Validates the request body.
 * @param {number} id - The ID of the level to update.
 * @bodyParam {string} [title] - Updated title.
 * @bodyParam {string} [description] - Updated description.
 * @bodyParam {number} [difficulty_order] - Updated difficulty order.
 * @returns {Level} 200 - The updated level entity.
 * @example
 * PUT /levels/2
 * Body: { "title": "Intermediate+", "difficulty_order": 3 }
 */
levelRoutes.put(
  "/:id",
  requireAuth,
  isAdmin,
  [...idParam, ...upsertLevel],
  controller.update
);

/**
 * @route DELETE /levels/:id
 * @summary Delete a level by its ID (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures authentication.
 * @middleware isAdmin - Restricts to admins only.
 * @param {number} id - The ID of the level to delete.
 * @returns {void} 204 - Successfully deleted, no response body.
 * @example
 * DELETE /levels/4
 */
levelRoutes.delete("/:id", requireAuth, isAdmin, idParam, controller.delete);
