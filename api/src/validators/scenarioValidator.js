import { param, body } from "express-validator";

export const idParam = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("id must be a positive integer"),
];

// Validate scenario creation and update body
export const upsertScenario = [
  body("level_id")
    .isInt({ gt: 0 })
    .withMessage("level_id must be a positive integer"),

  body("title")
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage("title must be a string between 1–255 characters"),

  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string"),

  body("image_url")
    .optional()
    .isString()
    .withMessage("image_url must be a string"),
];
