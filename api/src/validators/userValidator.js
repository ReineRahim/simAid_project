import { param, body } from "express-validator";

export const idParam = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("id must be a positive integer"),
];

export const upsertUser = [
  body("full_name")
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("full_name must be a string between 1–100 characters"),

  body("email")
    .isEmail()
    .withMessage("email must be a valid email address"),

  body("password")
    .optional()
    .isString()
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters long"),

  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage('role must be either "user" or "admin"'),
];
