// src/utils/jwt.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signAccess(payload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET env var is missing'); // clearer than "secretOrPrivateKey..."
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAccess(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET env var is missing');
  }
  return jwt.verify(token, JWT_SECRET);
}
