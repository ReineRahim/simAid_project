import { param, body } from 'express-validator';

export const idParam = [param('id').isInt({ gt: 0 }).withMessage('id must be a positive integer')];

export const upsertUserBadge = [
  body('user_id').isInt({ gt: 0 }).withMessage('user_id must be a positive integer'),
  body('badge_id').isInt({ gt: 0 }).withMessage('badge_id must be a positive integer'),
  body('earned_at').isISO8601().withMessage('earned_at must be a valid ISO date'),
];
