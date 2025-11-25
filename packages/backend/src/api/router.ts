/**
 * API Router
 *
 * Central registry of all API handlers.
 * Maps API method names to their handler functions.
 */

import type { AppContainer } from '../config/container.js';
import { createConfigHandlers } from './handlers/config-handlers.js';
import { createDialogHandlers } from './handlers/dialog-handlers.js';
import { createShellHandlers } from './handlers/shell-handlers.js';
import { createWindowHandlers } from './handlers/window-handlers.js';
import { createWorkspaceHandlers } from './handlers/workspace-handlers.js';
import { createSiteHandlers } from './handlers/site-handlers.js';
import { createImportHandlers } from './handlers/import-handlers.js';
import { createBuildHandlers } from './handlers/build-handlers.js';
import { createSingleHandlers } from './handlers/single-handlers.js';
import { createCollectionHandlers } from './handlers/collection-handlers.js';
import { createSyncHandlers } from './handlers/sync-handlers.js';

/**
 * API handler function type
 */
export type ApiHandler = (data: any) => Promise<any>;

/**
 * Map of all API method names to their handlers
 */
export type ApiHandlerMap = Record<string, ApiHandler>;

/**
 * Create the complete API handler registry
 */
export function createApiHandlers(container: AppContainer): ApiHandlerMap {
  // Create all handler groups
  const configHandlers = createConfigHandlers(container);
  const dialogHandlers = createDialogHandlers(container);
  const shellHandlers = createShellHandlers(container);
  const windowHandlers = createWindowHandlers(container);
  const workspaceHandlers = createWorkspaceHandlers(container);
  const siteHandlers = createSiteHandlers(container);
  const importHandlers = createImportHandlers(container);
  const buildHandlers = createBuildHandlers(container);
  const singleHandlers = createSingleHandlers(container);
  const collectionHandlers = createCollectionHandlers(container);
  const syncHandlers = createSyncHandlers(container);

  // Combine all handlers into a single registry
  return {
    // Config and preferences
    ...configHandlers,

    // Dialog operations
    ...dialogHandlers,

    // Shell operations
    ...shellHandlers,

    // Window management
    ...windowHandlers,

    // Workspace operations
    ...workspaceHandlers,

    // Site management
    ...siteHandlers,

    // Import operations
    ...importHandlers,

    // Build and serve
    ...buildHandlers,

    // Single content
    ...singleHandlers,

    // Collection operations
    ...collectionHandlers,

    // Sync and publish
    ...syncHandlers,
  };
}

/**
 * Get a handler by method name
 */
export function getHandler(
  handlers: ApiHandlerMap,
  method: string
): ApiHandler | undefined {
  return handlers[method];
}
