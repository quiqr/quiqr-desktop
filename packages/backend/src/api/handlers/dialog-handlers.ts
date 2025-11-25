/**
 * Dialog API Handlers
 *
 * Handles file/folder selection dialogs.
 */

import type { AppContainer } from '../../config/container.js';

/**
 * Show a folder selection dialog
 */
export function createShowOpenFolderDialogHandler(container: AppContainer) {
  return async () => {
    try {
      const result = await container.adapters.dialog.showOpenDialog({
        properties: ['openDirectory'],
      });

      if (result.length === 0) {
        return { selectedFolder: null };
      } else {
        return { selectedFolder: result[0] };
      }
    } catch (error) {
      console.error('Error opening folder dialog:', error);
      throw error;
    }
  };
}

/**
 * Create all dialog-related handlers
 */
export function createDialogHandlers(container: AppContainer) {
  return {
    showOpenFolderDialog: createShowOpenFolderDialogHandler(container),
  };
}
