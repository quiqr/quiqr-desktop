/**
 * Development adapters - Minimal implementations for standalone development
 */

import type { PlatformAdapters } from './types.js';

function createNoopMenuAdapter() {
  return {
    setMenuItemEnabled: () => {},
    createMainMenu: () => {},
  };
}

function createDevAppInfoAdapter() {
  return {
    isPackaged: () => false,
    getAppPath: () => process.cwd(),
    getVersion: () => '0.0.0-dev',
    getPath: (name: 'home' | 'appData' | 'userData' | 'temp' | 'downloads') => {
      switch (name) {
        case 'home':
          return process.env.HOME || process.env.USERPROFILE || '/tmp';
        case 'temp':
          return process.env.TMPDIR || process.env.TEMP || '/tmp';
        default:
          return process.cwd();
      }
    },
  };
}

export function createDevAdapters(): PlatformAdapters {
  return {
    menu: createNoopMenuAdapter(),
    window: {
      reloadMainWindow: () => {
        console.log('[DEV] reloadMainWindow called');
      },
      sendToRenderer: () => {
        console.log('[DEV] sendToRenderer called');
      },
      openSiteLibrary: async () => {
        console.log('[DEV] openSiteLibrary called');
      },
      setMenuBarVisibility: () => {
        console.log('[DEV] setMenuBarVisibility called');
      },
      appendToOutputConsole: () => {
        console.log('[DEV] appendToOutputConsole called');
      },
    },
    dialog: {
      showOpenDialog: async () => {
        console.log('[DEV] showOpenDialog called');
        return [];
      },
      showSaveDialog: async () => {
        console.log('[DEV] showSaveDialog called');
        return undefined;
      },
      showMessageBox: async () => {
        console.log('[DEV] showMessageBox called');
        return 0;
      },
    },
    shell: {
      openExternal: async (url: string) => {
        console.log('[DEV] openExternal called:', url);
      },
      showItemInFolder: (fullPath: string) => {
        console.log('[DEV] showItemInFolder called:', fullPath);
      },
      openPath: async (path: string) => {
        console.log('[DEV] openPath called:', path);
        return '';
      },
    },
    outputConsole: {
      appendLine: (line: string) => {
        console.log('[Hugo Output]', line);
      },
    },
    screenshotWindowManager: {
      createScreenshotAndFavicon: (host: string, port: number, outputDir: string) => {
        console.log('[DEV] createScreenshotAndFavicon called:', host, port, outputDir);
      },
    },
    appInfo: createDevAppInfoAdapter(),
  };
}
