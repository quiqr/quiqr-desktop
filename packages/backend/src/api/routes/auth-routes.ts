/**
 * Auth API Routes
 *
 * Public routes for login, refresh, and auth status check.
 * Protected routes for logout and password change.
 * These are registered BEFORE the auth middleware in the pipeline.
 */

import { Router, type Request, type Response } from 'express';
import type { AuthProvider } from '../../auth/types.js';
import type { TokenService } from '../../auth/token-service.js';
import { createAuthMiddleware } from '../middleware/auth-middleware.js';

export function createAuthRoutes(authProvider: AuthProvider, tokenService: TokenService): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(tokenService);

  // GET /api/auth/check - public, tells frontend if auth is enabled
  router.get('/api/auth/check', (_req: Request, res: Response) => {
    res.json({ authEnabled: true });
  });

  // POST /api/auth/login - public
  router.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await authProvider.authenticate({ email, password });

      if (!result.success || !result.user) {
        res.status(401).json({ error: result.error || 'Invalid credentials' });
        return;
      }

      const token = tokenService.issueAccessToken(result.user.id, result.user.email);
      const refreshToken = tokenService.issueRefreshToken(result.user.id, result.user.email);

      res.json({
        token,
        refreshToken,
        user: result.user,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(500).json({ error: message });
    }
  });

  // POST /api/auth/refresh - public
  router.post('/api/auth/refresh', async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      const payload = tokenService.verifyToken(refreshToken, 'refresh');
      const user = await authProvider.getUserById(payload.userId);

      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      // Blacklist old refresh token
      tokenService.blacklistToken(refreshToken);

      const newToken = tokenService.issueAccessToken(user.id, user.email);
      const newRefreshToken = tokenService.issueRefreshToken(user.id, user.email);

      res.json({
        token: newToken,
        refreshToken: newRefreshToken,
      });
    } catch {
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  });

  // POST /api/auth/logout - requires valid token
  router.post('/api/auth/logout', authMiddleware, (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || (req.query.token as string);
    if (token) {
      tokenService.blacklistToken(token);
    }
    res.json({ success: true });
  });

  // POST /api/auth/change-password - requires valid token
  router.post('/api/auth/change-password', authMiddleware, async (req: Request, res: Response) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.auth?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!oldPassword || !newPassword) {
        res.status(400).json({ error: 'Old and new passwords are required' });
        return;
      }

      await authProvider.changePassword(userId, oldPassword, newPassword);
      res.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password change failed';
      res.status(400).json({ error: message });
    }
  });

  return router;
}
