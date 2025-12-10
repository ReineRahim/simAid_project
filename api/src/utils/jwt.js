// src/utils/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JSON Web Token (JWT) for authentication.
 *
 * Uses the secret key defined in environment variables to sign
 * the payload and optionally specify an expiration time.
 *
 * @function signAccess
 * @param {object} payload - The data to encode inside the token (e.g., `{ sub: userId, role: "admin" }`).
 * @returns {string} Signed JWT string.
 * @throws {Error} If `JWT_SECRET` is missing.
 *
 * @example
 * const token = signAccess({ sub: 1, role: "user" });
 * console.log(token); // "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
 */
export function signAccess(payload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET env var is missing'); // clearer than "secretOrPrivateKey..."
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode an access token.
 *
 * Validates the JWT signature and ensures it hasn’t expired.
 * Returns the decoded payload if valid; throws an error otherwise.
 *
 * @function verifyAccess
 * @param {string} token - The JWT string to verify.
 * @returns {object} The decoded token payload.
 * @throws {Error} If the token is invalid, expired, or if `JWT_SECRET` is missing.
 *
 * @example
 * const payload = verifyAccess(token);
 * console.log(payload.sub); // 1
 */
export function verifyAccess(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET env var is missing');
  }
  return jwt.verify(token, JWT_SECRET);
}
