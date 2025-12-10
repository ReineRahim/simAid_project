import { validationResult } from "express-validator";

export class UserController {
  constructor(service) {
    this.service = service;
  }

  _validate(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return true;
    }
    return false;
  }

  register = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const user = await this.service.register(req.body);
      res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  };

  login = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;
      const token = await this.service.login(req.body.email, req.body.password);
      res.status(200).json(token);
    } catch (e) {
      next(e);
    }
  };


list = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const badges = await this.userBadgeService.listUserBadgesByUserId(userId);
    res.json(badges);
  } catch (e) {
    next(e);
  }
};


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

  create = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const newUser = await this.service.createUser(req.body);
      res.status(201).json(newUser);
    } catch (e) {
      next(e);
    }
  };

  update = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const updatedUser = await this.service.updateUser(req.params.id, req.body);
      if (!updatedUser) return res.status(404).json({ message: "User not found" });
      res.status(200).json(updatedUser);
    } catch (e) {
      next(e);
    }
  };

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
