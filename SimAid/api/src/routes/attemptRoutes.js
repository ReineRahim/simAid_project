import { Router } from "express";
import { AttemptRepository } from "../domain/repositories/AttemptRepository.js";
import { AttemptService } from "../services/AttemptService.js";
import { AttemptController } from "../Controllers/AttemptController.js";
import { body, param } from "express-validator";

const repo = new AttemptRepository();
const service = new AttemptService(repo);
const controller = new AttemptController(service);

export const attemptRoutes = Router();

const idParam = [
  param("id").isInt({ gt: 0 }).withMessage("id must be a positive integer"),
];
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

// 📋 Routes
attemptRoutes.get("/user/:user_id/level/:level_id", controller.getUserAttemptsByLevel);
attemptRoutes.get("/", controller.list);
attemptRoutes.get("/:id", idParam, controller.get);
attemptRoutes.get("/user/:user_id/scenario/:scenario_id",controller.getUserAttempt);
attemptRoutes.post("/", upsertAttempt, controller.save);


