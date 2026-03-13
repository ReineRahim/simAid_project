import { validationResult } from 'express-validator';

/**
 * Controller class responsible for handling all level-related HTTP requests.
 * 
 * Provides endpoints to list, retrieve, create, update, and delete levels.
 */
export class LevelController {
  /**
   * @param {object} levelService - Instance of the LevelService that manages business logic for level operations.
   */
  constructor(levelService) {
    this.levelService = levelService;
  }

  /**
   * Validates the incoming request using express-validator.
   * If validation errors exist, returns a 400 Bad Request response.
   *
   * @private
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @returns {boolean} Returns true if validation fails and a response is sent, otherwise false.
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
   * Retrieves and returns a list of all levels.
   *
   * @async
   * @method list
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * GET /levels
   */
  list = async (req, res, next) => {
    try {
      const levels = await this.levelService.listLevels();
      res.json(levels);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Retrieves a specific level by ID.
   *
   * @async
   * @method get
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * GET /levels/:id
   */
  get = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const level = await this.levelService.getLevel(req.params.id);
      if (!level) return res.status(404).json({ message: 'Level not found' });
      res.json(level);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Creates a new level entry.
   *
   * @async
   * @method create
   * @param {import('express').Request} req - The Express request object containing level data.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * POST /levels
   * {
   *   "name": "Intermediate",
   *   "description": "For users with some experience"
   * }
   */
  create = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const newLevel = await this.levelService.createLevel(req.body);
      res.status(201).json(newLevel);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Updates an existing level by ID.
   *
   * @async
   * @method update
   * @param {import('express').Request} req - The Express request object containing updated level data.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * PUT /levels/:id
   */
  update = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const updatedLevel = await this.levelService.updateLevel(req.params.id, req.body);
      if (!updatedLevel) return res.status(404).json({ message: 'Level not found' });
      res.status(200).json(updatedLevel);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Deletes a level by its ID.
   *
   * @async
   * @method delete
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * DELETE /levels/:id
   */
  delete = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const ok = await this.levelService.deleteLevel(req.params.id);
      if (!ok) return res.status(404).json({ message: 'Level not found' });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
