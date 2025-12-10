import { Router } from "express";
import { LevelRepository } from "../domain/repositories/LevelRepository.js";
import { LevelService } from "../services/LevelService.js";
import { LevelController } from "../controllers/LevelController.js";
import { idParam, upsertLevel } from "../validators/levelValidator.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

// dependency injection
const repo = new LevelRepository();
const service = new LevelService(repo);
const controller = new LevelController(service);

export const levelRoutes = Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/
levelRoutes.get("/", controller.list);
levelRoutes.get("/:id", idParam, controller.get);

/*
|--------------------------------------------------------------------------
| ADMIN-PROTECTED ROUTES
|--------------------------------------------------------------------------
*/
levelRoutes.post("/", requireAuth, isAdmin, upsertLevel, controller.create);
levelRoutes.put(
  "/:id",
  requireAuth,
  isAdmin,
  [...idParam, ...upsertLevel],
  controller.update
);
levelRoutes.delete("/:id", requireAuth, isAdmin, idParam, controller.delete);
