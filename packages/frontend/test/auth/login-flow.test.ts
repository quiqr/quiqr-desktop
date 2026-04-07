/**
 * Tests for auth login flow
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import axios from 'axios';
import { setTokens, getAccessToken, clearTokens, hasToken } from '../../src/auth/token-storage';
import { setupAuthInterceptors } from '../../src/auth/auth-interceptor';

describe('Token Storage', () => {
  afterEach(() => {
    clearTokens();
  });

  it('stores and retrieves tokens', () => {
    setTokens('access-123', 'refresh-456');
    expect(getAccessToken()).toBe('access-123');
    expect(hasToken()).toBe(true);
  });

  it('clears tokens', () => {
    setTokens('access-123', 'refresh-456');
    clearTokens();
    expect(getAccessToken()).toBeNull();
    expect(hasToken()).toBe(false);
  });
});

describe('Auth Interceptor', () => {
  afterEach(() => {
    clearTokens();
    server.resetHandlers();
  });

  it('attaches token to requests', async () => {
    setupAuthInterceptors();
    setTokens('test-token', 'test-refresh');

    let receivedAuth = '';
    server.use(
      http.post('/api/listWorkspaces', ({ request }) => {
        receivedAuth = request.headers.get('Authorization') || '';
        return HttpResponse.json([]);
      })
    );

    await axios.post('/api/listWorkspaces', { data: {} });
    expect(receivedAuth).toBe('Bearer test-token');
  });
});

describe('Login API', () => {
  afterEach(() => {
    clearTokens();
    server.resetHandlers();
  });

  it('login returns tokens and user info', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({
          token: 'access-token',
          refreshToken: 'refresh-token',
          user: { id: 'user-1', email: 'admin@localhost', mustChangePassword: false },
        });
      })
    );

    const response = await axios.post('/api/auth/login', { email: 'admin@localhost', password: 'admin' });
    expect(response.data.token).toBe('access-token');
    expect(response.data.user.email).toBe('admin@localhost');
  });

  it('login returns 401 for invalid credentials', async () => {
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      })
    );

    await expect(
      axios.post('/api/auth/login', { email: 'admin@localhost', password: 'wrong' })
    ).rejects.toThrow();
  });
});
