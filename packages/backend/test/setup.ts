/**
 * Backend Test Setup
 *
 * This file runs before all tests and sets up the testing environment.
 */

import { vi } from 'vitest';

// Set test environment variables
process.env.NODE_ENV = 'test';

// Global test utilities
global.testUtils = {
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Extend global type for test utilities
declare global {
  var testUtils: {
    delay: (ms: number) => Promise<void>;
  };
}
