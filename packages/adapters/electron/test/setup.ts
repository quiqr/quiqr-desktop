/**
 * Test setup for Electron adapter tests
 */

import { vi } from 'vitest';

// Mock Electron modules
vi.mock('electron', () => {
  // Create a proper BrowserWindow mock constructor
  class MockBrowserWindow {
    setMenuBarVisibility = vi.fn();
    loadURL = vi.fn();
    webContents = {
      capturePage: vi.fn(() => Promise.resolve({
        toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
        toPNG: vi.fn(() => Buffer.from('mock')),
      })),
      executeJavaScript: vi.fn(() => Promise.resolve()),
    };
    close = vi.fn();
    on = vi.fn();
  }

  return {
    app: {
      isPackaged: false,
      getAppPath: vi.fn(() => '/mock/app/path'),
      getVersion: vi.fn(() => '1.0.0'),
      getPath: vi.fn((name: string) => `/mock/path/${name}`),
    },
    dialog: {
      showOpenDialog: vi.fn(),
      showSaveDialog: vi.fn(),
      showMessageBox: vi.fn(),
    },
    shell: {
      openExternal: vi.fn(),
      showItemInFolder: vi.fn(),
      openPath: vi.fn(),
    },
    BrowserWindow: MockBrowserWindow,
  };
});

// Mock dynamic imports
vi.mock('../src/ui-managers/menu-manager.js', () => ({
  menuManager: {
    setMenuItemEnabled: vi.fn(),
    createMainMenu: vi.fn(),
  },
}));

vi.mock('../src/ui-managers/main-window-manager.js', () => ({
  closeSiteAndShowSelectSites: vi.fn(),
}));

vi.mock('../src/ui-managers/screenshot-window-manager.js', () => ({
  createScreenshotAndFavicon: vi.fn(),
}));
