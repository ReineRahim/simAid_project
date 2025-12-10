import { Router } from 'express';
import { StepAttemptRepository } from '../domain/repositories/StepAttemptRepository.js';
import { StepAttemptService } from '../services/StepAttemptService.js';
import { StepAttemptController } from '../Controllers/StepAttemptController.js';
import { idParam, upsertStepAttempt } from '../validators/stepAttemptValidator.js';

const repo = new StepAttemptRepository();
const service = new StepAttemptService(repo);
const controller = new StepAttemptController(service);

export const stepAttemptRoutes = Router();

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

// List all step attempts (Admin / Debug)
stepAttemptRoutes.get('/', controller.list);

// Get a specific step attempt
stepAttemptRoutes.get('/:id', idParam, controller.get);

// Get all step attempts for a specific scenario attempt
stepAttemptRoutes.get('/attempt/:attempt_id', controller.getByAttempt);

// Create a new step attempt (automatically recorded when user submits an answer)
stepAttemptRoutes.post('/', upsertStepAttempt, controller.create);

stepAttemptRoutes.delete('/:id', idParam, controller.delete);
