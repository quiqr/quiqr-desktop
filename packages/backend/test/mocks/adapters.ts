/**
 * Mock Platform Adapters for Testing
 *
 * These mocks simulate platform-specific functionality without requiring
 * Electron or other platform dependencies.
 */

import { vi } from 'vitest';
import type {
  PlatformAdapters,
  DialogAdapter,
  ShellAdapter,
  WindowAdapter,
  MenuAdapter,
  AppInfoAdapter,
  OutputConsole,
  ScreenshotWindowManager,
} from '../../src/adapters/types.js';

export function createMockDialogAdapter(): DialogAdapter {
  return {
    showOpenDialog: vi.fn().mockResolvedValue([]),
    showSaveDialog: vi.fn().mockResolvedValue(undefined),
    showMessageBox: vi.fn().mockResolvedValue(0),
  };
}

export function createMockShellAdapter(): ShellAdapter {
  return {
    openExternal: vi.fn().mockResolvedValue(undefined),
    showItemInFolder: vi.fn(),
    openPath: vi.fn().mockResolvedValue(''),
  };
}

export function createMockWindowAdapter(): WindowAdapter {
  return {
    showLogWindow: vi.fn(),
    reloadMainWindow: vi.fn(),
    sendToRenderer: vi.fn(),
    openSiteLibrary: vi.fn().mockResolvedValue(undefined),
    setMenuBarVisibility: vi.fn(),
    appendToOutputConsole: vi.fn(),
  };
}

export function createMockMenuAdapter(): MenuAdapter {
  return {
    setMenuItemEnabled: vi.fn(),
    createMainMenu: vi.fn(),
  };
}

export function createMockAppInfoAdapter(overrides?: Partial<AppInfoAdapter>): AppInfoAdapter {
  return {
    isPackaged: () => false,
    getAppPath: () => '/mock/app/path',
    getVersion: () => '1.0.0-test',
    getPath: (name: 'home' | 'appData' | 'userData' | 'temp' | 'downloads') => {
      const paths: Record<string, string> = {
        home: '/mock/home',
        appData: '/mock/appData',
        userData: '/mock/userData',
        temp: '/mock/temp',
        downloads: '/mock/downloads',
      };
      return paths[name] || '/mock/unknown';
    },
    ...overrides,
  };
}

export function createMockOutputConsole(): OutputConsole {
  return {
    appendLine: vi.fn(),
  };
}

export function createMockScreenshotWindowManager(): ScreenshotWindowManager {
  return {
    createScreenshotAndFavicon: vi.fn(),
  };
}

/**
 * Create a complete set of mock platform adapters
 */
export function createMockAdapters(overrides?: Partial<PlatformAdapters>): PlatformAdapters {
  return {
    dialog: createMockDialogAdapter(),
    shell: createMockShellAdapter(),
    window: createMockWindowAdapter(),
    menu: createMockMenuAdapter(),
    appInfo: createMockAppInfoAdapter(),
    outputConsole: createMockOutputConsole(),
    screenshotWindowManager: createMockScreenshotWindowManager(),
    ...overrides,
  };
}

/**
 * Reset all mocks in the adapter set
 */
export function resetAdapterMocks(adapters: PlatformAdapters): void {
  // Reset dialog adapter
  vi.mocked(adapters.dialog.showOpenDialog).mockReset();
  vi.mocked(adapters.dialog.showSaveDialog).mockReset();
  vi.mocked(adapters.dialog.showMessageBox).mockReset();

  // Reset shell adapter
  vi.mocked(adapters.shell.openExternal).mockReset();
  vi.mocked(adapters.shell.showItemInFolder).mockReset();
  vi.mocked(adapters.shell.openPath).mockReset();

  // Reset window adapter
  vi.mocked(adapters.window.showLogWindow).mockReset();
  vi.mocked(adapters.window.reloadMainWindow).mockReset();
  vi.mocked(adapters.window.sendToRenderer).mockReset();
  vi.mocked(adapters.window.openSiteLibrary).mockReset();
  vi.mocked(adapters.window.setMenuBarVisibility).mockReset();
  vi.mocked(adapters.window.appendToOutputConsole).mockReset();

  // Reset menu adapter
  vi.mocked(adapters.menu.setMenuItemEnabled).mockReset();
  vi.mocked(adapters.menu.createMainMenu).mockReset();

  // Reset output console
  vi.mocked(adapters.outputConsole.appendLine).mockReset();

  // Reset screenshot window manager
  vi.mocked(adapters.screenshotWindowManager.createScreenshotAndFavicon).mockReset();
}
