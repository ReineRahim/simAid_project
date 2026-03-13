import { validationResult } from "express-validator";

/**
 * Controller responsible for handling user-related operations.
 *
 * Provides routes for registration, login, listing user badges,
 * and performing standard CRUD operations on users.
 */
export class UserController {
  /**
   * @param {object} service - The UserService instance handling user-related business logic.
   */
  constructor(service) {
    this.service = service;
  }

  /**
   * Validates the incoming request using express-validator.
   * Sends a 400 response if validation errors are found.
   *
   * @private
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
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
   * Registers a new user.
   *
   * @async
   * @method register
   * @param {import('express').Request} req - Body should include user registration details.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * POST /users/register
   * {
   *   "name": "Jane Doe",
   *   "email": "jane@example.com",
   *   "password": "securePassword123"
   * }
   */
  register = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const user = await this.service.register(req.body);
      res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Authenticates a user and returns a token.
   *
   * @async
   * @method login
   * @param {import('express').Request} req - Body should contain email and password.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * POST /users/login
   * {
   *   "email": "jane@example.com",
   *   "password": "securePassword123"
   * }
   */
  login = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const token = await this.service.login(req.body.email, req.body.password);
      res.status(200).json(token);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Lists all badges associated with the authenticated user.
   *
   * @async
   * @method list
   * @param {import('express').Request} req - Expects authenticated user (req.user.id).
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * GET /users/badges
   */
  list = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      // Assuming userBadgeService is available within the same context
      const badges = await this.userBadgeService.listUserBadgesByUserId(userId);
      res.json(badges);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Retrieves a single user by ID.
   *
   * @async
   * @method get
   * @param {import('express').Request} req - Path parameter contains user ID.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * GET /users/:id
   */
  get = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const user = await this.service.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.status(200).json(user);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Creates a new user (admin or system use).
   *
   * @async
   * @method create
   * @param {import('express').Request} req - Body should contain user details.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * POST /users
   */
  create = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const newUser = await this.service.createUser(req.body);
      res.status(201).json(newUser);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Updates an existing user by ID.
   *
   * @async
   * @method update
   * @param {import('express').Request} req - Path parameter contains user ID; body includes update data.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * PUT /users/:id
   */
  update = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const updatedUser = await this.service.updateUser(req.params.id, req.body);
      if (!updatedUser)
        return res.status(404).json({ message: "User not found" });
      res.status(200).json(updatedUser);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Deletes a user by ID.
   *
   * @async
   * @method delete
   * @param {import('express').Request} req - Path parameter contains user ID.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * DELETE /users/:id
   */
  delete = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const ok = await this.service.deleteUser(req.params.id);
      if (!ok) return res.status(404).json({ message: "User not found" });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
