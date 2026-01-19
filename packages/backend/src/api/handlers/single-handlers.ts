/**
 * Single Content API Handlers
 *
 * Handles single content item operations (like homepage, about page, etc.).
 * TODO: Implement when WorkspaceService is migrated.
 */

import type { AppContainer } from '../../config/container.js';

export function createGetSingleHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    singleKey,
    fileOverride,
  }: {
    siteKey: string;
    workspaceKey: string;
    singleKey: string;
    fileOverride?: string;
  }) => {
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.getSingle(singleKey, fileOverride);
  };
}

export function createUpdateSingleHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    singleKey,
    document,
  }: {
    siteKey: string;
    workspaceKey: string;
    singleKey: string;
    document: Record<string, unknown>;
  }) => {
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.updateSingle(singleKey, document);
  };
}

export function createOpenSingleInEditorHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    singleKey,
  }: {
    siteKey: string;
    workspaceKey: string;
    singleKey: string;
  }) => {
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.openSingleInEditor(singleKey);
  };
}

export function createBuildSingleHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    singleKey,
    buildAction,
  }: {
    siteKey: string;
    workspaceKey: string;
    singleKey: string;
    buildAction: string;
  }) => {
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);
    return await workspaceService.buildSingle(singleKey, buildAction);
  };
}

export function createSingleHandlers(container: AppContainer) {
  return {
    getSingle: createGetSingleHandler(container),
    updateSingle: createUpdateSingleHandler(container),
    openSingleInEditor: createOpenSingleInEditorHandler(container),
    buildSingle: createBuildSingleHandler(container),
  };
}
