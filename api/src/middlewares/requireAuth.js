import { verifyAccess } from '../utils/jwt.js';

/**
 * Express middleware that enforces authentication using a Bearer JWT token.
 *
 * This middleware verifies the presence and validity of a JWT in the
 * `Authorization` header of incoming requests. If valid, it attaches the decoded
 * user information to `req.user` and allows the request to proceed. Otherwise,
 * it responds with an HTTP `401 Unauthorized` error.
 *
 * Expected header format:
 * ```
 * Authorization: Bearer <access_token>
 * ```
 *
 * The JWT is verified using the `verifyAccess()` utility, which should validate
 * signature, expiration, and claims.
 *
 * @function requireAuth
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {void}
 *
 * @example
 * import express from 'express';
 * import { requireAuth } from './middlewares/requireAuth.js';
 *
 * const router = express.Router();
 *
 * // Protect all routes below this middleware
 * router.use(requireAuth);
 *
 * router.get('/profile', (req, res) => {
 *   res.json({ message: `Welcome user ${req.user.id}`, role: req.user.role });
 * });
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  // Ensure proper Bearer token format
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: true,
      message: 'Missing or invalid authorization header',
    });
  }

  try {
    // Verify JWT and attach payload to request
    const payload = verifyAccess(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    // Handle invalid or expired token
    return res.status(401).json({
      error: true,
      message: 'Invalid or expired token',
    });
  }
};
