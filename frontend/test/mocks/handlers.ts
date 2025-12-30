/**
 * MSW Request Handlers
 *
 * Default mock handlers for API requests.
 * Individual tests can override these using server.use() in their test files.
 */

import { http, HttpResponse } from 'msw';

export const handlers = [
  // Default handler for readConfKey
  http.post('http://localhost:5150/api/readConfKey', () => {
    return HttpResponse.json({
      interfaceStyle: 'quiqr10-light',
      dataFolder: '~/Quiqr',
      showSplashAtStartup: true,
      libraryView: 'cards',
    });
  }),

  // Default handler for saveConfPrefKey
  http.post('http://localhost:5150/api/saveConfPrefKey', () => {
    return HttpResponse.json(true);
  }),
];
