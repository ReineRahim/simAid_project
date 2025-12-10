import { validationResult } from 'express-validator';

export class UserBadgeController {
  constructor(userBadgeService) {
    this.userBadgeService = userBadgeService;
  }

  _validate(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return true;
    }
    return false;
  }

  list = async (req, res, next) => {
    try {
      const badges = await this.userBadgeService.listUserBadges();
      res.json(badges);
    } catch (e) {
      next(e);
    }
  };

  get = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const badge = await this.userBadgeService.getUserBadge(req.params.id);
      if (!badge) return res.status(404).json({ message: 'User badge not found' });
      res.json(badge);
    } catch (e) {
      next(e);
    }
  };

  create = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const newBadge = await this.userBadgeService.createUserBadge(req.body);
      res.status(201).json(newBadge);
    } catch (e) {
      next(e);
    }
  };

  update = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const updatedBadge = await this.userBadgeService.updateUserBadge(req.params.id, req.body);
      if (!updatedBadge) return res.status(404).json({ message: 'User badge not found' });
      res.status(200).json(updatedBadge);
    } catch (e) {
      next(e);
    }
  };

  delete = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const ok = await this.userBadgeService.deleteUserBadge(req.params.id);
      if (!ok) return res.status(404).json({ message: 'User badge not found' });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
