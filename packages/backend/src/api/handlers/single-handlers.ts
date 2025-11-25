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
    throw new Error('getSingle: Not yet implemented - needs WorkspaceService migration');
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
    document: any;
  }) => {
    throw new Error('updateSingle: Not yet implemented - needs WorkspaceService migration');
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
    throw new Error('openSingleInEditor: Not yet implemented - needs WorkspaceService migration');
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
    throw new Error('buildSingle: Not yet implemented - needs WorkspaceService migration');
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
