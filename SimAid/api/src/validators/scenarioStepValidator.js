import { param, body } from "express-validator";

export const idParam = [
  param("id").isInt({ gt: 0 }).withMessage("id must be a positive integer"),
];

export const upsertScenarioStep = [
  body("scenario_id")
    .isInt({ gt: 0 })
    .withMessage("scenario_id must be a positive integer"),

  body("step_order")
    .isInt({ gt: 0 })
    .withMessage("step_order must be a positive integer"),

  body("question_text")
    .isString()
    .isLength({ min: 5 })
    .withMessage("question_text must be at least 5 characters long"),

  body("option_a").isString().notEmpty().withMessage("option_a is required"),
  body("option_b").isString().notEmpty().withMessage("option_b is required"),
  body("option_c").isString().notEmpty().withMessage("option_c is required"),
  body("option_d").isString().notEmpty().withMessage("option_d is required"),

  body("correct_action")
    .isIn(["A", "B", "C", "D"])
    .withMessage("correct_action must be one of 'A', 'B', 'C', or 'D'"),

  body("feedback_message")
    .optional()
    .isString()
    .withMessage("feedback_message must be a string if provided"),
];
