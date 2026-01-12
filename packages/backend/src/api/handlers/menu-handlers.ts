/**
 * Menu API Handlers
 *
 * Handlers for menu-related operations in web mode.
 * These endpoints allow the frontend to fetch menu state and execute menu actions.
 */

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
  return async ({ action, data }: { action: string; data?: any }) => {
    // Parse action (format: "actionName" or "actionName:param")
    const [actionName, actionParam] = action.split(':');

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
        // Dialog actions
        // ====================================================================
        case 'newSite':
          return { type: 'openDialog', dialog: 'newSite' };

        case 'importSite':
          return { type: 'openDialog', dialog: 'importSite' };

        case 'showWelcome':
          return { type: 'openDialog', dialog: 'splash' };

        // ====================================================================
        // Config actions
        // ====================================================================
        case 'setRole':
          if (actionParam) {
            container.config.setPrefKey('applicationRole', actionParam);
            await container.config.save();
            container.adapters.menu.createMainMenu(); // Rebuild menu
            return { type: 'success', refresh: true };
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
            await container.adapters.shell.openExternal(actionParam);
            return { type: 'success' };
          }
          throw new Error('URL parameter required');

        case 'showVersion':
          {
            const version = container.adapters.appInfo.getVersion();
            return { type: 'info', message: `Quiqr Desktop v${version}` };
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
