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

const scenarioRepo = new ScenarioRepository();
const scenarioSvc = new ScenarioService(scenarioRepo);

const stepRepo = new ScenarioStepRepository();
const stepSvc = new ScenarioStepService(stepRepo);

const attemptRepo = new AttemptRepository();
const badgeRepo = new BadgesRepository();
const userBadgeRepo = new UserBadgeRepository();
const userLevelRepo = new UserLevelRepository();

console.log('Repo methods:', Object.getOwnPropertyNames(ScenarioRepository.prototype));


const controller = new ScenarioController(
  scenarioSvc,
  stepSvc,
  attemptRepo,
  badgeRepo,
  userBadgeRepo,
  userLevelRepo
);

export const scenarioRoutes = Router();

// PUBLIC — order matters: put /level first
scenarioRoutes.get("/level/:levelId", controller.listByLevel);
scenarioRoutes.get("/", controller.list);
scenarioRoutes.get("/:id", idParam, controller.get);
scenarioRoutes.post("/:id/submit", requireAuth, controller.submit); 



// ADMIN
scenarioRoutes.post("/", requireAuth, isAdmin, upsertScenario, controller.create);
scenarioRoutes.put("/:id", requireAuth, isAdmin, [...idParam, ...upsertScenario], controller.update);
scenarioRoutes.delete("/:id", requireAuth, isAdmin, idParam, controller.delete);
