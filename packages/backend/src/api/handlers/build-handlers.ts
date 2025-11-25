/**
 * Build and Serve API Handlers
 *
 * Handles Hugo build and serve operations.
 * TODO: Implement when Hugo modules are migrated.
 */

import type { AppContainer } from '../../config/container.js';

export function createServeWorkspaceHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    serveKey,
  }: {
    siteKey: string;
    workspaceKey: string;
    serveKey: string;
  }) => {
    throw new Error('serveWorkspace: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createStopHugoServerHandler(container: AppContainer) {
  return async () => {
    throw new Error('stopHugoServer: Not yet implemented - needs hugo-server migration');
  };
}

export function createBuildWorkspaceHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    buildKey,
    extraConfig,
  }: {
    siteKey: string;
    workspaceKey: string;
    buildKey: string;
    extraConfig?: any;
  }) => {
    throw new Error('buildWorkspace: Not yet implemented - needs WorkspaceService migration');
  };
}

export function createBuildHandlers(container: AppContainer) {
  return {
    serveWorkspace: createServeWorkspaceHandler(container),
    stopHugoServer: createStopHugoServerHandler(container),
    buildWorkspace: createBuildWorkspaceHandler(container),
  };
}
