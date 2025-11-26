/**
 * Development/Testing Placeholder Adapters
 *
 * These no-op implementations allow the backend to run without a real platform
 * (useful for testing, CLI mode, or development without Electron).
 */

import type { PlatformAdapters } from './types.js';

/**
 * Create a set of no-op platform adapters for development/testing
 */
export function createDevAdapters(): PlatformAdapters {
  return {
    dialog: {
      async showOpenDialog() {
        console.log('[DevAdapter] showOpenDialog called');
        return [];
      },
      async showSaveDialog() {
        console.log('[DevAdapter] showSaveDialog called');
        return undefined;
      },
      async showMessageBox() {
        console.log('[DevAdapter] showMessageBox called');
        return 0;
      },
    },

    shell: {
      async openExternal(url: string) {
        console.log('[DevAdapter] openExternal called:', url);
      },
      showItemInFolder(fullPath: string) {
        console.log('[DevAdapter] showItemInFolder called:', fullPath);
      },
      async openPath(path: string) {
        console.log('[DevAdapter] openPath called:', path);
        return '';
      },
    },

    window: {
      showLogWindow(content: string) {
        console.log('[DevAdapter] showLogWindow called with content length:', content.length);
      },
      reloadMainWindow() {
        console.log('[DevAdapter] reloadMainWindow called');
      },
      sendToRenderer(channel: string, data: any) {
        console.log('[DevAdapter] sendToRenderer called:', channel, data);
      },
      async openSiteLibrary() {
        console.log('[DevAdapter] openSiteLibrary called');
      },
      setMenuBarVisibility(visible: boolean) {
        console.log('[DevAdapter] setMenuBarVisibility called:', visible);
      },
      appendToOutputConsole(line: string) {
        console.log('[DevAdapter] appendToOutputConsole:', line);
      },
    },

    menu: {
      setMenuItemEnabled(itemId: string, enabled: boolean) {
        console.log('[DevAdapter] setMenuItemEnabled called:', itemId, enabled);
      },
      createMainMenu() {
        console.log('[DevAdapter] createMainMenu called');
      },
    },

    appInfo: {
      isPackaged() {
        return false;
      },
      getAppPath() {
        return process.cwd();
      },
      getVersion() {
        return '0.0.0-dev';
      },
      getPath(name: 'home' | 'appData' | 'userData' | 'temp' | 'downloads') {
        console.log('[DevAdapter] getPath called:', name);
        // Return simple defaults based on process.env
        switch (name) {
          case 'home':
            return process.env.HOME || process.env.USERPROFILE || '/tmp';
          case 'temp':
            return process.env.TMPDIR || process.env.TEMP || '/tmp';
          default:
            return process.cwd();
        }
      },
    },

    outputConsole: {
      appendLine(line: string) {
        console.log('[Hugo Output]', line);
      },
    },

    screenshotWindowManager: {
      createScreenshotAndFavicon(host: string, port: number, outputDir: string) {
        console.log('[DevAdapter] createScreenshotAndFavicon called:', host, port, outputDir);
      },
    },
  };
}
