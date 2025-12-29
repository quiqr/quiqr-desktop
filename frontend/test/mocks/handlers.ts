/**
 * MSW Request Handlers
 *
 * Default handlers for common API endpoints.
 * These can be overridden in individual tests using server.use().
 *
 */

import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:5150/api';

// Default mock responses
export const mockWorkspaceDetails = {
  siteKey: 'test-site',
  workspaceKey: 'main',
  sitePath: '/path/to/site',
  hugoVersion: '0.120.0',
  baseUrl: 'http://localhost:1313',
};

export const mockConfigurations = {
  sites: [],
};

export const mockUserPreferences = {
  interfaceStyle: 'light',
  dataFolderPath: '/mock/data',
  sitesListingView: 'cards',
};

// API handlers
export const handlers = [
  // Health check
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // Get workspace details
  http.post(`${API_BASE}/getWorkspaceDetails`, () => {
    return HttpResponse.json(mockWorkspaceDetails);
  }),

  // Get configurations
  http.post(`${API_BASE}/getConfigurations`, () => {
    return HttpResponse.json(mockConfigurations);
  }),

  // Read conf key
  http.post(`${API_BASE}/readConfKey`, async ({ request }) => {
    const body = await request.json() as { confkey: string };

    if (body.confkey === 'prefs') {
      return HttpResponse.json(mockUserPreferences);
    }

    return HttpResponse.json(null);
  }),

  // List workspaces
  http.post(`${API_BASE}/listWorkspaces`, async () => {
    // Default mock workspaces - tests should override for specific scenarios
    return HttpResponse.json([
      { key: 'main', path: '/test/sites/main', state: 'ready' },
      { key: 'staging', path: '/test/sites/staging', state: 'ready' },
    ]);
  }),

  // Mount workspace
  http.post(`${API_BASE}/mountWorkspace`, async () => {
    // Return a default workspace path - tests should override for specific workspaces
    return HttpResponse.json('/test/sites/main');
  }),

  // Get collection item
  http.post(`${API_BASE}/getCollectionItem`, async () => {
    // Default mock response - tests should override with specific data
    return HttpResponse.json({
      title: 'Test Page',
      mainContent: 'Test content',
    });
  }),

  // Update collection item
  http.post(`${API_BASE}/updateCollectionItem`, async () => {
    // Return the updated document (tests should override with specific expectations)
    return HttpResponse.json({
      title: 'Updated Page',
      mainContent: 'Updated content',
    });
  }),

  // Default handler for unhandled API calls (returns empty success)
  http.post(`${API_BASE}/:method`, ({ params }) => {
    console.warn(`[MSW] Unhandled API method: ${params.method}`);
    return HttpResponse.json({});
  }),
];

/**
 * Create a handler that simulates an API error
 */
export function createErrorHandler(method: string, statusCode: number, message: string) {
  return http.post(`${API_BASE}/${method}`, () => {
    return HttpResponse.json({ error: message }, { status: statusCode });
  });
}

/**
 * Create a handler that simulates a network error
 */
export function createNetworkErrorHandler(method: string) {
  return http.post(`${API_BASE}/${method}`, () => {
    return HttpResponse.error();
  });
}

/**
 * Create a handler with a custom response
 */
export function createCustomHandler<T>(method: string, response: T) {
  return http.post(`${API_BASE}/${method}`, () => {
    return HttpResponse.json(response);
  });
}
