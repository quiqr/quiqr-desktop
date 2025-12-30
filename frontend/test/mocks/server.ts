/**
 * MSW Server Configuration
 *
 * Creates a mock service worker server for intercepting HTTP requests in tests.
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Create the server with default handlers
export const server = setupServer(...handlers);
