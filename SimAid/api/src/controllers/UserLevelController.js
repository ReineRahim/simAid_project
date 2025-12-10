import { validationResult } from "express-validator";

export class UserLevelController {
  constructor(userLevelService) {
    this.userLevelService = userLevelService;
  }

  _validate(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return true;
    }
    return false;
  }

  // GET /user-levels  (optionally ?user_id= & ?level_id=)
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

      // fallback: list all (admin)
      const levels = await this.userLevelService.listUserLevels();
      res.json(levels);
    } catch (e) {
      next(e);
    }
  };

  // GET /user-levels/:user_level_id  (by PK)
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

  // GET /users/:user_id/levels
  listByUser = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const rows = await this.userLevelService.getUserLevels(req.params.user_id);
      res.json(rows);
    } catch (e) {
      next(e);
    }
  };

  // GET /users/:user_id/levels/:level_id
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

  // POST /user-levels
  create = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const newLevel = await this.userLevelService.createUserLevel(req.body);
      res.status(201).json(newLevel);
    } catch (e) {
      next(e);
    }
  };

  // PUT /user-levels/:id
  update = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      // FIX: call the correct service method
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

  // POST /user-levels/upsert
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

  // DELETE /user-levels/:id
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
