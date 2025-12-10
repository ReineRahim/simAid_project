import { param, body } from 'express-validator';

export const idParam = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('id must be a positive integer'),
];

export const upsertUserLevel = [
  body('user_id')
    .isInt({ gt: 0 })
    .withMessage('user_id must be a positive integer'),

  body('level_id')
    .isInt({ gt: 0 })
    .withMessage('level_id must be a positive integer'),

  body('unlocked')
    .optional()
    .isBoolean()
    .withMessage('unlocked must be a boolean'),

  body('completed')
    .optional()
    .isBoolean()
    .withMessage('completed must be a boolean'),
];
