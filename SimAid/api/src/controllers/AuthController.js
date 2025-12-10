import { validationResult } from 'express-validator';

export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  _handleValidation(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return true;
    }
    return false;
  }

  register = async (req, res, next) => {
    try {
      if (this._handleValidation(req, res)) return;
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  };

  login = async (req, res, next) => {
    try {
      if (this._handleValidation(req, res)) return;
      const result = await this.authService.login(req.body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  me = async (req, res, next) => {
    try {
      const user = await this.authService.me(req.user.id);
      res.json(user);
    } catch (e) {
      next(e);
    }
  };
}
