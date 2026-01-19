/**
 * API Module
 *
 * Re-exports all API-related functionality.
 */

export { createServer, startServer, type ServerOptions } from './server.js';
export { createApiHandlers, getHandler, type ApiHandlers } from './router.js';
export { errorHandler, asyncHandler, type ErrorResponse } from './middleware/error-handler.js';

// Export individual handler creators for testing/customization
export { createConfigHandlers } from './handlers/config-handlers.js';
export { createDialogHandlers } from './handlers/dialog-handlers.js';
export { createShellHandlers } from './handlers/shell-handlers.js';
export { createWindowHandlers } from './handlers/window-handlers.js';
export { createWorkspaceHandlers } from './handlers/workspace-handlers.js';
export { createSiteHandlers } from './handlers/site-handlers.js';
export { createImportHandlers } from './handlers/import-handlers.js';
export { createBuildHandlers } from './handlers/build-handlers.js';
export { createSingleHandlers } from './handlers/single-handlers.js';
export { createCollectionHandlers } from './handlers/collection-handlers.js';
export { createSyncHandlers } from './handlers/sync-handlers.js';
