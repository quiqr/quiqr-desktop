/**
 * Tests for auth middleware
 */

import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { TokenService } from '../../src/auth/token-service';
import { createAuthMiddleware } from '../../src/api/middleware/auth-middleware';

const secret = 'test-middleware-secret';

function createTestApp(tokenService: TokenService) {
  const app = express();
  app.use(express.json());
  app.use(createAuthMiddleware(tokenService));
  app.get('/protected', (req, res) => {
    res.json({ userId: req.auth?.userId, email: req.auth?.email });
  });
  return app;
}

describe('Auth Middleware', () => {
  it('passes with valid token in Authorization header', async () => {
    const tokenService = new TokenService(secret, '1h', '7d');
    const token = tokenService.issueAccessToken('user-1', 'test@example.com');
    const app = createTestApp(tokenService);

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('user-1');
    expect(res.body.email).toBe('test@example.com');
  });

  it('passes with valid token in query parameter', async () => {
    const tokenService = new TokenService(secret, '1h', '7d');
    const token = tokenService.issueAccessToken('user-1', 'test@example.com');
    const app = createTestApp(tokenService);

    const res = await request(app)
      .get(`/protected?token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe('user-1');
  });

  it('returns 401 without token', async () => {
    const tokenService = new TokenService(secret, '1h', '7d');
    const app = createTestApp(tokenService);

    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('returns 401 with invalid token', async () => {
    const tokenService = new TokenService(secret, '1h', '7d');
    const app = createTestApp(tokenService);

    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });

  it('returns 401 with blacklisted token', async () => {
    const tokenService = new TokenService(secret, '1h', '7d');
    const token = tokenService.issueAccessToken('user-1', 'test@example.com');
    tokenService.blacklistToken(token);
    const app = createTestApp(tokenService);

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
  });
});
