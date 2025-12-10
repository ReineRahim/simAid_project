import { param, body } from "express-validator";

export const idParam = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("id must be a positive integer"),
];

export const upsertLevel = [
  body("title")
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("title must be a string between 1–100 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string"),

  body("difficulty_order")
    .isInt({ gt: 0 })
    .withMessage("difficulty_order must be a positive integer"),
];
