/**
 * Frontend Test Setup
 *
 * This file runs before all tests and sets up the testing environment
 * including jsdom extensions, MSW server, and React Testing Library matchers.
 */

import '@testing-library/jest-dom/vitest';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { server } from './mocks/server';

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers after each test to ensure isolation
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});

// Suppress React 19 console warnings in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out known React 19 warnings in tests
  const message = args[0]?.toString() || '';
  if (
    message.includes('ReactDOM.render is no longer supported') ||
    message.includes('Warning: An update to')
  ) {
    return;
  }
  originalConsoleError(...args);
};
