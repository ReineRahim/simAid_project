import { Router } from "express";
import { ScenarioStepRepository } from "../domain/repositories/ScenarioStepRepository.js";
import { ScenarioStepService } from "../services/ScenarioStepService.js";
import { ScenarioStepController } from "../Controllers/ScenarioStepController.js";
import { idParam, upsertScenarioStep } from "../validators/scenarioStepValidator.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

/**
 * Express router module for managing scenario step operations.
 *
 * Provides routes for listing, retrieving, creating, updating, and deleting
 * scenario steps (individual multiple-choice questions within a scenario).
 * Public routes are available for reading data, while creation, modification,
 * and deletion require admin authorization.
 *
 * @module scenarioStepRoutes
 *
 * @example
 * import express from "express";
 * import { scenarioStepRoutes } from "./routes/scenarioStepRoutes.js";
 *
 * const app = express();
 * app.use("/scenario-steps", scenarioStepRoutes);
 */
const repo = new ScenarioStepRepository();
const service = new ScenarioStepService(repo);
const controller = new ScenarioStepController(service);

/**
 * Express Router instance for scenario step routes.
 * @type {import('express').Router}
 */
export const scenarioStepRoutes = Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route GET /scenario-steps
 * @summary Retrieve a list of all scenario steps.
 * @access Public
 * @returns {ScenarioStep[]} 200 - List of all steps across scenarios.
 * @example
 * GET /scenario-steps
 * Response: [{ step_id: 1, scenario_id: 3, question_text: "What is the first action?" }]
 */
scenarioStepRoutes.get("/", controller.list);

/**
 * @route GET /scenario-steps/:id
 * @summary Retrieve a single scenario step by its ID.
 * @access Public
 * @param {number} id - The ID of the scenario step.
 * @returns {ScenarioStep} 200 - The step details.
 * @example
 * GET /scenario-steps/5
 * Response: {
 *   step_id: 5,
 *   scenario_id: 2,
 *   question_text: "Choose the safest response",
 *   options: { A: "Call for help", B: "Ignore", C: "Run", D: "Wait" },
 *   correct_action: "A"
 * }
 */
scenarioStepRoutes.get("/:id", idParam, controller.get);

/*
|--------------------------------------------------------------------------
| ADMIN-PROTECTED ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route POST /scenario-steps
 * @summary Create a new scenario step (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures the user is authenticated.
 * @middleware isAdmin - Restricts access to admin users.
 * @middleware upsertScenarioStep - Validates the request body.
 * @bodyParam {number} scenario_id - ID of the associated scenario.
 * @bodyParam {number} step_order - The step order within the scenario.
 * @bodyParam {string} question_text - The question or prompt.
 * @bodyParam {string} option_a - Option A text.
 * @bodyParam {string} option_b - Option B text.
 * @bodyParam {string} option_c - Option C text.
 * @bodyParam {string} option_d - Option D text.
 * @bodyParam {string} correct_action - The correct answer ("A", "B", "C", or "D").
 * @bodyParam {string} feedback_message - Feedback for the user.
 * @returns {ScenarioStep} 201 - The created step entity.
 * @example
 * POST /scenario-steps
 * Body: {
 *   "scenario_id": 2,
 *   "step_order": 1,
 *   "question_text": "What should you do first?",
 *   "option_a": "Evacuate",
 *   "option_b": "Hide",
 *   "option_c": "Call supervisor",
 *   "option_d": "Wait",
 *   "correct_action": "A",
 *   "feedback_message": "Always evacuate when safe."
 * }
 */
scenarioStepRoutes.post("/", requireAuth, isAdmin, upsertScenarioStep, controller.create);

/**
 * @route PUT /scenario-steps/:id
 * @summary Update an existing scenario step (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures authentication.
 * @middleware isAdmin - Restricts to admin users.
 * @middleware idParam - Validates step ID.
 * @middleware upsertScenarioStep - Validates the request body.
 * @param {number} id - Step ID.
 * @returns {ScenarioStep} 200 - Updated step details.
 * @example
 * PUT /scenario-steps/4
 * Body: {
 *   "question_text": "Update question text",
 *   "correct_action": "B"
 * }
 */
scenarioStepRoutes.put(
  "/:id",
  requireAuth,
  isAdmin,
  [...idParam, ...upsertScenarioStep],
  controller.update
);

/**
 * @route DELETE /scenario-steps/:id
 * @summary Delete a scenario step by ID (admin-only).
 * @access Admin
 * @middleware requireAuth - Ensures authentication.
 * @middleware isAdmin - Restricts to admins only.
 * @param {number} id - Step ID.
 * @returns {void} 204 - Successfully deleted.
 * @example
 * DELETE /scenario-steps/6
 */
scenarioStepRoutes.delete("/:id", requireAuth, isAdmin, idParam, controller.delete);
