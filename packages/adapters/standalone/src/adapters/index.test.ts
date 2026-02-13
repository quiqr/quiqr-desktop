/**
 * Tests for Standalone Web Adapters
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebMenuAdapter } from './menu-adapter';
import { WebWindowAdapter } from './window-adapter';
import { WebAppInfoAdapter } from './app-info-adapter';
import { WebShellAdapter } from './shell-adapter';
import { createWebAdapters } from './index';
import type { AppContainer } from '@quiqr/backend';

describe('WebMenuAdapter', () => {
  let adapter: WebMenuAdapter;
  let mockContainer: AppContainer;

  beforeEach(() => {
    adapter = new WebMenuAdapter();
    mockContainer = {
      config: {
        prefs: {
          applicationRole: 'contentEditor',
        },
        experimentalFeatures: false,
        disablePartialCache: false,
        hugoServeDraftMode: false,
        devDisableAutoHugoServe: false,
      },
      state: {
        currentSiteKey: 'test-site',
      },
    } as any;
  });

  describe('initialization', () => {
    it('should start with empty menu state', () => {
      const state = adapter.getMenuState();
      expect(state.menus).toEqual([]);
      expect(state.version).toBe(0);
    });
  });

  describe('setContainer', () => {
    it('should set container and build menu state', () => {
      adapter.setContainer(mockContainer);
      const state = adapter.getMenuState();
      expect(state.menus.length).toBeGreaterThan(0);
      expect(state.version).toBeGreaterThan(0);
    });

    it('should create File menu with proper items', () => {
      adapter.setContainer(mockContainer);
      const state = adapter.getMenuState();
      const fileMenu = state.menus.find(m => m.id === 'file');

      expect(fileMenu).toBeDefined();
      expect(fileMenu?.label).toBe('File');
      expect(fileMenu?.items.some(i => i.id === 'site-library')).toBe(true);
      expect(fileMenu?.items.some(i => i.id === 'close-site')).toBe(true);
    });

    it('should create Edit menu with role submenu', () => {
      adapter.setContainer(mockContainer);
      const state = adapter.getMenuState();
      const editMenu = state.menus.find(m => m.id === 'edit');

      expect(editMenu).toBeDefined();
      const roleSubmenu = editMenu?.items.find(i => i.id === 'role');
      expect(roleSubmenu?.type).toBe('submenu');
    });

    it('should create Hugo menu', () => {
      adapter.setContainer(mockContainer);
      const state = adapter.getMenuState();
      const hugoMenu = state.menus.find(m => m.id === 'hugo');

      expect(hugoMenu).toBeDefined();
      expect(hugoMenu?.items.some(i => i.id === 'restart-server')).toBe(true);
    });

    it('should create Help menu', () => {
      adapter.setContainer(mockContainer);
      const state = adapter.getMenuState();
      const helpMenu = state.menus.find(m => m.id === 'help');

      expect(helpMenu).toBeDefined();
      expect(helpMenu?.items.some(i => i.id === 'getting-started')).toBe(true);
    });
  });

  describe('menu state based on site selection', () => {
    it('should enable site-specific items when site is selected', () => {
      mockContainer.state.currentSiteKey = 'test-site';
      adapter.setContainer(mockContainer);
      const state = adapter.getMenuState();

      const fileMenu = state.menus.find(m => m.id === 'file');
      const closeSite = fileMenu?.items.find(i => i.id === 'close-site');
      expect(closeSite?.enabled).toBe(true);
    });

    it('should disable site-specific items when no site is selected', () => {
      mockContainer.state.currentSiteKey = undefined;
      adapter.setContainer(mockContainer);
      const state = adapter.getMenuState();

      const fileMenu = state.menus.find(m => m.id === 'file');
      const closeSite = fileMenu?.items.find(i => i.id === 'close-site');
      expect(closeSite?.enabled).toBe(false);
    });
  });

  describe('experimental features menu', () => {
    it('should not show experimental submenu when disabled', () => {
      const containerNoExp = {
        ...mockContainer,
        config: {
          ...mockContainer.config,
          experimentalFeatures: false,
        },
      };
      adapter.setContainer(containerNoExp as any);
      const state = adapter.getMenuState();

      const editMenu = state.menus.find(m => m.id === 'edit');
      const expSubmenu = editMenu?.items.find(i => i.id === 'experimental-submenu');
      expect(expSubmenu).toBeUndefined();
    });

    it('should show experimental submenu when enabled', () => {
      const containerWithExp = {
        ...mockContainer,
        config: {
          ...mockContainer.config,
          experimentalFeatures: true,
        },
      };
      adapter.setContainer(containerWithExp as any);
      const state = adapter.getMenuState();

      const editMenu = state.menus.find(m => m.id === 'edit');
      const expSubmenu = editMenu?.items.find(i => i.id === 'experimental-submenu');
      expect(expSubmenu).toBeDefined();
      expect(expSubmenu?.type).toBe('submenu');
    });
  });

  describe('role checkbox state', () => {
    it('should check Content Editor when role is contentEditor', () => {
      mockContainer.config.prefs.applicationRole = 'contentEditor';
      adapter.setContainer(mockContainer);
      const state = adapter.getMenuState();

      const editMenu = state.menus.find(m => m.id === 'edit');
      const roleSubmenu = editMenu?.items.find(i => i.id === 'role');
      const contentEditor = roleSubmenu?.submenu?.find(i => i.id === 'role-content-editor');

      expect(contentEditor?.checked).toBe(true);
    });

    it('should check Site Developer when role is siteDeveloper', () => {
      mockContainer.config.prefs.applicationRole = 'siteDeveloper';
      adapter.setContainer(mockContainer);
      const state = adapter.getMenuState();

      const editMenu = state.menus.find(m => m.id === 'edit');
      const roleSubmenu = editMenu?.items.find(i => i.id === 'role');
      const siteDeveloper = roleSubmenu?.submenu?.find(i => i.id === 'role-site-developer');

      expect(siteDeveloper?.checked).toBe(true);
    });
  });

  describe('setMenuItemEnabled', () => {
    beforeEach(() => {
      adapter.setContainer(mockContainer);
    });

    it('should enable a menu item', () => {
      adapter.setMenuItemEnabled('site-library', true);
      const state = adapter.getMenuState();

      const fileMenu = state.menus.find(m => m.id === 'file');
      const item = fileMenu?.items.find(i => i.id === 'site-library');
      expect(item?.enabled).toBe(true);
    });

    it('should disable a menu item', () => {
      adapter.setMenuItemEnabled('site-library', false);
      const state = adapter.getMenuState();

      const fileMenu = state.menus.find(m => m.id === 'file');
      const item = fileMenu?.items.find(i => i.id === 'site-library');
      expect(item?.enabled).toBe(false);
    });

    it('should update menu version when item changes', async () => {
      adapter.setContainer(mockContainer);
      const initialVersion = adapter.getMenuState().version;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      adapter.setMenuItemEnabled('site-library', false);
      const newVersion = adapter.getMenuState().version;

      expect(newVersion).toBeGreaterThan(initialVersion);
    });

    it('should find items in submenus', () => {
      adapter.setMenuItemEnabled('role-content-editor', false);
      const state = adapter.getMenuState();

      const editMenu = state.menus.find(m => m.id === 'edit');
      const roleSubmenu = editMenu?.items.find(i => i.id === 'role');
      const contentEditor = roleSubmenu?.submenu?.find(i => i.id === 'role-content-editor');

      expect(contentEditor?.enabled).toBe(false);
    });

    it('should handle non-existent menu item gracefully', () => {
      expect(() => {
        adapter.setMenuItemEnabled('non-existent', true);
      }).not.toThrow();
    });
  });

  describe('createMainMenu', () => {
    it('should rebuild menu state', async () => {
      adapter.setContainer(mockContainer);
      const initialVersion = adapter.getMenuState().version;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      adapter.createMainMenu();
      const newVersion = adapter.getMenuState().version;

      expect(newVersion).toBeGreaterThan(initialVersion);
    });

    it('should create empty menu when no container is set', () => {
      adapter.createMainMenu();
      const state = adapter.getMenuState();

      expect(state.menus).toEqual([]);
      expect(state.version).toBe(0);
    });
  });
});

describe('WebWindowAdapter', () => {
  let adapter: WebWindowAdapter;
  let consoleSpy: any;

  beforeEach(() => {
    adapter = new WebWindowAdapter();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('reloadMainWindow', () => {
    it('should log reload request', () => {
      adapter.reloadMainWindow();
      expect(consoleSpy).toHaveBeenCalledWith('[RELOAD] Main window reload requested');
    });
  });

  describe('sendToRenderer', () => {
    it('should log message to renderer with object data', () => {
      const data = { foo: 'bar' };
      adapter.sendToRenderer('test-channel', data);
      expect(consoleSpy).toHaveBeenCalledWith('[TO_RENDERER]', 'test-channel', data);
    });

    it('should log message to renderer with string data', () => {
      adapter.sendToRenderer('test-channel', 'test-data');
      expect(consoleSpy).toHaveBeenCalledWith('[TO_RENDERER]', 'test-channel', 'test-data');
    });
  });

  describe('openSiteLibrary', () => {
    it('should log navigation request', async () => {
      await adapter.openSiteLibrary();
      expect(consoleSpy).toHaveBeenCalledWith('[NAVIGATE] Opening site library');
    });
  });

  describe('setMenuBarVisibility', () => {
    it('should log visibility change', () => {
      adapter.setMenuBarVisibility(true);
      expect(consoleSpy).toHaveBeenCalledWith('[MENU_BAR_VISIBILITY]', true);
    });

    it('should log false visibility', () => {
      adapter.setMenuBarVisibility(false);
      expect(consoleSpy).toHaveBeenCalledWith('[MENU_BAR_VISIBILITY]', false);
    });
  });

  describe('appendToOutputConsole', () => {
    it('should log output line', () => {
      adapter.appendToOutputConsole('Test output');
      expect(consoleSpy).toHaveBeenCalledWith('[OUTPUT]', 'Test output');
    });
  });
});

describe('WebAppInfoAdapter', () => {
  let adapter: WebAppInfoAdapter;

  beforeEach(() => {
    adapter = new WebAppInfoAdapter('/test/app/path');
  });

  describe('isPackaged', () => {
    it('should return true for standalone mode', () => {
      expect(adapter.isPackaged()).toBe(true);
    });
  });

  describe('getAppPath', () => {
    it('should return the app path', () => {
      expect(adapter.getAppPath()).toBe('/test/app/path');
    });

    it('should use process.cwd() when no path provided', () => {
      const adapterNoPeath = new WebAppInfoAdapter();
      expect(adapter.getAppPath()).toBeDefined();
    });
  });

  describe('getVersion', () => {
    it('should return version from package.json', () => {
      const version = adapter.getVersion();
      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
    });
  });

  describe('getPath', () => {
    it('should return home path', () => {
      const home = adapter.getPath('home');
      expect(home).toBeDefined();
      expect(typeof home).toBe('string');
    });

    it('should return appData path', () => {
      const appData = adapter.getPath('appData');
      expect(appData).toBeDefined();
      expect(typeof appData).toBe('string');
    });

    it('should return userData path', () => {
      const userData = adapter.getPath('userData');
      expect(userData).toContain('quiqr-desktop');
    });

    it('should return temp path', () => {
      const temp = adapter.getPath('temp');
      expect(temp).toBeDefined();
    });

    it('should return downloads path', () => {
      const downloads = adapter.getPath('downloads');
      expect(downloads).toContain('Downloads');
    });

    it('should handle platform-specific appData paths on Windows', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });

      const winAdapter = new WebAppInfoAdapter('/test');
      const appData = winAdapter.getPath('appData');
      expect(appData).toBeDefined();

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should handle platform-specific appData paths on macOS', () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin' });

      const macAdapter = new WebAppInfoAdapter('/test');
      const appData = macAdapter.getPath('appData');
      expect(appData).toContain('Library');

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });
});

describe('WebShellAdapter', () => {
  let adapter: WebShellAdapter;

  beforeEach(() => {
    adapter = new WebShellAdapter();
  });

  describe('openExternal', () => {
    it('should throw error for openExternal', async () => {
      await expect(adapter.openExternal('https://example.com')).rejects.toThrow(
        'openExternal not supported in web mode'
      );
    });
  });

  describe('showItemInFolder', () => {
    it('should log show item request', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      adapter.showItemInFolder('/path/to/file');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WebShellAdapter] showItemInFolder not supported in web mode:',
        '/path/to/file'
      );
      consoleWarnSpy.mockRestore();
    });
  });

  describe('openPath', () => {
    it('should log path opening and return empty string', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = await adapter.openPath('/path/to/open');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WebShellAdapter] openPath not supported in web mode:',
        '/path/to/open'
      );
      expect(result).toBe('');
      consoleWarnSpy.mockRestore();
    });
  });
});

describe('createWebAdapters', () => {
  it('should create all web adapters', () => {
    const mockContainer = {
      config: {
        prefs: { applicationRole: 'contentEditor' },
        experimentalFeatures: false,
        disablePartialCache: false,
        hugoServeDraftMode: false,
        devDisableAutoHugoServe: false,
      },
      state: {
        currentSiteKey: null
      }
    } as unknown as AppContainer;

    const adapters = createWebAdapters(mockContainer, '/test/root');

    expect(adapters.dialog).toBeDefined();
    expect(adapters.shell).toBeInstanceOf(WebShellAdapter);
    expect(adapters.window).toBeInstanceOf(WebWindowAdapter);
    expect(adapters.menu).toBeInstanceOf(WebMenuAdapter);
    expect(adapters.appInfo).toBeInstanceOf(WebAppInfoAdapter);
    expect(adapters.outputConsole).toBeDefined();
  });

  it('should set container on menu adapter', () => {
    const mockContainer = {
      config: {
        prefs: { applicationRole: 'contentEditor' },
        experimentalFeatures: false,
        disablePartialCache: false,
        hugoServeDraftMode: false,
        devDisableAutoHugoServe: false,
      },
      state: {
        currentSiteKey: null
      }
    } as unknown as AppContainer;

    const adapters = createWebAdapters(mockContainer, '/test/root');
    const menuAdapter = adapters.menu as WebMenuAdapter;
    const menuState = menuAdapter.getMenuState();

    expect(menuState.menus).toBeDefined();
    expect(menuState.menus.length).toBeGreaterThan(0);
  });

  it('should pass rootPath to AppInfoAdapter', () => {
    const mockContainer = {
      config: {
        prefs: { applicationRole: 'contentEditor' },
        experimentalFeatures: false,
        disablePartialCache: false,
        hugoServeDraftMode: false,
        devDisableAutoHugoServe: false,
      },
      state: {
        currentSiteKey: null
      }
    } as unknown as AppContainer;

    const adapters = createWebAdapters(mockContainer, '/custom/root');

    expect(adapters.appInfo.getAppPath()).toBe('/custom/root');
  });
});
