import { validationResult } from "express-validator";

/**
 * Controller responsible for managing user level progress.
 *
 * Supports listing by query, fetching by primary key or composite keys,
 * creating, updating status, upserting progress, and deleting records.
 */
export class UserLevelController {
  /**
   * @param {object} userLevelService - Service handling business logic for user levels.
   */
  constructor(userLevelService) {
    this.userLevelService = userLevelService;
  }

  /**
   * Validates the incoming request using express-validator.
   * Sends 400 with validation error details if any are present.
   *
   * @private
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {boolean} true if validation failed and a response was sent, otherwise false
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
   * Lists user-level records.
   *
   * - If both `user_id` and `level_id` query params are provided, returns a single record.
   * - If only `user_id` is provided, returns all levels for that user.
   * - Otherwise, returns all records (admin use).
   *
   * @async
   * @method list
   * @param {import('express').Request} req - Optional query: `user_id`, `level_id`.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * GET /user-levels
   * GET /user-levels?user_id=123
   * GET /user-levels?user_id=123&level_id=2
   */
  list = async (req, res, next) => {
    try {
      const { user_id, level_id } = req.query || {};

      if (user_id && level_id) {
        const row = await this.userLevelService.getUserLevel(user_id, level_id);
        if (!row) return res.status(404).json({ message: "User level not found" });
        return res.json(row);
      }

      if (user_id) {
        const rows = await this.userLevelService.getUserLevels(user_id);
        return res.json(rows);
      }

      const levels = await this.userLevelService.listUserLevels();
      res.json(levels);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Retrieves a user-level record by its primary key (ID).
   *
   * @async
   * @method getById
   * @param {import('express').Request} req - Path param `:id` is the user_level_id.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * GET /user-levels/:id
   */
  getById = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const level = await this.userLevelService.getById(req.params.id);
      if (!level) return res.status(404).json({ message: "User level not found" });
      res.json(level);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Lists all level records for a specific user.
   *
   * @async
   * @method listByUser
   * @param {import('express').Request} req - Path param `:user_id`.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * GET /users/:user_id/levels
   */
  listByUser = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const rows = await this.userLevelService.getUserLevels(req.params.user_id);
      res.json(rows);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Retrieves a user-level record by user and level IDs.
   *
   * @async
   * @method getByUserAndLevel
   * @param {import('express').Request} req - Path params `:user_id` and `:level_id`.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * GET /users/:user_id/levels/:level_id
   */
  getByUserAndLevel = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const row = await this.userLevelService.getUserLevel(
        req.params.user_id,
        req.params.level_id
      );
      if (!row) return res.status(404).json({ message: "User level not found" });
      res.json(row);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Creates a new user-level record.
   *
   * @async
   * @method create
   * @param {import('express').Request} req - Body should contain user/level and status fields.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * POST /user-levels
   */
  create = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const newLevel = await this.userLevelService.createUserLevel(req.body);
      res.status(201).json(newLevel);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Updates a user-level record by ID.
   *
   * Uses the service method `updateUserLevelStatus` to update status fields.
   *
   * @async
   * @method update
   * @param {import('express').Request} req - Path param `:id`; body contains fields to update.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * PUT /user-levels/:id
   */
  update = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const updatedLevel = await this.userLevelService.updateUserLevelStatus(
        req.params.id,
        req.body
      );
      if (!updatedLevel) return res.status(404).json({ message: "User level not found" });
      res.status(200).json(updatedLevel);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Creates or updates a user-level record (idempotent).
   *
   * If the record exists, updates progress; otherwise, creates it.
   *
   * @async
   * @method upsert
   * @param {import('express').Request} req - Body: { user_id, level_id, unlocked?, completed? }.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * POST /user-levels/upsert
   * { "user_id": 1, "level_id": 2, "unlocked": true, "completed": false }
   */
  upsert = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const { user_id, level_id, unlocked = false, completed = false } = req.body || {};
      const row = await this.userLevelService.upsertUserLevelProgress({
        user_id,
        level_id,
        unlocked,
        completed,
      });
      res.status(200).json(row);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Deletes a user-level record by ID.
   *
   * @async
   * @method delete
   * @param {import('express').Request} req - Path param `:id`.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * DELETE /user-levels/:id
   */
  delete = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const ok = await this.userLevelService.deleteUserLevel(req.params.id);
      if (!ok) return res.status(404).json({ message: "User level not found" });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
