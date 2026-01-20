/**
 * Build and Serve API Handlers
 *
 * Handles Hugo build and serve operations.
 * TODO: Implement when Hugo modules are migrated.
 */

import { ExtraBuildConfig } from '@quiqr/types';
import type { AppContainer } from '../../config/container.js';

export function createServeWorkspaceHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serveKey,
  }: {
    siteKey: string;
    workspaceKey: string;
    serveKey: string;
  }) => {
    // Get the cached WorkspaceService (this will cache it for Hugo server persistence)
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);

    // Note: The migrated serve() method doesn't use serveKey directly
    // It automatically selects the first matching serve configuration from workspace config
    await workspaceService.serve();
  };
}

export function createStopHugoServerHandler(container: AppContainer) {
  return async () => {
    // Get the currently cached WorkspaceService (where the Hugo server is running)
    const workspaceService = container.getCurrentWorkspaceService();

    if (workspaceService) {
      workspaceService.stopHugoServer();
    }

    return { stopped: true };
  };
}

export function createRestartHugoServerHandler(container: AppContainer) {
  return async () => {
    // Get the currently cached WorkspaceService (where the Hugo server is running)
    const workspaceService = container.getCurrentWorkspaceService();

    if (workspaceService) {
      // Stop the existing server
      workspaceService.stopHugoServer();

      // Start it again (serve method will handle the restart)
      await workspaceService.serve();

      return { restarted: true };
    }

    return { restarted: false, error: 'No workspace is currently running' };
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
    extraConfig?: ExtraBuildConfig;
  }) => {
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    await workspaceService.build(buildKey, extraConfig || {});
  };
}

export function createBuildHandlers(container: AppContainer) {
  return {
    serveWorkspace: createServeWorkspaceHandler(container),
    stopHugoServer: createStopHugoServerHandler(container),
    restartHugoServer: createRestartHugoServerHandler(container),
    buildWorkspace: createBuildWorkspaceHandler(container),
  };
}
