import { validationResult } from "express-validator";

/**
 * Controller responsible for managing scenario steps.
 *
 * Provides endpoints for listing, retrieving, creating, updating,
 * and deleting scenario steps. Typically used by administrators
 * or internal tools for debugging and content management.
 */
export class ScenarioStepController {
  /**
   * @param {object} stepService - Instance of the service handling business logic for scenario steps.
   */
  constructor(stepService) {
    this.stepService = stepService;
  }

  /**
   * Validates the incoming request using express-validator.
   * If validation fails, sends a 400 Bad Request response.
   *
   * @private
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   * @returns {boolean} Returns true if validation failed and response was sent, otherwise false.
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
   * Retrieves and returns all scenario steps.
   * Commonly used for admin or debugging purposes.
   *
   * @async
   * @method list
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * GET /steps
   */
  list = async (req, res, next) => {
    try {
      const steps = await this.stepService.listScenarioSteps();
      res.json(steps);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Retrieves a single scenario step by its ID.
   *
   * @async
   * @method get
   * @param {import('express').Request} req - Path parameter contains step ID.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * GET /steps/:id
   */
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

  /**
   * Creates a new multiple-choice scenario step.
   *
   * @async
   * @method create
   * @param {import('express').Request} req - The request body should include scenario_id, step_order, question_text, options, and correct_action.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * POST /steps
   * {
   *   "scenario_id": 1,
   *   "step_order": 2,
   *   "question_text": "What should you do first?",
   *   "option_a": "Call for help",
   *   "option_b": "Assess the situation",
   *   "option_c": "Move forward",
   *   "option_d": "Stop immediately",
   *   "correct_action": "B",
   *   "feedback_message": "Always assess before acting."
   * }
   */
  create = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const {
        scenario_id,
        step_order,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_action,
        feedback_message,
      } = req.body;

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

  /**
   * Updates an existing scenario step by ID.
   *
   * @async
   * @method update
   * @param {import('express').Request} req - Path contains step ID; body contains updated step fields.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * PUT /steps/:id
   */
  update = async (req, res, next) => {
    try {
      if (this._validate(req, res)) return;

      const {
        step_order,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_action,
        feedback_message,
      } = req.body;

      const updatedStep = await this.stepService.updateScenarioStep(
        req.params.id,
        {
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
        }
      );

      if (!updatedStep)
        return res.status(404).json({ message: "Step not found" });
      res.status(200).json(updatedStep);
    } catch (e) {
      next(e);
    }
  };

  /**
   * Deletes a scenario step by ID.
   *
   * @async
   * @method delete
   * @param {import('express').Request} req - Path contains step ID.
   * @param {import('express').Response} res
   * @param {Function} next
   * @returns {Promise<void>}
   * @example
   * DELETE /steps/:id
   */
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
