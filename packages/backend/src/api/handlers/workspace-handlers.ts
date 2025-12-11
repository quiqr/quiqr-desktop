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
import path from 'path';
import { createWorkspaceServiceForParams, getCurrentWorkspaceService } from './helpers/workspace-helper.js';

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
    // Use the container's getWorkspaceService which handles caching and model watcher setup
    const workspaceService = await container.getWorkspaceService(siteKey, workspaceKey);

    // Get configuration - delegates to WorkspaceService
    const config = await workspaceService.getConfigurationsData();

    // Get workspace path for state update
    const workspacePath = workspaceService.getWorkspacePath();

    // Update state - delegates to AppState
    container.state.setCurrentSite(siteKey, workspaceKey, workspacePath);

    // Save last opened - delegates to AppConfig
    container.config.setLastOpenedSite(siteKey, workspaceKey, workspacePath);
    await container.config.save();

    // Update menu to reflect that a site is now selected
    container.adapters.menu.createMainMenu();

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

    // Save last opened site to config
    container.config.setLastOpenedSite(siteKey, workspaceKey, workspaceHead?.path || null);
    await container.config.save();

    // Update menu to reflect that a site is now selected
    container.adapters.menu.createMainMenu();

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
    const workspaceService = await createWorkspaceServiceForParams(
      container,
      siteKey,
      workspaceKey
    );
    return await workspaceService.getModelParseInfo();
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
    const workspaceService = await createWorkspaceServiceForParams(
      container,
      siteKey,
      workspaceKey
    );
    return await workspaceService.getCreatorMessage();
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
    const workspaceService = await createWorkspaceServiceForParams(
      container,
      siteKey,
      workspaceKey
    );
    return await workspaceService.getHugoConfigLanguages();
  };
}

/**
 * Get files from an absolute path
 */
export function createGetFilesFromAbsolutePathHandler(container: AppContainer) {
  return async ({ path }: { path: string }) => {
    const workspaceService = getCurrentWorkspaceService(container);
    return await workspaceService.getFilesFromAbsolutePath(path);
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
    const workspaceService = getCurrentWorkspaceService(container);
    const configuration = await workspaceService.getConfigurationsData();

    if (searchRootNode in configuration) {
      const configArray = (configuration as any)[searchRootNode];
      if (Array.isArray(configArray)) {
        const dynConf = configArray.find(
          (x: any) => x[searchLevelKeyVal.key] === searchLevelKeyVal.val
        );
        return dynConf;
      }
    }

    return null;
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
    const workspaceService = getCurrentWorkspaceService(container);
    const configuration = await workspaceService.getConfigurationsData();

    if (searchRootNode in configuration) {
      const configArray = (configuration as any)[searchRootNode];
      if (Array.isArray(configArray)) {
        const confObj = configArray.find((x: any) => x['key'] === 'mainConfig');
        if (confObj && confObj.fields) {
          const value = confObj.fields.find((x: any) => x['key'] === path);
          return value;
        }
      }
    }

    return null;
  };
}

/**
 * Get preview check configuration
 */
export function createGetPreviewCheckConfigurationHandler(container: AppContainer) {
  return async () => {
    const { state } = container;
    if (!state.currentSitePath) {
      throw new Error('No workspace is currently mounted');
    }

    const filePath = path.join(state.currentSitePath, 'quiqr', 'previewchecksettings.json');

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const strData = await fs.readFile(filePath, { encoding: 'utf-8' });
      const formatProvider = container.formatResolver.resolveForFilePath(filePath);

      if (!formatProvider) {
        throw new Error(`Could not resolve a format provider for file ${filePath}.`);
      }

      const obj = formatProvider.parse(strData);
      return obj;
    } catch (e) {
      console.error('Error reading preview check configuration:', e);
      return null;
    }
  };
}

/**
 * Parse a file to an object (file path is relative to current workspace)
 */
export function createParseFileToObjectHandler(container: AppContainer) {
  return async ({ file }: { file: string }) => {
    const { state } = container;

    // Resolve file path relative to current workspace if not absolute
    const filePath = path.isAbsolute(file)
      ? file
      : path.join(state.currentSitePath || process.cwd(), file);

    // Read the file contents
    const fileContent = await fs.readFile(filePath, 'utf-8');

    // Resolve the format provider based on file extension
    const formatProvider = container.formatResolver.resolveForFilePath(filePath);

    if (!formatProvider) {
      throw new Error(`Unsupported file format for file: ${filePath}`);
    }

    // Parse the file content
    const parsed = formatProvider.parse(fileContent);

    return parsed;
  };
}

/**
 * Run a glob pattern sync relative to the current workspace
 */
export function createGlobSyncHandler(container: AppContainer) {
  return async ({
    pattern,
    options,
  }: {
    pattern: string;
    options?: any;
  }) => {
    const { state } = container;

    // Use the current workspace path as the cwd if available
    const cwd = state.currentSitePath || process.cwd();

    // Run glob pattern with workspace as cwd
    const matches = globSync(pattern, { ...options, cwd });

    return matches;
  };
}

/**
 * Check if a Hugo version is installed
 */
export function createCheckHugoVersionHandler(container: AppContainer) {
  return async ({ version }: { version: string }) => {
    const installed = container.hugoDownloader.isVersionInstalled(version);
    return { installed, version };
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
    checkHugoVersion: createCheckHugoVersionHandler(container),
  };
}
