import { validationResult } from 'express-validator';

/**
 * Controller class responsible for handling HTTP requests related to user attempts.
 * It communicates with the AttemptService to perform database operations such as
 * listing, retrieving, and saving attempt data.
 */
export class AttemptController {
  /**
   * @param {object} attemptService - Instance of the AttemptService handling database logic.
   */
  constructor(attemptService) {
    this.attemptService = attemptService;
  }

  /**
   * Validates incoming request using express-validator.
   * Sends a 400 response if validation errors are found.
   *
   * @private
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @returns {boolean} Returns true if validation failed and response is sent, otherwise false.
   */
  _validate(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return true;
    }
    return false;
  }

  /**
   * Retrieves and returns a list of all attempts.
   *
   * @async
   * @method list
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next - Express next middleware function.
   */
  list = async (req, res, next) => {
    try {
      const attempts = await this.attemptService.listAttempts();
      res.json(attempts);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Retrieves a specific attempt by its ID.
   *
   * @async
   * @method get
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   */
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

  /**
   * Retrieves a user's attempt for a specific scenario.
   *
   * @async
   * @method getUserAttempt
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   */
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

  /**
   * Creates or updates a user's best score for a scenario.
   *
   * @async
   * @method save
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   */
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

  /**
   * Retrieves all attempts for a given user filtered by level.
   *
   * @async
   * @method getUserAttemptsByLevel
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   */
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
