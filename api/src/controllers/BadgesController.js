import { validationResult } from "express-validator";

/**
 * Controller class responsible for handling all badge-related HTTP requests.
 * 
 * Provides CRUD operations for badges, including both public and admin routes.
 */
export class BadgesController {
  /**
   * @param {object} badgesService - Instance of the BadgesService that contains business logic for badge operations.
   */
  constructor(badgesService) {
    this.badgesService = badgesService;
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
   * Retrieves and returns a list of all available badges.
   *
   * @async
   * @method list
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>}
   * @example
   * GET /badges
   */
  list = async (req, res, next) => {
    try {
      const badges = await this.badgesService.listBadges();
      res.json(badges);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Retrieves a single badge by its ID.
   *
   * @async
   * @method get
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * GET /badges/:id
   */
  get = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const badge = await this.badgesService.getBadge(req.params.id);
      if (!badge) return res.status(404).json({ message: "Badge not found" });
      res.json(badge);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Creates a new badge (Admin only).
   *
   * @async
   * @method create
   * @param {import('express').Request} req - The Express request object containing badge data.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * POST /badges
   * {
   *   "name": "Expert Learner",
   *   "description": "Awarded for mastering all levels"
   * }
   */
  create = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const newBadge = await this.badgesService.createBadge(req.body);
      res.status(201).json(newBadge);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Updates an existing badge by ID (Admin only).
   *
   * @async
   * @method update
   * @param {import('express').Request} req - The Express request object containing badge updates.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * PUT /badges/:id
   * {
   *   "description": "Updated description for the badge"
   * }
   */
  update = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const updatedBadge = await this.badgesService.updateBadge(
        req.params.id,
        req.body
      );
      if (!updatedBadge)
        return res.status(404).json({ message: "Badge not found" });
      res.status(200).json(updatedBadge);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Deletes a badge by ID (Admin only).
   *
   * @async
   * @method delete
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * DELETE /badges/:id
   */
  delete = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const ok = await this.badgesService.deleteBadge(req.params.id);
      if (!ok) return res.status(404).json({ message: "Badge not found" });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
