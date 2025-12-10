import { validationResult } from 'express-validator';

export class AttemptController {
  constructor(attemptService) {
    this.attemptService = attemptService;
  }

  _validate(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return true;
    }
    return false;
  }

  // 📋 List all attempts
  list = async (req, res, next) => {
    try {
      const attempts = await this.attemptService.listAttempts();
      res.json(attempts);
    } catch (e) {
      next(e);
    }
  };

  // 🔍 Get attempt by ID
  get = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const attempt = await this.attemptService.getAttempt(req.params.id);
      if (!attempt) return res.status(404).json({ message: 'Attempt not found' });
      res.json(attempt);
    } catch (e) {
      next(e);
    }
  };

  // 👤 Get specific user attempt by scenario
  getUserAttempt = async (req, res, next) => {
    try {
      const { user_id, scenario_id } = req.params;
      const attempt = await this.attemptService.getUserAttempt(user_id, scenario_id);
      if (!attempt) return res.status(404).json({ message: 'No attempt found' });
      res.json(attempt);
    } catch (e) {
      next(e);
    }
  };

  // 🧠 Create or update best score
  save = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const { user_id, scenario_id, score } = req.body;
      const newAttempt = await this.attemptService.saveBestScore({ user_id, scenario_id, score });
      res.status(201).json(newAttempt);
    } catch (e) {
      next(e);
    }
  };

  getUserAttemptsByLevel = async (req, res, next) => {
  try {
    const { user_id, level_id } = req.params;
    const attempts = await this.attemptService.getUserAttemptsByLevel(user_id, level_id);
    res.json(attempts);
  } catch (e) {
    next(e);
  }
};
}
