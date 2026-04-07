/**
 * Tests for frontend serving and conditional CORS in createServer()
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock the router to avoid needing a full container
vi.mock('../../src/api/router.js', () => ({
  createApiHandlers: () => ({}),
  getHandler: () => undefined,
}));

// Import after mocking
const { createServer } = await import('../../src/api/server.js');

// Minimal mock container (router is mocked so handlers aren't called)
const mockContainer = {} as any;

describe('Server Frontend Serving', () => {
  let frontendDir: string;

  beforeEach(() => {
    frontendDir = mkdtempSync(join(tmpdir(), 'quiqr-test-frontend-'));
    writeFileSync(join(frontendDir, 'index.html'), '<html><body>Quiqr App</body></html>');
    writeFileSync(join(frontendDir, 'style.css'), 'body { color: red; }');
  });

  afterEach(() => {
    rmSync(frontendDir, { recursive: true, force: true });
  });

  it('serves static files when frontendPath is set', async () => {
    const app = createServer(mockContainer, { frontendPath: frontendDir });
    const res = await request(app).get('/style.css');
    expect(res.status).toBe(200);
    expect(res.text).toContain('body { color: red; }');
  });

  it('serves index.html for SPA catch-all on non-API routes', async () => {
    const app = createServer(mockContainer, { frontendPath: frontendDir });
    const res = await request(app).get('/some/deep/route');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Quiqr App');
  });

  it('returns 404 JSON for unmatched /api/* routes', async () => {
    const app = createServer(mockContainer, { frontendPath: frontendDir });
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'API endpoint not found' });
  });

  it('does not serve static files when frontendPath is not set', async () => {
    const app = createServer(mockContainer, {});
    const res = await request(app).get('/style.css');
    // Without frontend serving, there's no route for this — Express returns 404
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('does not have SPA catch-all when frontendPath is not set', async () => {
    const app = createServer(mockContainer, {});
    const res = await request(app).get('/some/deep/route');
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('Conditional CORS', () => {
  it('disables CORS by default when frontendPath is set', async () => {
    const frontendDir = mkdtempSync(join(tmpdir(), 'quiqr-test-cors-'));
    writeFileSync(join(frontendDir, 'index.html'), '<html></html>');

    const app = createServer(mockContainer, { frontendPath: frontendDir });
    const res = await request(app).options('/api/test');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();

    rmSync(frontendDir, { recursive: true, force: true });
  });

  it('enables CORS by default when frontendPath is not set', async () => {
    const app = createServer(mockContainer, {});
    const res = await request(app)
      .options('/api/test')
      .set('Origin', 'http://localhost:4002')
      .set('Access-Control-Request-Method', 'POST');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  it('allows explicit cors: true to override frontendPath default', async () => {
    const frontendDir = mkdtempSync(join(tmpdir(), 'quiqr-test-cors-override-'));
    writeFileSync(join(frontendDir, 'index.html'), '<html></html>');

    const app = createServer(mockContainer, { frontendPath: frontendDir, cors: true });
    const res = await request(app)
      .options('/api/test')
      .set('Origin', 'http://localhost:4002')
      .set('Access-Control-Request-Method', 'POST');
    expect(res.headers['access-control-allow-origin']).toBeDefined();

    rmSync(frontendDir, { recursive: true, force: true });
  });
});
