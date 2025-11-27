import util from 'util';

/**
 * Shell API Handlers
 *
 * Handles shell operations like opening files, folders, and URLs.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import type { AppContainer } from '../../config/container.js';

/**
 * Open a file or folder in the system file explorer
 */
export function createOpenFileExplorerHandler(container: AppContainer) {
  return async ({
    filepath,
    relativeToRoot = false,
  }: {
    filepath: string;
    relativeToRoot?: boolean;
  }) => {
    if (relativeToRoot) {
      // TODO: Need to determine the correct root path
      // For now, use currentSitePath if available
      const rootPath = container.state.currentSitePath || '';
      filepath = path.join(rootPath, filepath);
    }

    try {
      const lstat = fs.lstatSync(filepath);
      if (lstat.isDirectory()) {
        await container.adapters.shell.openPath(filepath);
      } else {
        await container.adapters.shell.openPath(path.dirname(filepath));
      }
      return true;
    } catch (e) {
      console.log('Error opening file explorer:', e);
      throw e;
    }
  };
}

/**
 * Open a file in the system's default editor
 */
export function createOpenFileInEditorHandler(container: AppContainer) {
  return async ({
    filepath,
    create = false,
    relativeToRoot = false,
  }: {
    filepath: string;
    create?: boolean;
    relativeToRoot?: boolean;
  }) => {
    if (relativeToRoot) {
      // TODO: Need to determine the correct root path
      const rootPath = container.state.currentSitePath || '';
      filepath = path.join(rootPath, filepath);
    }

    try {
      if (create && !fs.existsSync(filepath)) {
        fs.openSync(filepath, 'w');
      }
      await container.adapters.shell.openPath(filepath);
      return true;
    } catch (e) {
      console.log('Error opening file in editor:', e);
      throw e;
    }
  };
}

/**
 * Open a URL in the system's default browser
 */
export function createOpenExternalHandler(container: AppContainer) {
  return async ({ url }: { url: string }) => {
    try {
      await container.adapters.shell.openExternal(url);
      return true;
    } catch (e) {
      console.log('Error opening external URL:', e);
      throw e;
    }
  };
}

/**
 * Log a message to the console (for debugging)
 */
export function createLogToConsoleHandler(container: AppContainer) {
  return async ({
    message,
    label,
  }: {
    message: any;
    label?: string;
  }) => {
    if (label) {
      console.log('\n--- ' + label.toUpperCase() + ' --> ');
    }
    console.log(util.inspect(message, false, null, true));
    return true;
  };
}

/**
 * Create all shell-related handlers
 */
export function createShellHandlers(container: AppContainer) {
  return {
    openFileExplorer: createOpenFileExplorerHandler(container),
    openFileInEditor: createOpenFileInEditorHandler(container),
    openExternal: createOpenExternalHandler(container),
    logToConsole: createLogToConsoleHandler(container),
  };
}
