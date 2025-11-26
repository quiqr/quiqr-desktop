/**
 * Workspace Handler Helper
 *
 * Provides utility functions for working with WorkspaceService in handlers.
 */

import type { AppContainer } from '../../../config/container.js';
import type { WorkspaceService } from '../../../services/workspace/workspace-service.js';
import { SiteService } from '../../../services/site/site-service.js';

/**
 * Create a WorkspaceService instance for the given workspace
 */
export async function createWorkspaceServiceForParams(
  container: AppContainer,
  siteKey: string,
  workspaceKey: string
): Promise<WorkspaceService> {
  // Get site configuration
  const siteConfig = await container.libraryService.getSiteConf(siteKey);

  // Create SiteService instance
  const siteService = new SiteService(
    siteConfig,
    container.siteSourceFactory,
    container.syncFactory
  );

  // Get workspace head to find the path
  const workspace = await siteService.getWorkspaceHead(workspaceKey);

  if (!workspace) {
    throw new Error(`Workspace not found: ${workspaceKey} for site: ${siteKey}`);
  }

  // Create and return WorkspaceService
  return container.createWorkspaceService(workspace.path, workspaceKey, siteKey);
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
