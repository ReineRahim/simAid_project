import { Router } from "express";
import { AttemptRepository } from "../domain/repositories/AttemptRepository.js";
import { AttemptService } from "../services/AttemptService.js";
import { AttemptController } from "../Controllers/AttemptController.js";
import { body, param } from "express-validator";

/**
 * Express router module for handling attempt-related API routes.
 *
 * This module defines endpoints for managing user attempts within scenarios,
 * including listing all attempts, retrieving attempts by user or scenario,
 * and saving new or updated scores.
 *
 * It composes the route layer by connecting:
 * - Repository (`AttemptRepository`): database access
 * - Service (`AttemptService`): business logic
 * - Controller (`AttemptController`): request handling and responses
 *
 * @module attemptRoutes
 *
 * @example
 * import express from "express";
 * import { attemptRoutes } from "./routes/attemptRoutes.js";
 *
 * const app = express();
 * app.use("/attempts", attemptRoutes);
 */
const repo = new AttemptRepository();
const service = new AttemptService(repo);
const controller = new AttemptController(service);

/**
 * Express Router instance for attempt routes.
 * @type {import('express').Router}
 */
export const attemptRoutes = Router();

/**
 * Validation middleware for the `id` route parameter.
 * Ensures the parameter is a positive integer.
 */
const idParam = [
  param("id").isInt({ gt: 0 }).withMessage("id must be a positive integer"),
];

/**
 * Validation middleware for creating or updating attempts.
 * Validates that:
 * - `user_id` and `scenario_id` are positive integers.
 * - `score` is an integer between 0 and 100.
 */
const upsertAttempt = [
  body("user_id")
    .isInt({ gt: 0 })
    .withMessage("user_id must be a positive integer"),
  body("scenario_id")
    .isInt({ gt: 0 })
    .withMessage("scenario_id must be a positive integer"),
  body("score")
    .isInt({ min: 0, max: 100 })
    .withMessage("score must be between 0 and 100"),
];

/**
 * 📋 Attempt Routes
 *
 * @route GET /attempts
 * @summary Retrieve all attempts (admin/debug).
 *
 * @route GET /attempts/:id
 * @summary Retrieve a single attempt by ID.
 * @param {number} id - Attempt ID.
 *
 * @route GET /attempts/user/:user_id/scenario/:scenario_id
 * @summary Retrieve a specific user's attempt for a given scenario.
 * @param {number} user_id - User ID.
 * @param {number} scenario_id - Scenario ID.
 *
 * @route GET /attempts/user/:user_id/level/:level_id
 * @summary Retrieve all attempts by user for a given level.
 * @param {number} user_id - User ID.
 * @param {number} level_id - Level ID.
 *
 * @route POST /attempts
 * @summary Create or update an attempt score (upsert behavior).
 * @bodyParam {number} user_id - The user's ID.
 * @bodyParam {number} scenario_id - The associated scenario ID.
 * @bodyParam {number} score - Score between 0 and 100.
 */
attemptRoutes.get(
  "/user/:user_id/level/:level_id",
  controller.getUserAttemptsByLevel
);

attemptRoutes.get("/", controller.list);
attemptRoutes.get("/:id", idParam, controller.get);
attemptRoutes.get(
  "/user/:user_id/scenario/:scenario_id",
  controller.getUserAttempt
);
attemptRoutes.post("/", upsertAttempt, controller.save);
