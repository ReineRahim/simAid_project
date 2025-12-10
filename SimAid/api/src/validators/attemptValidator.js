import { param, body } from "express-validator";

export const idParam = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("id must be a positive integer"),
];

export const upsertAttempt = [
  body("user_id")
    .isInt({ gt: 0 })
    .withMessage("user_id must be a positive integer"),

  body("scenario_id")
    .isInt({ gt: 0 })
    .withMessage("scenario_id must be a positive integer"),

  body("score")
    .isFloat({ min: 0, max: 100 })
    .withMessage("score must be a number between 0 and 100"),

  body("completed_at")
    .optional()
    .isISO8601()
    .withMessage("completed_at must be a valid ISO 8601 date"),
];
