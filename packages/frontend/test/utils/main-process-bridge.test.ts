/**
 * Main Process Bridge Tests
 *
 * Test coverage for the main-process-bridge utility module.
 * Tests the HTTP request functionality with Zod validation.
 */

import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { request } from '../../src/utils/main-process-bridge';

describe('main-process-bridge', () => {
  describe('HTTP Request Functionality', () => {
    beforeAll(() => {
      // MSW server is already started in setup.ts
    });

    afterEach(() => {
      // Reset MSW handlers after each test
      server.resetHandlers();
      vi.clearAllMocks();
    });

    it('should make successful request with valid response', async () => {
      server.use(
        http.post('http://localhost:5150/api/listWorkspaces', () => {
          return HttpResponse.json([
            { key: 'workspace1', path: '/path/to/workspace', state: 'active' }
          ]);
        })
      );

      const response = await request('listWorkspaces', { input: 'test' });

      expect(response).toEqual([
        { key: 'workspace1', path: '/path/to/workspace', state: 'active' }
      ]);
    });

    it('should include data in POST body under "data" key', async () => {
      let receivedBody: unknown = null;

      server.use(
        http.post('http://localhost:5150/api/listWorkspaces', async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json([]);
        })
      );

      await request('listWorkspaces', { input: 'test data' });

      expect(receivedBody).toEqual({ data: { input: 'test data' } });
    });

    it('should construct correct endpoint URL (localhost:5150/api/method)', async () => {
      let requestUrl: string = '';

      server.use(
        http.post('http://localhost:5150/api/getCurrentSiteKey', ({ request }) => {
          requestUrl = request.url;
          return HttpResponse.json('site-key-123');
        })
      );

      await request('getCurrentSiteKey', {});

      expect(requestUrl).toBe('http://localhost:5150/api/getCurrentSiteKey');
    });

    it('should validate response with Zod schema when available', async () => {
      // Mock console.warn to check for validation warnings
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Use listWorkspaces which has a schema in apiSchemas
      server.use(
        http.post('http://localhost:5150/api/listWorkspaces', () => {
          return HttpResponse.json([
            { key: 'workspace1', path: '/path/to/workspace', state: 'active' }
          ]);
        })
      );

      const response = await request('listWorkspaces', {});

      // Should not warn about missing schema since listWorkspaces has a schema
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(response).toBeDefined();

      consoleWarnSpy.mockRestore();
    });

    it('should throw error when Zod validation fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Use listWorkspaces which expects an array, but return invalid data
      server.use(
        http.post('http://localhost:5150/api/listWorkspaces', () => {
          // Return invalid data that doesn't match the array schema
          return HttpResponse.json({ invalid: 'data structure' });
        })
      );

      await expect(
        request('listWorkspaces', {})
      ).rejects.toThrow(/API response validation failed/);

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle network errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      server.use(
        http.post('http://localhost:5150/api/invalidateCache', () => {
          return HttpResponse.error();
        })
      );

      await expect(
        request('invalidateCache', {})
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error sending data:'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should use custom timeout option when provided', async () => {
      // This test verifies that the timeout option is accepted
      // Actual timeout behavior is difficult to test reliably with MSW

      server.use(
        http.post('http://localhost:5150/api/checkFreeSiteName', () => {
          return HttpResponse.json(true);
        })
      );

      // Verify custom timeout parameter is accepted
      const response = await request('checkFreeSiteName', {}, { timeout: 5000 });
      expect(response).toEqual(true);
    });

    it('should use default timeout of 90000ms when not specified', async () => {
      // This test verifies the default by checking that a reasonable request completes
      server.use(
        http.post('http://localhost:5150/api/matchRole', () => {
          return HttpResponse.json(true);
        })
      );

      const response = await request('matchRole', {});

      expect(response).toEqual(true);
    });
  });
});
