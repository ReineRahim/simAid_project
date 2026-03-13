/**
 * Express middleware that restricts access to admin-only routes.
 *
 * Ensures the authenticated user has an `admin` role before allowing further request handling.
 * If the user is not an admin, a `403 Forbidden` response is returned.
 *
 * This middleware assumes that `req.user` is already populated
 * (e.g., via authentication middleware such as JWT verification).
 *
 * @function isAdmin
 * @param {import('express').Request} req - The Express request object, containing `user` with a `role` field.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function in the chain.
 * @returns {void}
 *
 * @example
 * import express from 'express';
 * import { isAdmin } from './middlewares/isAdmin.js';
 *
 * const router = express.Router();
 *
 * // Example admin-only route
 * router.delete('/users/:id', isAdmin, async (req, res) => {
 *   // Only admin users can reach here
 *   await userService.deleteUser(req.params.id);
 *   res.status(204).send();
 * });
 */
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: true, message: 'Admin access only' });
  }
  next();
};
