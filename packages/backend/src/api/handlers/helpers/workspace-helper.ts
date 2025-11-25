/**
 * Workspace Handler Helper
 *
 * Provides utility functions for working with WorkspaceService in handlers.
 */

import type { AppContainer } from '../../../config/container.js';
import type { WorkspaceService } from '../../../services/workspace/workspace-service.js';

/**
 * Create a WorkspaceService instance for the given workspace
 * TODO: Implement proper workspace path resolution when site mounting logic is migrated
 */
export async function createWorkspaceServiceForParams(
  container: AppContainer,
  siteKey: string,
  workspaceKey: string
): Promise<WorkspaceService> {
  // TODO: Get the actual workspace path from SiteService or similar
  // For now, this is a placeholder that throws an error
  throw new Error('createWorkspaceServiceForParams: Not yet implemented - needs workspace mounting logic');
}

/**
 * Get the currently mounted WorkspaceService (using app state)
 */
export function getCurrentWorkspaceService(container: AppContainer): WorkspaceService {
  const { state } = container;
  if (!state.currentSitePath || !state.currentWorkspaceKey || !state.currentSiteKey) {
    throw new Error('No workspace is currently mounted');
  }

  return container.createWorkspaceService(
    state.currentSitePath,
    state.currentWorkspaceKey,
    state.currentSiteKey
  );
}
