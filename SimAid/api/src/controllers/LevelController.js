import { validationResult } from 'express-validator';

export class LevelController {
  constructor(levelService) {
    this.levelService = levelService;
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
      const levels = await this.levelService.listLevels();
      res.json(levels);
    } catch (e) {
      next(e);
    }
  };

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

  create = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const newLevel = await this.levelService.createLevel(req.body);
      res.status(201).json(newLevel);
    } catch (e) {
      next(e);
    }
  };

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
