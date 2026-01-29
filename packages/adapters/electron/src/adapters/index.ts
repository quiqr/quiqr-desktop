/**
 * Electron Platform Adapters - Real implementations
 */

import { app, dialog, shell, BrowserWindow } from 'electron';
import type {
  DialogAdapter,
  ShellAdapter,
  WindowAdapter,
  MenuAdapter,
  AppInfoAdapter,
  OutputConsole,
  ScreenshotWindowManager,
  PlatformAdapters,
  OpenDialogOptions,
  SaveDialogOptions,
  MessageBoxOptions
} from '@quiqr/backend/adapters';

// ============================================================================
// Dialog Adapter - Real Electron dialogs
// ============================================================================

export class ElectronDialogAdapter implements DialogAdapter {
  async showOpenDialog(options: OpenDialogOptions): Promise<string[]> {
    const result = await dialog.showOpenDialog(options);
    return result.canceled ? [] : result.filePaths;
  }

  async showSaveDialog(options: SaveDialogOptions): Promise<string | undefined> {
    const result = await dialog.showSaveDialog(options);
    return result.canceled ? undefined : result.filePath;
  }

  async showMessageBox(options: MessageBoxOptions): Promise<number> {
    const result = await dialog.showMessageBox(options);
    return result.response;
  }
}

// ============================================================================
// Shell Adapter - Real Electron shell operations
// ============================================================================

export class ElectronShellAdapter implements ShellAdapter {
  async openExternal(url: string): Promise<void> {
    await shell.openExternal(url);
  }

  showItemInFolder(fullPath: string): void {
    shell.showItemInFolder(fullPath);
  }

  async openPath(path: string): Promise<string> {
    return await shell.openPath(path);
  }
}

// ============================================================================
// Window Adapter - Real Electron window management
// ============================================================================

export class ElectronWindowAdapter implements WindowAdapter {
  private mainWindow: BrowserWindow | null = null;

  setMainWindow(window: BrowserWindow | null) {
    this.mainWindow = window;
  }

  reloadMainWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.reload();
    }
  }

  sendToRenderer(channel: string, data: string | object): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  async openSiteLibrary(): Promise<void> {
    // Import dynamically to avoid circular dependency
    const { closeSiteAndShowSelectSites } = await import('../ui-managers/main-window-manager.js');
    await closeSiteAndShowSelectSites();
  }

  setMenuBarVisibility(visible: boolean): void {
    if (this.mainWindow) {
      this.mainWindow.setMenuBarVisibility(visible);
    }
  }

  appendToOutputConsole(line: string): void {
    // Output console deprecated - just log to console
    console.log('[HUGO OUTPUT]', line);
  }
}

// ============================================================================
// Menu Adapter - Uses MenuManager for menu operations
// ============================================================================

export class ElectronMenuAdapter implements MenuAdapter {
  setMenuItemEnabled(itemId: string, enabled: boolean): void {
    // Import dynamically to avoid circular dependency
    import('../ui-managers/menu-manager.js').then(({ menuManager }) => {
      menuManager.setMenuItemEnabled(itemId, enabled);
    });
  }

  createMainMenu(): void {
    // Import dynamically to avoid circular dependency
    import('../ui-managers/menu-manager.js').then(({ menuManager }) => {
      menuManager.createMainMenu();
    });
  }
}

// ============================================================================
// AppInfo Adapter - Real Electron app info
// ============================================================================

export class ElectronAppInfoAdapter implements AppInfoAdapter {
  isPackaged(): boolean {
    return app.isPackaged;
  }

  getAppPath(): string {
    return app.getAppPath();
  }

  getVersion(): string {
    return app.getVersion();
  }

  getPath(name: 'home' | 'appData' | 'userData' | 'temp' | 'downloads'): string {
    return app.getPath(name);
  }
}

// ============================================================================
// Output Console - For Hugo server output
// ============================================================================

export class ElectronOutputConsole implements OutputConsole {
  constructor(private windowAdapter: ElectronWindowAdapter) {}

  appendLine(line: string): void {
    // Send to log window via window adapter
    this.windowAdapter.appendToOutputConsole(line);
  }
}

// ============================================================================
// Screenshot Window Manager - Real implementation
// ============================================================================

export class ElectronScreenshotWindowManager implements ScreenshotWindowManager {
  createScreenshotAndFavicon(host: string, port: number, outputDir: string, baseUrl?: string): void {
    // Import dynamically to avoid circular dependency
    import('../ui-managers/screenshot-window-manager.js').then(({ createScreenshotAndFavicon }) => {
      createScreenshotAndFavicon(host, port, outputDir, baseUrl);
    });
  }
}

// ============================================================================
// Factory function to create all adapters
// ============================================================================

export function createElectronAdapters(): { adapters: PlatformAdapters; windowAdapter: ElectronWindowAdapter } {
  const windowAdapter = new ElectronWindowAdapter();

  return {
    adapters: {
      dialog: new ElectronDialogAdapter(),
      shell: new ElectronShellAdapter(),
      window: windowAdapter,
      menu: new ElectronMenuAdapter(),
      appInfo: new ElectronAppInfoAdapter(),
      outputConsole: new ElectronOutputConsole(windowAdapter),
      screenshotWindowManager: new ElectronScreenshotWindowManager()
    },
    windowAdapter
  };
}
