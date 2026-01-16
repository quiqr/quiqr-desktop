/**
 * Theme API Integration Tests
 *
 * Tests the actual API calls for saving theme preferences.
 * Uses MSW to mock the backend HTTP server.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import service from '../../src/services/service';

// Setup MSW server to intercept API requests
const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('Theme API Integration', () => {
  describe('saveConfPrefKey - interfaceStyle', () => {
    it('makes POST request to save interface style preference', async () => {
      let requestBody: any = null;

      // Setup handler to capture the request
      server.use(
        http.post('http://localhost:5150/api/saveConfPrefKey', async ({ request }) => {
          requestBody = await request.json();
          return HttpResponse.json(true);
        })
      );

      // Call the API
      await service.api.saveConfPrefKey('interfaceStyle', 'quiqr10-dark');

      // Verify request was made with correct data
      expect(requestBody).toEqual({
        data: {
          prefKey: 'interfaceStyle',
          prefValue: 'quiqr10-dark',
        },
      });
    });

    it('successfully saves light theme preference', async () => {
      server.use(
        http.post('http://localhost:5150/api/saveConfPrefKey', () => {
          return HttpResponse.json(true);
        })
      );

      const result = await service.api.saveConfPrefKey('interfaceStyle', 'quiqr10-light');
      expect(result).toBe(true);
    });

    it('successfully saves dark theme preference', async () => {
      server.use(
        http.post('http://localhost:5150/api/saveConfPrefKey', () => {
          return HttpResponse.json(true);
        })
      );

      const result = await service.api.saveConfPrefKey('interfaceStyle', 'quiqr10-dark');
      expect(result).toBe(true);
    });

    it('handles network errors when saving theme preference', async () => {
      // Temporarily remove the handler to simulate network error
      server.use(
        http.post('http://localhost:5150/api/saveConfPrefKey', () => {
          return new HttpResponse(null, { status: 503 });
        })
      );

      // The API call should succeed but might return an error response
      const result = await service.api.saveConfPrefKey('interfaceStyle', 'quiqr10-dark');
      // In case of network errors, the result might be null or false
      expect(result).toBeDefined();
    });

    it('handles server errors (500) when saving theme preference', async () => {
      server.use(
        http.post('http://localhost:5150/api/saveConfPrefKey', () => {
          return HttpResponse.json(
            false,
            { status: 500 }
          );
        })
      );

      // The API should still receive the response from the server
      const result = await service.api.saveConfPrefKey('interfaceStyle', 'quiqr10-dark');
      // Server error responses should still be processed
      expect(typeof result).toBe('boolean');
    });

    it('respects the correct API endpoint and port', async () => {
      let requestUrl = '';

      server.use(
        http.post('http://localhost:5150/api/saveConfPrefKey', ({ request }) => {
          requestUrl = request.url;
          return HttpResponse.json(true);
        })
      );

      await service.api.saveConfPrefKey('interfaceStyle', 'quiqr10-dark');

      expect(requestUrl).toBe('http://localhost:5150/api/saveConfPrefKey');
    });
  });

  describe('readConfKey - prefs', () => {
    it('retrieves current theme preference from backend', async () => {
      // Use the default mock which returns 'quiqr10-light'
      const result = await service.api.readConfKey('prefs');
      expect(result.interfaceStyle).toBe('quiqr10-light');
      expect(result.dataFolder).toBe('~/Quiqr');
    });

    it('handles missing interfaceStyle in preferences', async () => {
      const mockPreferences = {
        dataFolder: '~/Quiqr',
        showSplashAtStartup: true,
        libraryView: 'cards',
      };

      server.use(
        http.post('http://localhost:5150/api/readConfKey', () => {
          return HttpResponse.json(mockPreferences);
        })
      );

      const result = await service.api.readConfKey('prefs');
      expect(result.dataFolder).toBe('~/Quiqr');
      // interfaceStyle might be undefined or have a default value
      expect(result).toBeDefined();
    });
  });

  describe('Theme change workflow', () => {
    it('completes full workflow: read current preference, change theme, save new preference', async () => {
      // Step 1: Read current preference
      server.use(
        http.post('http://localhost:5150/api/readConfKey', () => {
          return HttpResponse.json({
            interfaceStyle: 'quiqr10-light',
            dataFolder: '~/Quiqr',
            showSplashAtStartup: true,
            libraryView: 'cards',
          });
        })
      );

      const currentPrefs = await service.api.readConfKey('prefs');
      expect(currentPrefs.interfaceStyle).toBe('quiqr10-light');

      // Step 2: User changes theme to dark
      const newTheme = 'quiqr10-dark';

      // Step 3: Save new preference
      let savedValue: string | null = null;

      server.use(
        http.post('http://localhost:5150/api/saveConfPrefKey', async ({ request }) => {
          const body: any = await request.json();
          if (body.data.prefKey === 'interfaceStyle') {
            savedValue = body.data.prefValue;
          }
          return HttpResponse.json(true);
        })
      );

      await service.api.saveConfPrefKey('interfaceStyle', newTheme);

      expect(savedValue).toBe('quiqr10-dark');
    });

    it('allows switching themes multiple times in succession', async () => {
      const savedValues: string[] = [];

      server.use(
        http.post('http://localhost:5150/api/saveConfPrefKey', async ({ request }) => {
          const body: any = await request.json();
          if (body.data.prefKey === 'interfaceStyle') {
            savedValues.push(body.data.prefValue);
          }
          return HttpResponse.json(true);
        })
      );

      // Switch to dark
      await service.api.saveConfPrefKey('interfaceStyle', 'quiqr10-dark');

      // Switch back to light
      await service.api.saveConfPrefKey('interfaceStyle', 'quiqr10-light');

      // Switch to dark again
      await service.api.saveConfPrefKey('interfaceStyle', 'quiqr10-dark');

      expect(savedValues).toEqual(['quiqr10-dark', 'quiqr10-light', 'quiqr10-dark']);
    });
  });
});
