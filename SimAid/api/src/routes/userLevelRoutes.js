import { Router } from "express";
import { UserLevelRepository } from "../domain/repositories/UserLevelRepository.js";
import { UserLevelService } from "../services/UserLevelService.js";
import { UserLevelController } from "../Controllers/UserLevelController.js";
import { idParam /*, upsertUserLevel*/ } from "../validators/userLevelValidator.js";

const repo = new UserLevelRepository();
const service = new UserLevelService(repo);
const controller = new UserLevelController(service);

export const userLevelRoutes = Router();

/**
 * Public/admin listing & query:
 * - GET /user-levels                         -> list all
 * - GET /user-levels?user_id=3               -> list by user
 * - GET /user-levels?user_id=3&level_id=2    -> single by (user, level)
 */
userLevelRoutes.get("/", controller.list);

// By primary key
userLevelRoutes.get("/:id", idParam, controller.getById);

// User-scoped routes (clean for frontend)
userLevelRoutes.get("/by-user/:user_id/levels", controller.listByUser);
userLevelRoutes.get("/by-user/:user_id/levels/:level_id", controller.getByUserAndLevel);

// CRUD
userLevelRoutes.post("/", /* upsertUserLevel,*/ controller.create);
userLevelRoutes.put("/:id", /* [...idParam, ...upsertUserLevel],*/ controller.update);
userLevelRoutes.delete("/:id", idParam, controller.delete);

// Upsert progress (simple body: { user_id, level_id, unlocked, completed })
userLevelRoutes.post("/upsert", /* upsertUserLevel,*/ controller.upsert);
