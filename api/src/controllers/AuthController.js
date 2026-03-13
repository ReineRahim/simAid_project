import { validationResult } from 'express-validator';

/**
 * Controller class for handling authentication-related requests.
 * 
 * Provides methods for registering new users, logging in existing users,
 * and retrieving the authenticated user's profile information.
 */
export class AuthController {
  /**
   * @param {object} authService - Instance of the AuthService responsible for business logic.
   */
  constructor(authService) {
    this.authService = authService;
  }

  /**
   * Validates incoming requests using express-validator.
   * If validation fails, sends a 400 Bad Request response.
   *
   * @private
   * @param {import('express').Request} req - The Express request object.
   * @param {import('express').Response} res - The Express response object.
   * @returns {boolean} Returns true if validation errors exist and a response is sent, otherwise false.
   */
  _handleValidation(req, res) {
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
   * @param {import('express').Request} req - The Express request object containing user registration data.
   * @param {import('express').Response} res - The Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>}
   * @example
   * POST /auth/register
   * {
   *   "username": "john_doe",
   *   "email": "john@example.com",
   *   "password": "securePassword123"
   * }
   */
  register = async (req, res, next) => {
    try {
      if (this._handleValidation(req, res)) return;
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Logs in an existing user.
   *
   * @async
   * @method login
   * @param {import('express').Request} req - The Express request object containing user credentials.
   * @param {import('express').Response} res - The Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>}
   * @example
   * POST /auth/login
   * {
   *   "email": "john@example.com",
   *   "password": "securePassword123"
   * }
   */
  login = async (req, res, next) => {
    try {
      if (this._handleValidation(req, res)) return;
      const result = await this.authService.login(req.body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Retrieves the currently authenticated user's profile information.
   *
   * @async
   * @method me
   * @param {import('express').Request} req - The Express request object (expects `req.user.id` to be set).
   * @param {import('express').Response} res - The Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>}
   * @example
   * GET /auth/me
   * Authorization: Bearer <token>
   */
  me = async (req, res, next) => {
    try {
      const user = await this.authService.me(req.user.id);
      res.json(user);
    } catch (e) {
      next(e);
    }
  };
}
