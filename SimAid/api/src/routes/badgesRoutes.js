import { Router } from "express";
import { BadgesRepository } from "../domain/repositories/BadgesRepository.js";
import { BadgesService } from "../services/BadgesService.js";
import { BadgesController } from "../controllers/BadgesController.js";
import { idParam, upsertBadge } from "../validators/badgeValidator.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { isAdmin } from "../middlewares/isAdmin.js";

// Dependency injection
const repo = new BadgesRepository();
const service = new BadgesService(repo);
const controller = new BadgesController(service);

export const badgeRoutes = Router();

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/
badgeRoutes.get("/", controller.list);
badgeRoutes.get("/:id", idParam, controller.get);

/*
|--------------------------------------------------------------------------
| ADMIN-PROTECTED ROUTES
|--------------------------------------------------------------------------
*/
badgeRoutes.post("/", requireAuth, isAdmin, upsertBadge, controller.create);
badgeRoutes.put("/:id", requireAuth, isAdmin, [...idParam, ...upsertBadge], controller.update);
badgeRoutes.delete("/:id", requireAuth, isAdmin, idParam, controller.delete);
