import { Router } from "express";
import { BadgesRepository } from "../domain/repositories/BadgesRepository.js";
import { BadgesService } from "../services/BadgesService.js";
import { BadgesController } from "../controllers/BadgesController.js";
import { idParam, upsertBadge } from "../validators/badgeValidator.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

/**
 * Express router module for managing badge-related API routes.
 *
 * Handles public and admin-only endpoints for listing, retrieving, creating,
 * updating, and deleting badges. It combines controller logic with
 * validation and authentication middleware.
 *
 * @module badgeRoutes
 *
 * @example
 * import express from "express";
 * import { badgeRoutes } from "./routes/badgeRoutes.js";
 *
 * const app = express();
 * app.use("/badges", badgeRoutes);
 */
const repo = new BadgesRepository();
const service = new BadgesService(repo);
const controller = new BadgesController(service);

/**
 * Express Router instance for badge routes.
 * @type {import('express').Router}
 */
export const badgeRoutes = Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route GET /badges
 * @summary Retrieve a list of all available badges.
 * @access Public
 * @returns {Badge[]} 200 - A list of badges.
 * @example
 * GET /badges
 * Response: [{ badge_id: 1, name: "Explorer", level_id: 2, ... }]
 */
badgeRoutes.get("/", controller.list);

/**
 * @route GET /badges/:id
 * @summary Retrieve a specific badge by its ID.
 * @access Public
 * @param {number} id - The badge ID.
 * @returns {Badge} 200 - Badge details.
 * @example
 * GET /badges/3
 * Response: { badge_id: 3, name: "Master", description: "Completed all levels" }
 */
badgeRoutes.get("/:id", idParam, controller.get);

/*
|--------------------------------------------------------------------------
| ADMIN-PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route POST /badges
 * @summary Create a new badge (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures the user is authenticated.
 * @middleware isAdmin - Ensures the user has admin privileges.
 * @middleware upsertBadge - Validates request body fields.
 * @bodyParam {string} name - The name of the badge.
 * @bodyParam {string} description - Description of the badge.
 * @bodyParam {number} level_id - Associated level ID.
 * @bodyParam {string} [icon_url] - Optional icon URL.
 * @returns {Badge} 201 - The created badge entity.
 * @example
 * POST /badges
 * Body: { "level_id": 3, "name": "Pro Explorer", "description": "Completed level 3" }
 */
badgeRoutes.post("/", requireAuth, isAdmin, upsertBadge, controller.create);

/**
 * @route PUT /badges/:id
 * @summary Update an existing badge (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures authentication.
 * @middleware isAdmin - Ensures admin privileges.
 * @middleware idParam - Validates badge ID.
 * @middleware upsertBadge - Validates request body.
 * @param {number} id - The badge ID to update.
 * @bodyParam {string} [name] - New badge name.
 * @bodyParam {string} [description] - New description.
 * @bodyParam {number} [level_id] - Updated level ID.
 * @bodyParam {string} [icon_url] - Updated icon URL.
 * @returns {Badge} 200 - The updated badge entity.
 * @example
 * PUT /badges/2
 * Body: { "name": "Elite Performer", "icon_url": "/icons/elite.png" }
 */
badgeRoutes.put(
  "/:id",
  requireAuth,
  isAdmin,
  [...idParam, ...upsertBadge],
  controller.update
);

/**
 * @route DELETE /badges/:id
 * @summary Delete a badge by its ID (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures authentication.
 * @middleware isAdmin - Restricts to admins only.
 * @param {number} id - The badge ID.
 * @returns {void} 204 - Successfully deleted, no content.
 * @example
 * DELETE /badges/4
 */
badgeRoutes.delete("/:id", requireAuth, isAdmin, idParam, controller.delete);
