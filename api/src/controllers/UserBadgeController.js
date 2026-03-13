import { validationResult } from 'express-validator';

/**
 * Controller responsible for managing user badges.
 *
 * Provides endpoints to list, retrieve, create, update, and delete user badges.
 * Typically used for tracking badges assigned to users for achievements or milestones.
 */
export class UserBadgeController {
  /**
   * @param {object} userBadgeService - Instance of the service that handles business logic for user badges.
   */
  constructor(userBadgeService) {
    this.userBadgeService = userBadgeService;
  }

  /**
   * Validates the request using express-validator.
   * If validation errors exist, responds with a 400 status and error details.
   *
   * @private
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @returns {boolean} Returns true if validation fails and response is sent; otherwise false.
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
   * Retrieves and returns a list of all user badges.
   *
   * @async
   * @method list
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next - Express middleware function.
   * @returns {Promise<void>}
   * @example
   * GET /user-badges
   */
  list = async (req, res, next) => {
    try {
      const badges = await this.userBadgeService.listUserBadges();
      res.json(badges);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Retrieves a single user badge by ID.
   *
   * @async
   * @method get
   * @param {import('express').Request} req - Path parameter should contain badge ID.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * GET /user-badges/:id
   */
  get = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const badge = await this.userBadgeService.getUserBadge(req.params.id);
      if (!badge)
        return res.status(404).json({ message: 'User badge not found' });
      res.json(badge);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Creates a new user badge.
   *
   * @async
   * @method create
   * @param {import('express').Request} req - Body should contain user_id and badge_id, among other details.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * POST /user-badges
   * {
   *   "user_id": 101,
   *   "badge_id": 5
   * }
   */
  create = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const newBadge = await this.userBadgeService.createUserBadge(req.body);
      res.status(201).json(newBadge);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Updates an existing user badge.
   *
   * @async
   * @method update
   * @param {import('express').Request} req - Path parameter should contain badge ID; body includes update data.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * PUT /user-badges/:id
   * {
   *   "status": "revoked"
   * }
   */
  update = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const updatedBadge = await this.userBadgeService.updateUserBadge(
        req.params.id,
        req.body
      );
      if (!updatedBadge)
        return res.status(404).json({ message: 'User badge not found' });
      res.status(200).json(updatedBadge);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Deletes a user badge by ID.
   *
   * @async
   * @method delete
   * @param {import('express').Request} req - Path parameter should contain badge ID.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * DELETE /user-badges/:id
   */
  delete = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const ok = await this.userBadgeService.deleteUserBadge(req.params.id);
      if (!ok)
        return res.status(404).json({ message: 'User badge not found' });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
