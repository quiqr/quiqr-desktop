/**
 * Workspace API Handlers
 *
 * Handles workspace operations like listing, mounting, and getting details.
 * TODO: These handlers need full implementation once WorkspaceService is migrated.
 */

import type { AppContainer } from '../../config/container.js';
import { SiteService } from '../../services/site/site-service.js';
import fs from 'fs-extra';
import { globSync } from 'glob';

/**
 * List all workspaces for a site
 */
export function createListWorkspacesHandler(container: AppContainer) {
  return async ({ siteKey }: { siteKey: string }) => {
    // Get site configuration
    const siteConfig = await container.libraryService.getSiteConf(siteKey);

    // Create SiteService instance
    const siteService = new SiteService(
      siteConfig,
      container.siteSourceFactory,
      container.syncFactory
    );

    // List workspaces
    return await siteService.listWorkspaces();
  };
}

/**
 * Get workspace details and configuration
 */
export function createGetWorkspaceDetailsHandler(container: AppContainer) {
  return async ({ siteKey, workspaceKey }: { siteKey: string; workspaceKey: string }) => {
    // 1. Get workspace path from mounted workspace
    const siteConfig = await container.libraryService.getSiteConf(siteKey);
    const siteService = new SiteService(siteConfig, container.siteSourceFactory, container.syncFactory);
    const workspace = await siteService.getWorkspaceHead(workspaceKey);

    if (!workspace) throw new Error('Workspace not found');

    // 2. Create WorkspaceService for this workspace
    const workspaceService = container.createWorkspaceService(
      workspace.path,
      workspaceKey,
      siteKey
    );

    // 3. Get configuration - delegates to WorkspaceService
    const config = await workspaceService.getConfigurationsData();

    // 4. Update state - delegates to AppState
    container.state.setCurrentSite(siteKey, workspaceKey, workspace.path);

    // 5. Save last opened - delegates to AppConfig  
    container.config.setLastOpenedSite(siteKey, workspaceKey, workspace.path);
    await container.config.save();

    // 6. Set up file watcher - NEW helper method needed
    // setupModelWatcher(container, workspace.path);

    // 7. Hugo download - STUB for MVP (or skip entirely)
    // await ensureHugoAvailable(config.hugover);

    return config;
  };
}


/**
 * Mount a workspace (make it active)
 */
export function createMountWorkspaceHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
  }: {
    siteKey: string;
    workspaceKey: string;
  }) => {
    // Get site configuration
    const siteConfig = await container.libraryService.getSiteConf(siteKey);

    // Create SiteService instance
    const siteService = new SiteService(
      siteConfig,
      container.siteSourceFactory,
      container.syncFactory
    );

    // Mount the workspace
    await siteService.mountWorkspace(workspaceKey);

    // Get the workspace head to find the path
    const workspaceHead = await siteService.getWorkspaceHead(workspaceKey);

    // Update container state (similar to old backend's global state)
    container.state.currentSiteKey = siteKey;
    container.state.currentWorkspaceKey = workspaceKey;
    container.state.currentSitePath = workspaceHead?.path || '';

    // TODO: Set window title, update menu
    // TODO: Save last opened site to config

    // Return workspace path as string (matches frontend schema)
    return workspaceHead?.path || '';
  };
}

/**
 * Get workspace model parse information
 */
export function createGetWorkspaceModelParseInfoHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
  }: {
    siteKey: string;
    workspaceKey: string;
  }) => {
    // TODO: Implement with migrated WorkspaceService
    throw new Error('getWorkspaceModelParseInfo: Not yet implemented - needs WorkspaceService migration');
  };
}

/**
 * Get creator message for a workspace
 */
export function createGetCreatorMessageHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
  }: {
    siteKey: string;
    workspaceKey: string;
  }) => {
    // TODO: Implement with migrated WorkspaceService
    throw new Error('getCreatorMessage: Not yet implemented - needs WorkspaceService migration');
  };
}

/**
 * Get languages from Hugo config
 */
export function createGetLanguagesHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
  }: {
    siteKey: string;
    workspaceKey: string;
  }) => {
    // TODO: Implement with migrated WorkspaceService
    throw new Error('getLanguages: Not yet implemented - needs WorkspaceService migration');
  };
}

/**
 * Get files from an absolute path
 */
export function createGetFilesFromAbsolutePathHandler(container: AppContainer) {
  return async ({ path }: { path: string }) => {
    // TODO: Implement with migrated WorkspaceService
    throw new Error('getFilesFromAbsolutePath: Not yet implemented - needs WorkspaceService migration');
  };
}

/**
 * Get dynamic form fields
 */
export function createGetDynFormFieldsHandler(container: AppContainer) {
  return async ({
    searchRootNode,
    searchLevelKeyVal,
  }: {
    searchRootNode: string;
    searchLevelKeyVal: { key: string; val: string };
  }) => {
    // TODO: Implement with migrated WorkspaceService
    throw new Error('getDynFormFields: Not yet implemented - needs WorkspaceService migration');
  };
}

/**
 * Get value by config path
 */
export function createGetValueByConfigPathHandler(container: AppContainer) {
  return async ({
    searchRootNode,
    path,
  }: {
    searchRootNode: string;
    path: string;
  }) => {
    // TODO: Implement with migrated WorkspaceService
    throw new Error('getValueByConfigPath: Not yet implemented - needs WorkspaceService migration');
  };
}

/**
 * Get preview check configuration
 */
export function createGetPreviewCheckConfigurationHandler(container: AppContainer) {
  return async () => {
    // TODO: Implement - reads quiqr/previewchecksettings.json
    throw new Error('getPreviewCheckConfiguration: Not yet implemented');
  };
}

/**
 * Parse a file to an object
 */
export function createParseFileToObjectHandler(container: AppContainer) {
  return async ({ file }: { file: string }) => {
    // Read the file contents
    const fileContent = await fs.readFile(file, 'utf-8');

    // Resolve the format provider based on file extension
    const formatProvider = container.formatResolver.resolveForFilePath(file);

    if (!formatProvider) {
      throw new Error(`Unsupported file format for file: ${file}`);
    }

    // Parse the file content
    const parsed = formatProvider.parse(fileContent);

    return parsed;
  };
}

/**
 * Run a glob pattern sync
 */
export function createGlobSyncHandler(container: AppContainer) {
  return async ({
    pattern,
    options,
  }: {
    pattern: string;
    options?: any;
  }) => {
    // Run glob pattern synchronously
    const matches = globSync(pattern, options || {});

    return matches;
  };
}

/**
 * Create all workspace-related handlers
 */
export function createWorkspaceHandlers(container: AppContainer) {
  return {
    listWorkspaces: createListWorkspacesHandler(container),
    getWorkspaceDetails: createGetWorkspaceDetailsHandler(container),
    mountWorkspace: createMountWorkspaceHandler(container),
    getWorkspaceModelParseInfo: createGetWorkspaceModelParseInfoHandler(container),
    getCreatorMessage: createGetCreatorMessageHandler(container),
    getLanguages: createGetLanguagesHandler(container),
    getFilesFromAbsolutePath: createGetFilesFromAbsolutePathHandler(container),
    getDynFormFields: createGetDynFormFieldsHandler(container),
    getValueByConfigPath: createGetValueByConfigPathHandler(container),
    getPreviewCheckConfiguration: createGetPreviewCheckConfigurationHandler(container),
    parseFileToObject: createParseFileToObjectHandler(container),
    globSync: createGlobSyncHandler(container),
  };
}
