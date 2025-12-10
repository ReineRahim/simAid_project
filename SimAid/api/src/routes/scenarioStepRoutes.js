import { Router } from "express";
import { ScenarioStepRepository } from "../domain/repositories/ScenarioStepRepository.js";
import { ScenarioStepService } from "../services/ScenarioStepService.js";
import { ScenarioStepController } from "../Controllers/ScenarioStepController.js";
import {
  idParam,
  upsertScenarioStep,
} from "../validators/scenarioStepValidator.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

// Setup dependencies
const repo = new ScenarioStepRepository();
const service = new ScenarioStepService(repo);
const controller = new ScenarioStepController(service);

export const scenarioStepRoutes = Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/
scenarioStepRoutes.get("/", controller.list);
scenarioStepRoutes.get("/:id", idParam, controller.get);

/*
|--------------------------------------------------------------------------
| ADMIN-PROTECTED ROUTES
|--------------------------------------------------------------------------
*/
scenarioStepRoutes.post(
  "/",
  requireAuth,
  isAdmin,
  upsertScenarioStep,
  controller.create
);
scenarioStepRoutes.put(
  "/:id",
  requireAuth,
  isAdmin,
  [...idParam, ...upsertScenarioStep],
  controller.update
);
scenarioStepRoutes.delete(
  "/:id",
  requireAuth,
  isAdmin,
  idParam,
  controller.delete
);
