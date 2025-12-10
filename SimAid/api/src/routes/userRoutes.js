import { Router } from 'express';
import { UserRepository } from '../domain/repositories/UserRepository.js';
import { UserService } from '../services/UserService.js';
import { UserController } from '../Controllers/UserController.js';
import { idParam, upsertUser } from '../validators/userValidator.js';
import { requireAuth } from "../middlewares/requireAuth.js"; 
import { isAdmin } from "../middlewares/isAdmin.js";  

const repo = new UserRepository();
const service = new UserService(repo);
const controller = new UserController(service);

export const userRoutes = Router();

userRoutes.post("/register", controller.register);
userRoutes.post("/login", controller.login);
userRoutes.get("/", requireAuth, isAdmin, controller.list);
userRoutes.get("/:id", requireAuth, isAdmin, idParam, controller.get);
userRoutes.post("/", requireAuth, isAdmin, upsertUser, controller.create);
userRoutes.put("/:id", requireAuth, isAdmin, [...idParam, ...upsertUser], controller.update);
userRoutes.delete("/:id", requireAuth, isAdmin, idParam, controller.delete);


