import { Router } from 'express';
import { StepAttemptRepository } from '../domain/repositories/StepAttemptRepository.js';
import { StepAttemptService } from '../services/StepAttemptService.js';
import { StepAttemptController } from '../Controllers/StepAttemptController.js';
import { idParam, upsertStepAttempt } from '../validators/stepAttemptValidator.js';

/**
 * Express router module for handling scenario step attempts.
 *
 * These routes manage user responses to individual scenario steps —
 * allowing admins or the app to list, fetch, create, and delete step-level attempts.
 * Typically, a "step attempt" is recorded automatically when a user answers a question
 * during a scenario simulation.
 *
 * @module stepAttemptRoutes
 *
 * @example
 * import express from "express";
 * import { stepAttemptRoutes } from "./routes/stepAttemptRoutes.js";
 *
 * const app = express();
 * app.use("/step-attempts", stepAttemptRoutes);
 */
const repo = new StepAttemptRepository();
const service = new StepAttemptService(repo);
const controller = new StepAttemptController(service);

/**
 * Express Router instance for step attempt routes.
 * @type {import('express').Router}
 */
export const stepAttemptRoutes = Router();

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

/**
 * @route GET /step-attempts
 * @summary Retrieve all step attempts.
 * @access Admin / Debug
 * @returns {StepAttempt[]} 200 - List of all recorded step attempts.
 * @example
 * GET /step-attempts
 * Response: [
 *   { step_attempt_id: 1, attempt_id: 12, step_id: 5, user_action: "A", is_correct: true }
 * ]
 */
stepAttemptRoutes.get('/', controller.list);

/**
 * @route GET /step-attempts/:id
 * @summary Retrieve a single step attempt by its ID.
 * @access Admin / Debug
 * @param {number} id - The unique ID of the step attempt.
 * @returns {StepAttempt} 200 - Step attempt details.
 * @example
 * GET /step-attempts/3
 * Response: {
 *   step_attempt_id: 3,
 *   attempt_id: 14,
 *   step_id: 7,
 *   user_action: "B",
 *   is_correct: false
 * }
 */
stepAttemptRoutes.get('/:id', idParam, controller.get);

/**
 * @route GET /step-attempts/attempt/:attempt_id
 * @summary Retrieve all step attempts associated with a given scenario attempt.
 * @access Admin / Debug
 * @param {number} attempt_id - The ID of the parent scenario attempt.
 * @returns {StepAttempt[]} 200 - List of related step attempts.
 * @example
 * GET /step-attempts/attempt/10
 * Response: [
 *   { step_attempt_id: 5, step_id: 2, user_action: "A", is_correct: true },
 *   { step_attempt_id: 6, step_id: 3, user_action: "C", is_correct: false }
 * ]
 */
stepAttemptRoutes.get('/attempt/:attempt_id', controller.getByAttempt);

/**
 * @route POST /step-attempts
 * @summary Create a new step attempt record (usually triggered automatically when a user answers a question).
 * @access Public / Application-level
 * @middleware upsertStepAttempt - Validates request body parameters.
 * @bodyParam {number} attempt_id - ID of the associated scenario attempt.
 * @bodyParam {number} step_id - ID of the step being answered.
 * @bodyParam {string} user_action - The user’s selected answer (e.g., "A", "B", "C", or "D").
 * @bodyParam {boolean} is_correct - Whether the user’s action was correct.
 * @returns {StepAttempt} 201 - The newly created step attempt.
 * @example
 * POST /step-attempts
 * Body: {
 *   "attempt_id": 14,
 *   "step_id": 7,
 *   "user_action": "C",
 *   "is_correct": false
 * }
 */
stepAttemptRoutes.post('/', upsertStepAttempt, controller.create);

/**
 * @route DELETE /step-attempts/:id
 * @summary Delete a specific step attempt by its ID.
 * @access Admin / Debug
 * @middleware idParam - Validates step attempt ID parameter.
 * @param {number} id - Step attempt ID.
 * @returns {void} 204 - Successfully deleted, no response body.
 * @example
 * DELETE /step-attempts/5
 */
stepAttemptRoutes.delete('/:id', idParam, controller.delete);
