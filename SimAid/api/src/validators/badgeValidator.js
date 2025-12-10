import { param, body } from 'express-validator';

export const idParam = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('id must be a positive integer'),
];

export const upsertBadge = [
  body('level_id')
    .isInt({ gt: 0 })
    .withMessage('level_id must be a positive integer'),

  body('name')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('name must be a string between 1-100 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('description must be a string'),

  body('icon_url')
    .optional()
    .isURL()
    .withMessage('icon_url must be a valid URL'),
];
