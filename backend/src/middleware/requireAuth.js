import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');

  // RFC 6750: the auth scheme is case-insensitive, so "bearer" is valid too.
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return res
      .status(401)
      .json({ error: 'Missing or malformed Authorization header.' });
  }

  try {
    req.auth = {
      ...req.auth,
      userId: jwt.verify(token, JWT_SECRET).sub,
    };
    next();
  } catch {
    // Covers both bad signature or expired token.
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
