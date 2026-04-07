/**
 * JWT Auth Middleware
 *
 * Validates JWT tokens from Authorization header or ?token query parameter.
 * Attaches decoded user to req.auth when valid.
 * Returns 401 for missing/invalid tokens.
 */

import type { Request, Response, NextFunction } from 'express';
import type { TokenService } from '../../auth/token-service.js';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
      };
    }
  }
}

export function createAuthMiddleware(tokenService: TokenService) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extract token from Authorization header or query parameter
    const headerToken = req.headers.authorization?.replace('Bearer ', '');
    const queryToken = req.query.token as string | undefined;
    const token = headerToken || queryToken;

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const payload = tokenService.verifyToken(token, 'access');
      req.auth = {
        userId: payload.userId,
        email: payload.email,
      };
      next();
    } catch {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
}
