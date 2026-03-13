import { Router } from "express";
import { ScenarioRepository } from "../domain/repositories/ScenarioRepository.js";
import { ScenarioService } from "../services/ScenarioService.js";
import { ScenarioController } from "../Controllers/ScenarioController.js";
import { idParam, upsertScenario } from "../validators/scenarioValidator.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { ScenarioStepRepository } from "../domain/repositories/ScenarioStepRepository.js";
import { ScenarioStepService } from "../services/ScenarioStepService.js";
import { AttemptRepository } from "../domain/repositories/AttemptRepository.js";
import { BadgesRepository } from "../domain/repositories/BadgesRepository.js";
import { UserBadgeRepository } from "../domain/repositories/UserBadgeRepository.js";
import { UserLevelRepository } from "../domain/repositories/UserLevelRepository.js";

/**
 * Express router module for handling scenario-related routes.
 *
 * Provides public and admin-protected endpoints for listing, retrieving,
 * creating, updating, deleting, and submitting scenario answers.
 *
 * This module composes multiple dependencies:
 * - **Repositories** for database access (Scenario, Steps, Attempts, Badges, etc.)
 * - **Services** for domain logic and business rules
 * - **Controllers** for request/response handling
 *
 * @module scenarioRoutes
 *
 * @example
 * import express from "express";
 * import { scenarioRoutes } from "./routes/scenarioRoutes.js";
 *
 * const app = express();
 * app.use("/scenarios", scenarioRoutes);
 */
const scenarioRepo = new ScenarioRepository();
const scenarioSvc = new ScenarioService(scenarioRepo);

const stepRepo = new ScenarioStepRepository();
const stepSvc = new ScenarioStepService(stepRepo);

const attemptRepo = new AttemptRepository();
const badgeRepo = new BadgesRepository();
const userBadgeRepo = new UserBadgeRepository();
const userLevelRepo = new UserLevelRepository();

// Debugging helper (optional)
console.log("Repo methods:", Object.getOwnPropertyNames(ScenarioRepository.prototype));

/**
 * Initialize the controller with all required dependencies.
 * @type {ScenarioController}
 */
const controller = new ScenarioController(
  scenarioSvc,
  stepSvc,
  attemptRepo,
  badgeRepo,
  userBadgeRepo,
  userLevelRepo
);

/**
 * Express Router instance for scenario routes.
 * @type {import('express').Router}
 */
export const scenarioRoutes = Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route GET /scenarios/level/:levelId
 * @summary Retrieve all scenarios that belong to a specific level.
 * @access Public
 * @param {number} levelId - The ID of the level.
 * @returns {Scenario[]} 200 - A list of scenarios for the specified level.
 * @example
 * GET /scenarios/level/2
 * Response: [{ scenario_id: 5, level_id: 2, title: "Warehouse Fire" }]
 */
scenarioRoutes.get("/level/:levelId", controller.listByLevel);

/**
 * @route GET /scenarios
 * @summary Retrieve all available scenarios.
 * @access Public
 * @returns {Scenario[]} 200 - A list of all scenarios.
 * @example
 * GET /scenarios
 */
scenarioRoutes.get("/", controller.list);

/**
 * @route GET /scenarios/:id
 * @summary Retrieve a scenario by its ID (including its steps).
 * @access Public
 * @param {number} id - Scenario ID.
 * @returns {Scenario} 200 - The scenario object with ordered steps.
 * @example
 * GET /scenarios/4
 * Response: { scenario_id: 4, title: "Evacuation Drill", steps: [...] }
 */
scenarioRoutes.get("/:id", idParam, controller.get);

/**
 * @route POST /scenarios/:id/submit
 * @summary Submit user answers for a scenario and update progress/badges.
 * @access Authenticated Users
 * @middleware requireAuth - Ensures the user is logged in.
 * @param {number} id - Scenario ID.
 * @bodyParam {Array<string>} userAnswers - Array of selected actions ("A", "B", "C", or "D").
 * @returns {object} 200 - Submission result with score, progress, and badges.
 * @example
 * POST /scenarios/3/submit
 * Body: { "userAnswers": ["A", "C", "D"] }
 * Response: { "score": 100, "level_progress": {...}, "awarded_badge": {...} }
 */
scenarioRoutes.post("/:id/submit", requireAuth, controller.submit);

/*
|--------------------------------------------------------------------------
| ADMIN-PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route POST /scenarios
 * @summary Create a new scenario (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures authentication.
 * @middleware isAdmin - Restricts to admins.
 * @middleware upsertScenario - Validates the scenario payload.
 * @bodyParam {number} level_id - Associated level ID.
 * @bodyParam {string} title - Scenario title.
 * @bodyParam {string} description - Scenario description.
 * @bodyParam {string} [image_url] - Optional scenario image URL.
 * @returns {Scenario} 201 - The newly created scenario.
 * @example
 * POST /scenarios
 * Body: { "level_id": 2, "title": "Factory Safety Drill", "description": "Handle emergencies safely" }
 */
scenarioRoutes.post("/", requireAuth, isAdmin, upsertScenario, controller.create);

/**
 * @route PUT /scenarios/:id
 * @summary Update an existing scenario by its ID (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures authentication.
 * @middleware isAdmin - Restricts to admins.
 * @middleware idParam - Validates scenario ID.
 * @middleware upsertScenario - Validates payload.
 * @param {number} id - Scenario ID.
 * @returns {Scenario} 200 - Updated scenario details.
 * @example
 * PUT /scenarios/5
 * Body: { "title": "Updated Drill", "image_url": "/images/drill.png" }
 */
scenarioRoutes.put(
  "/:id",
  requireAuth,
  isAdmin,
  [...idParam, ...upsertScenario],
  controller.update
);

/**
 * @route DELETE /scenarios/:id
 * @summary Delete a scenario by its ID (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures authentication.
 * @middleware isAdmin - Restricts access to admins.
 * @param {number} id - Scenario ID.
 * @returns {void} 204 - Successfully deleted.
 * @example
 * DELETE /scenarios/3
 */
scenarioRoutes.delete("/:id", requireAuth, isAdmin, idParam, controller.delete);
