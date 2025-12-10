import { Router } from "express";
import { UserBadgeRepository } from "../domain/repositories/UserBadgeRepository.js";
import { UserBadgeService } from "../services/UserBadgeService.js";
import { UserBadgeController } from "../Controllers/UserBadgeController.js";
import { idParam, upsertUserBadge } from "../validators/userBadgeValidator.js";

const repo = new UserBadgeRepository();
const service = new UserBadgeService(repo);
const controller = new UserBadgeController(service);

export const userBadgeRoutes = Router();

userBadgeRoutes.get("/", controller.list);
userBadgeRoutes.get("/:id", idParam, controller.get);
userBadgeRoutes.post("/", upsertUserBadge, controller.create);
userBadgeRoutes.put("/:id",[...idParam, ...upsertUserBadge],controller.update);
userBadgeRoutes.delete("/:id", idParam, controller.delete);
