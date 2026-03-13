import { Router } from "express";
import { UserBadgeRepository } from "../domain/repositories/UserBadgeRepository.js";
import { UserBadgeService } from "../services/UserBadgeService.js";
import { UserBadgeController } from "../Controllers/UserBadgeController.js";
import { idParam, upsertUserBadge } from "../validators/userBadgeValidator.js";

/**
 * Express router module for handling user-badge relationships.
 *
 * These routes manage which badges users have earned — allowing listing,
 * retrieval, creation, updating, and deletion of user badge records.
 * Typically, user badges are created automatically when users reach specific
 * milestones or achievements in the application.
 *
 * @module userBadgeRoutes
 *
 * @example
 * import express from "express";
 * import { userBadgeRoutes } from "./routes/userBadgeRoutes.js";
 *
 * const app = express();
 * app.use("/user-badges", userBadgeRoutes);
 */
const repo = new UserBadgeRepository();
const service = new UserBadgeService(repo);
const controller = new UserBadgeController(service);

/**
 * Express Router instance for user badge routes.
 * @type {import('express').Router}
 */
export const userBadgeRoutes = Router();

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route GET /user-badges
 * @summary Retrieve all user badge records.
 * @access Admin / Debug
 * @returns {UserBadge[]} 200 - List of all user badges.
 * @example
 * GET /user-badges
 * Response: [
 *   { user_badge_id: 1, user_id: 4, badge_id: 2, earned_at: "2025-01-05T12:00:00Z" }
 * ]
 */
userBadgeRoutes.get("/", controller.list);

/**
 * @route GET /user-badges/:id
 * @summary Retrieve a single user badge record by its ID.
 * @access Admin / Debug
 * @param {number} id - The user badge record ID.
 * @returns {UserBadge} 200 - The user badge details.
 * @example
 * GET /user-badges/3
 * Response: {
 *   user_badge_id: 3,
 *   user_id: 7,
 *   badge_id: 1,
 *   earned_at: "2025-02-15T08:45:00Z"
 * }
 */
userBadgeRoutes.get("/:id", idParam, controller.get);

/**
 * @route POST /user-badges
 * @summary Create a new user badge record.
 * @access Application / System
 * @middleware upsertUserBadge - Validates the request body.
 * @bodyParam {number} user_id - ID of the user earning the badge.
 * @bodyParam {number} badge_id - ID of the earned badge.
 * @bodyParam {string|Date} [earned_at] - Optional date/time when badge was earned.
 * @returns {UserBadge} 201 - Newly created user badge record.
 * @example
 * POST /user-badges
 * Body: { "user_id": 5, "badge_id": 3 }
 */
userBadgeRoutes.post("/", upsertUserBadge, controller.create);

/**
 * @route PUT /user-badges/:id
 * @summary Update an existing user badge record.
 * @access Admin / System
 * @middleware idParam - Validates the user badge ID.
 * @middleware upsertUserBadge - Validates body fields.
 * @param {number} id - ID of the user badge record to update.
 * @bodyParam {number} [user_id] - Updated user ID.
 * @bodyParam {number} [badge_id] - Updated badge ID.
 * @bodyParam {string|Date} [earned_at] - Updated timestamp.
 * @returns {UserBadge} 200 - Updated user badge record.
 * @example
 * PUT /user-badges/5
 * Body: { "earned_at": "2025-03-10T14:00:00Z" }
 */
userBadgeRoutes.put("/:id", [...idParam, ...upsertUserBadge], controller.update);

/**
 * @route DELETE /user-badges/:id
 * @summary Delete a user badge record by its ID.
 * @access Admin / Debug
 * @middleware idParam - Validates the ID parameter.
 * @param {number} id - The ID of the user badge record to delete.
 * @returns {void} 204 - Successfully deleted, no content returned.
 * @example
 * DELETE /user-badges/7
 */
userBadgeRoutes.delete("/:id", idParam, controller.delete);
