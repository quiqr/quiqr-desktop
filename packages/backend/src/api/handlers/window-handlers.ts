/**
 * Window and UI Management API Handlers
 *
 * Handles window operations, menu management, and UI redirects.
 * Note: Some of these operations require direct access to Electron's main window,
 * which will need to be passed through the container or adapters.
 */

import type { AppContainer } from '../../config/container.js';

/**
 * Open the site library view
 */
export function createOpenSiteLibraryHandler(container: AppContainer) {
  return async () => {
    await container.adapters.window.openSiteLibrary();
    return true;
  };
}

/**
 * Show the menu bar
 */
export function createShowMenuBarHandler(container: AppContainer) {
  return async () => {
    container.adapters.window.setMenuBarVisibility(true);
    return true;
  };
}

/**
 * Hide the menu bar
 */
export function createHideMenuBarHandler(container: AppContainer) {
  return async () => {
    container.adapters.window.setMenuBarVisibility(false);
    return true;
  };
}

/**
 * Redirect to a specific location in the UI
 */
export function createRedirectToHandler(container: AppContainer) {
  return async ({
    location,
    forceRefresh,
  }: {
    location: string;
    forceRefresh?: boolean;
  }) => {
    container.adapters.window.sendToRenderer('redirectToGivenLocation', {
      location,
      forceRefresh,
    });
    return true;
  };
}

/**
 * Mount a workspace in the parent window
 */
export function createParentMountWorkspaceHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
  }: {
    siteKey: string;
    workspaceKey: string;
  }) => {
    const location = `/sites/${decodeURIComponent(siteKey)}/workspaces/${decodeURIComponent(workspaceKey)}`;
    container.adapters.window.sendToRenderer('redirectToGivenLocation', location);
    return true;
  };
}

/**
 * Reload the theme style
 */
export function createReloadThemeStyleHandler(container: AppContainer) {
  return async () => {
    container.adapters.window.sendToRenderer('reloadThemeStyle', {});
    return true;
  };
}

/**
 * Show the log window
 */
export function createShowLogWindowHandler(container: AppContainer) {
  return async () => {
    container.adapters.window.showLogWindow('');
    return true;
  };
}

/**
 * Reload the current form if the path matches
 */
export function createReloadCurrentFormHandler(container: AppContainer) {
  return async () => {
    if (container.state.currentFormNodePath) {
      let currentPath = container.state.currentFormNodePath.endsWith('/')
        ? container.state.currentFormNodePath.slice(0, -1)
        : container.state.currentFormNodePath;
      currentPath = currentPath.toLowerCase().replace('/', '.');

      if (container.state.currentFormShouldReload === currentPath) {
        // TODO: This needs window adapter support to get current URL
        // Original logic:
        // let mainWindow = global.mainWM.getCurrentInstanceOrNew();
        // let urlpath = "/sites/"+mainWindow.webContents.getURL().split("/refresh-form-").shift();
        // urlpath = "/sites/"+urlpath.split("/sites/").pop()+"/refresh-form-"+Math.random();
        // mainWindow.webContents.send("redirectToGivenLocation", urlpath);
        throw new Error(
          'reloadCurrentForm: Not yet implemented - needs window adapter'
        );
      }
    }
    return true;
  };
}

/**
 * Create all window-related handlers
 */
export function createWindowHandlers(container: AppContainer) {
  return {
    openSiteLibrary: createOpenSiteLibraryHandler(container),
    showMenuBar: createShowMenuBarHandler(container),
    hideMenuBar: createHideMenuBarHandler(container),
    redirectTo: createRedirectToHandler(container),
    parentMountWorkspace: createParentMountWorkspaceHandler(container),
    reloadThemeStyle: createReloadThemeStyleHandler(container),
    showLogWindow: createShowLogWindowHandler(container),
    reloadCurrentForm: createReloadCurrentFormHandler(container),
  };
}
