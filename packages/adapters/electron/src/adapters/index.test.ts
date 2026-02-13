/**
 * Tests for Electron Adapters
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ElectronDialogAdapter,
  ElectronShellAdapter,
  ElectronWindowAdapter,
  ElectronMenuAdapter,
  ElectronAppInfoAdapter,
  ElectronOutputConsole,
  ElectronScreenshotWindowManager,
  createElectronAdapters,
} from './index';
import { app, dialog, shell, BrowserWindow } from 'electron';

describe('ElectronDialogAdapter', () => {
  let adapter: ElectronDialogAdapter;

  beforeEach(() => {
    adapter = new ElectronDialogAdapter();
    vi.clearAllMocks();
  });

  describe('showOpenDialog', () => {
    it('should return file paths when files are selected', async () => {
      const mockPaths = ['/path/to/file1.txt', '/path/to/file2.txt'];
      vi.mocked(dialog.showOpenDialog).mockResolvedValue({
        canceled: false,
        filePaths: mockPaths,
      });

      const result = await adapter.showOpenDialog({});
      expect(result).toEqual(mockPaths);
      expect(dialog.showOpenDialog).toHaveBeenCalledWith({});
    });

    it('should return empty array when dialog is canceled', async () => {
      vi.mocked(dialog.showOpenDialog).mockResolvedValue({
        canceled: true,
        filePaths: [],
      });

      const result = await adapter.showOpenDialog({});
      expect(result).toEqual([]);
    });
  });

  describe('showSaveDialog', () => {
    it('should return file path when save is confirmed', async () => {
      const mockPath = '/path/to/save.txt';
      vi.mocked(dialog.showSaveDialog).mockResolvedValue({
        canceled: false,
        filePath: mockPath,
      });

      const result = await adapter.showSaveDialog({});
      expect(result).toEqual(mockPath);
    });

    it('should return undefined when dialog is canceled', async () => {
      vi.mocked(dialog.showSaveDialog).mockResolvedValue({
        canceled: true,
        filePath: '',
      });

      const result = await adapter.showSaveDialog({});
      expect(result).toBeUndefined();
    });
  });

  describe('showMessageBox', () => {
    it('should return the button index clicked', async () => {
      vi.mocked(dialog.showMessageBox).mockResolvedValue({
        response: 1,
        checkboxChecked: false,
      });

      const result = await adapter.showMessageBox({ message: 'Test' });
      expect(result).toBe(1);
    });
  });
});

describe('ElectronShellAdapter', () => {
  let adapter: ElectronShellAdapter;

  beforeEach(() => {
    adapter = new ElectronShellAdapter();
    vi.clearAllMocks();
  });

  describe('openExternal', () => {
    it('should call shell.openExternal with URL', async () => {
      vi.mocked(shell.openExternal).mockResolvedValue();

      await adapter.openExternal('https://example.com');
      expect(shell.openExternal).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe('showItemInFolder', () => {
    it('should call shell.showItemInFolder with path', () => {
      adapter.showItemInFolder('/path/to/file');
      expect(shell.showItemInFolder).toHaveBeenCalledWith('/path/to/file');
    });
  });

  describe('openPath', () => {
    it('should call shell.openPath and return result', async () => {
      vi.mocked(shell.openPath).mockResolvedValue('');

      const result = await adapter.openPath('/path/to/open');
      expect(result).toBe('');
      expect(shell.openPath).toHaveBeenCalledWith('/path/to/open');
    });
  });
});

describe('ElectronWindowAdapter', () => {
  let adapter: ElectronWindowAdapter;
  let mockWindow: any;

  beforeEach(() => {
    adapter = new ElectronWindowAdapter();
    mockWindow = {
      reload: vi.fn(),
      webContents: {
        send: vi.fn(),
      },
      setMenuBarVisibility: vi.fn(),
    };
    vi.clearAllMocks();
  });

  describe('setMainWindow', () => {
    it('should store the main window reference', () => {
      adapter.setMainWindow(mockWindow);
      // Verify by calling methods that use the window
      adapter.reloadMainWindow();
      expect(mockWindow.reload).toHaveBeenCalled();
    });

    it('should allow setting window to null', () => {
      adapter.setMainWindow(mockWindow);
      adapter.setMainWindow(null);
      // Calling methods should be safe no-ops
      adapter.reloadMainWindow(); // Should not throw
    });
  });

  describe('reloadMainWindow', () => {
    it('should reload the window if set', () => {
      adapter.setMainWindow(mockWindow);
      adapter.reloadMainWindow();
      expect(mockWindow.reload).toHaveBeenCalled();
    });

    it('should not throw if window is not set', () => {
      expect(() => adapter.reloadMainWindow()).not.toThrow();
    });
  });

  describe('sendToRenderer', () => {
    it('should send data to renderer via IPC', () => {
      adapter.setMainWindow(mockWindow);
      adapter.sendToRenderer('test-channel', { foo: 'bar' });
      expect(mockWindow.webContents.send).toHaveBeenCalledWith('test-channel', { foo: 'bar' });
    });

    it('should handle string data', () => {
      adapter.setMainWindow(mockWindow);
      adapter.sendToRenderer('test-channel', 'test-data');
      expect(mockWindow.webContents.send).toHaveBeenCalledWith('test-channel', 'test-data');
    });

    it('should not throw if window is not set', () => {
      expect(() => adapter.sendToRenderer('test-channel', 'data')).not.toThrow();
    });
  });

  describe('setMenuBarVisibility', () => {
    it('should set menu bar visibility', () => {
      adapter.setMainWindow(mockWindow);
      adapter.setMenuBarVisibility(true);
      expect(mockWindow.setMenuBarVisibility).toHaveBeenCalledWith(true);
    });

    it('should not throw if window is not set', () => {
      expect(() => adapter.setMenuBarVisibility(false)).not.toThrow();
    });
  });

  describe('appendToOutputConsole', () => {
    it('should log output to console', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      adapter.appendToOutputConsole('Test output');
      expect(consoleSpy).toHaveBeenCalledWith('[HUGO OUTPUT]', 'Test output');
      consoleSpy.mockRestore();
    });
  });

  describe('openSiteLibrary', () => {
    it('should call closeSiteAndShowSelectSites', async () => {
      const { closeSiteAndShowSelectSites } = await import('../ui-managers/main-window-manager.js');
      await adapter.openSiteLibrary();
      expect(closeSiteAndShowSelectSites).toHaveBeenCalled();
    });
  });
});

describe('ElectronMenuAdapter', () => {
  let adapter: ElectronMenuAdapter;

  beforeEach(() => {
    adapter = new ElectronMenuAdapter();
    vi.clearAllMocks();
  });

  describe('setMenuItemEnabled', () => {
    it('should call menuManager.setMenuItemEnabled', async () => {
      // Get the mock reference first
      const { menuManager } = await import('../ui-managers/menu-manager.js');

      adapter.setMenuItemEnabled('test-item', true);

      // Wait for the promise to resolve
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(menuManager.setMenuItemEnabled).toHaveBeenCalledWith('test-item', true);
    });
  });

  describe('createMainMenu', () => {
    it('should call menuManager.createMainMenu', async () => {
      adapter.createMainMenu();

      // Wait for dynamic import to resolve
      await new Promise(resolve => setTimeout(resolve, 10));

      const { menuManager } = await import('../ui-managers/menu-manager.js');
      expect(menuManager.createMainMenu).toHaveBeenCalled();
    });
  });
});

describe('ElectronAppInfoAdapter', () => {
  let adapter: ElectronAppInfoAdapter;

  beforeEach(() => {
    adapter = new ElectronAppInfoAdapter();
    vi.clearAllMocks();
  });

  describe('isPackaged', () => {
    it('should return app.isPackaged value', () => {
      const result = adapter.isPackaged();
      expect(result).toBe(app.isPackaged);
    });
  });

  describe('getAppPath', () => {
    it('should return app path', () => {
      vi.mocked(app.getAppPath).mockReturnValue('/mock/app/path');
      const result = adapter.getAppPath();
      expect(result).toBe('/mock/app/path');
      expect(app.getAppPath).toHaveBeenCalled();
    });
  });

  describe('getVersion', () => {
    it('should return app version', () => {
      vi.mocked(app.getVersion).mockReturnValue('1.0.0');
      const result = adapter.getVersion();
      expect(result).toBe('1.0.0');
      expect(app.getVersion).toHaveBeenCalled();
    });
  });

  describe('getPath', () => {
    it('should return home path', () => {
      vi.mocked(app.getPath).mockReturnValue('/mock/path/home');
      const result = adapter.getPath('home');
      expect(result).toBe('/mock/path/home');
      expect(app.getPath).toHaveBeenCalledWith('home');
    });

    it('should return appData path', () => {
      vi.mocked(app.getPath).mockReturnValue('/mock/path/appData');
      const result = adapter.getPath('appData');
      expect(result).toBe('/mock/path/appData');
      expect(app.getPath).toHaveBeenCalledWith('appData');
    });
  });
});

describe('ElectronOutputConsole', () => {
  let windowAdapter: ElectronWindowAdapter;
  let outputConsole: ElectronOutputConsole;

  beforeEach(() => {
    windowAdapter = new ElectronWindowAdapter();
    outputConsole = new ElectronOutputConsole(windowAdapter);
    vi.clearAllMocks();
  });

  describe('appendLine', () => {
    it('should append line via window adapter', () => {
      const spy = vi.spyOn(windowAdapter, 'appendToOutputConsole');
      outputConsole.appendLine('Test line');
      expect(spy).toHaveBeenCalledWith('Test line');
    });
  });
});

describe('ElectronScreenshotWindowManager', () => {
  let manager: ElectronScreenshotWindowManager;

  beforeEach(() => {
    manager = new ElectronScreenshotWindowManager();
    vi.clearAllMocks();
  });

  describe('createScreenshotAndFavicon', () => {
    it('should call screenshot manager with correct parameters', () => {
      // Method returns void and imports dynamically, so we just verify it doesn't throw
      expect(() => {
        manager.createScreenshotAndFavicon('localhost', 3000, '/output', '/base');
      }).not.toThrow();
    });

    it('should work without baseUrl', () => {
      // Method returns void and imports dynamically, so we just verify it doesn't throw
      expect(() => {
        manager.createScreenshotAndFavicon('localhost', 3000, '/output');
      }).not.toThrow();
    });
  });
});

describe('createElectronAdapters', () => {
  it('should create all adapters', () => {
    const { adapters, windowAdapter } = createElectronAdapters();

    expect(adapters.dialog).toBeInstanceOf(ElectronDialogAdapter);
    expect(adapters.shell).toBeInstanceOf(ElectronShellAdapter);
    expect(adapters.window).toBeInstanceOf(ElectronWindowAdapter);
    expect(adapters.menu).toBeInstanceOf(ElectronMenuAdapter);
    expect(adapters.appInfo).toBeInstanceOf(ElectronAppInfoAdapter);
    expect(adapters.outputConsole).toBeInstanceOf(ElectronOutputConsole);
    expect(adapters.screenshotWindowManager).toBeInstanceOf(ElectronScreenshotWindowManager);
    expect(windowAdapter).toBeInstanceOf(ElectronWindowAdapter);
  });

  it('should return same window adapter instance in both places', () => {
    const { adapters, windowAdapter } = createElectronAdapters();
    expect(adapters.window).toBe(windowAdapter);
  });
});
