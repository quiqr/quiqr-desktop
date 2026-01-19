/**
 * Menu API Handlers
 *
 * Handlers for menu-related operations in web mode.
 * These endpoints allow the frontend to fetch menu state and execute menu actions.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import type { AppContainer } from '../../config/container.js';

/**
 * Get current menu state (for web mode)
 * Returns the current menu structure with enabled states, checkboxes, etc.
 */
export function createGetMenuStateHandler(container: AppContainer) {
  return async () => {
    // Check if adapter is WebMenuAdapter (has getMenuState method)
    const menuAdapter = container.adapters.menu;

    if ('getMenuState' in menuAdapter && typeof menuAdapter.getMenuState === 'function') {
      return menuAdapter.getMenuState();
    }

    // Return empty state for Electron mode (where native menus are used)
    return { menus: [], version: 0 };
  };
}

/**
 * Execute a menu action
 * Handles all menu item clicks from the frontend
 */
export function createExecuteMenuActionHandler(container: AppContainer) {
  return async ({ action, data }: { action: string; data?: unknown }) => {
    // Parse action (format: "actionName" or "actionName:param")
    // Only split on the FIRST colon to preserve URLs like "https://..."
    const colonIndex = action.indexOf(':');
    const actionName = colonIndex >= 0 ? action.substring(0, colonIndex) : action;
    const actionParam = colonIndex >= 0 ? action.substring(colonIndex + 1) : undefined;

    try {
      switch (actionName) {
        // ====================================================================
        // Navigation actions
        // ====================================================================
        case 'showPreferences':
          return { type: 'navigate', path: '/prefs' };

        case 'showSiteLibrary':
          return { type: 'navigate', path: '/sites/last' };

        case 'closeSite':
          return { type: 'navigate', path: '/sites/last' };

        // ====================================================================
        // Dialog actions (via navigation)
        // ====================================================================
        case 'newSite':
          return { type: 'openDialog', dialog: 'newSite' };

        case 'importSite':
          return { type: 'openDialog', dialog: 'importSite' };

        case 'showWelcome':
          return { type: 'openDialog', dialog: 'welcome' };

        // ====================================================================
        // Config actions
        // ====================================================================
        case 'setRole':
          if (actionParam) {
            container.config.setPrefKey('applicationRole', actionParam);
            await container.config.save();
            container.adapters.menu.createMainMenu(); // Rebuild menu
            // Trigger page reload to refresh workspace view with new role
            return { type: 'reload', message: `Switched to ${actionParam} role` };
          }
          throw new Error('Role parameter required');

        case 'toggleExperimental':
          {
            const newValue = !container.config.experimentalFeatures;
            container.config.setExperimentalFeatures(newValue);
            await container.config.save();
            container.adapters.menu.createMainMenu();
            return { type: 'success', refresh: true };
          }

        case 'toggleDraftMode':
          {
            const newValue = !container.config.hugoServeDraftMode;
            container.config.setHugoServeDraftMode(newValue);
            await container.config.save();
            container.adapters.menu.createMainMenu();
            return { type: 'success', refresh: true };
          }

        case 'toggleAutoServe':
          {
            const newValue = !container.config.devDisableAutoHugoServe;
            container.config.setDevDisableAutoHugoServe(newValue);
            await container.config.save();
            container.adapters.menu.createMainMenu();
            return { type: 'success', refresh: true };
          }

        case 'togglePartialCache':
          {
            const newValue = !container.config.disablePartialCache;
            container.config.setDisablePartialCache(newValue);
            await container.config.save();
            container.adapters.menu.createMainMenu();
            return { type: 'success', refresh: true };
          }

        case 'invalidateCache':
          {
            container.configurationProvider.invalidateCache();
            return { type: 'success', message: 'Sites cache invalidated successfully' };
          }

        // ====================================================================
        // Workspace actions
        // ====================================================================
        case 'restartServer':
          {
            const ws = container.getCurrentWorkspaceService();
            if (ws) {
              ws.stopHugoServer();
              await ws.serve();
              return { type: 'success', message: 'Hugo server restarted' };
            }
            return { type: 'error', message: 'No workspace is currently running' };
          }

        // ====================================================================
        // External actions
        // ====================================================================
        case 'openExternal':
          if (actionParam) {
            // Return openExternal response to let frontend handle it (window.open)
            return { type: 'openExternal', url: actionParam };
          }
          throw new Error('URL parameter required');

        case 'showVersion':
          {
            const version = container.adapters.appInfo.getVersion();
            const appPath = container.adapters.appInfo.getAppPath();

            // Try to read build info if available
            let buildInfo = '';
            const buildIdPath = path.join(appPath, 'resources', 'all', 'build-git-id.txt');
            const buildDatePath = path.join(appPath, 'resources', 'all', 'build-date.txt');

            try {
              if (await fs.pathExists(buildIdPath)) {
                const buildId = await fs.readFile(buildIdPath, 'utf8');
                buildInfo += `\nBuild ID: ${buildId.trim()}`;
              }
              if (await fs.pathExists(buildDatePath)) {
                const buildDate = await fs.readFile(buildDatePath, 'utf8');
                buildInfo += `\nBuild Date: ${buildDate.trim()}`;
              }
            } catch (error) {
              console.error('Error reading build info:', error);
            }

            return {
              type: 'info',
              message: `Quiqr Desktop\n\nVersion: ${version}${buildInfo}`
            };
          }

        // ====================================================================
        // Unknown action
        // ====================================================================
        default:
          console.warn('[MenuHandler] Unknown menu action:', action);
          return { type: 'error', message: `Unknown action: ${actionName}` };
      }
    } catch (error) {
      console.error('[MenuHandler] Error executing menu action:', error);
      return {
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to execute menu action',
      };
    }
  };
}

/**
 * Create all menu-related handlers
 */
export function createMenuHandlers(container: AppContainer) {
  return {
    getMenuState: createGetMenuStateHandler(container),
    executeMenuAction: createExecuteMenuActionHandler(container),
  };
}
