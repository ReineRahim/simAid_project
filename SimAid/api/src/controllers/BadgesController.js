import { validationResult } from "express-validator";

export class BadgesController {
  constructor(badgesService) {
    this.badgesService = badgesService;
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
      const badges = await this.badgesService.listBadges();
      res.json(badges);
    } catch (e) {
      next(e);
    }
  };

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

  // -------------------------------------------------------------
  // 🔒 ADMIN ROUTES
  // -------------------------------------------------------------
  create = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const newBadge = await this.badgesService.createBadge(req.body);
      res.status(201).json(newBadge);
    } catch (e) {
      next(e);
    }
  };

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
