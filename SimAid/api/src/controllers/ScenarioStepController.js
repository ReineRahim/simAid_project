import { validationResult } from "express-validator";

export class ScenarioStepController {
  constructor(stepService) {
    this.stepService = stepService;
  }

  _validate(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return true;
    }
    return false;
  }

  // 📋 Get all steps (admin/debug)
  list = async (req, res, next) => {
    try {
      const steps = await this.stepService.listScenarioSteps();
      res.json(steps);
    } catch (e) {
      next(e);
    }
  };

  // 🔍 Get one step by ID
  get = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const step = await this.stepService.getScenarioStep(req.params.id);
      if (!step) return res.status(404).json({ message: "Step not found" });
      res.json(step);
    } catch (e) {
      next(e);
    }
  };

  // 🏗️ Create a new MCQ step
  create = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const { scenario_id, step_order, question_text, option_a, option_b, option_c, option_d, correct_action, feedback_message } = req.body;

      const newStep = await this.stepService.createScenarioStep({
        scenario_id,
        step_order,
        question_text,
        options: {
          A: option_a,
          B: option_b,
          C: option_c,
          D: option_d,
        },
        correct_action,
        feedback_message,
      });

      res.status(201).json(newStep);
    } catch (e) {
      next(e);
    }
  };

  // 🔧 Update existing step
  update = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const { step_order, question_text, option_a, option_b, option_c, option_d, correct_action, feedback_message } = req.body;

      const updatedStep = await this.stepService.updateScenarioStep(req.params.id, {
        step_order,
        question_text,
        options: {
          A: option_a,
          B: option_b,
          C: option_c,
          D: option_d,
        },
        correct_action,
        feedback_message,
      });

      if (!updatedStep)
        return res.status(404).json({ message: "Step not found" });
      res.status(200).json(updatedStep);
    } catch (e) {
      next(e);
    }
  };

  // ❌ Delete step
  delete = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const ok = await this.stepService.deleteScenarioStep(req.params.id);
      if (!ok) return res.status(404).json({ message: "Step not found" });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
