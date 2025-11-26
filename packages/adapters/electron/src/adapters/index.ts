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
    const result = await dialog.showOpenDialog(options as any);
    return result.canceled ? [] : result.filePaths;
  }

  async showSaveDialog(options: SaveDialogOptions): Promise<string | undefined> {
    const result = await dialog.showSaveDialog(options as any);
    return result.canceled ? undefined : result.filePath;
  }

  async showMessageBox(options: MessageBoxOptions): Promise<number> {
    const result = await dialog.showMessageBox(options as any);
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

  showLogWindow(content: string): void {
    // TODO: Implement log window
    console.log('[LOG WINDOW]', content);
  }

  reloadMainWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.reload();
    }
  }

  sendToRenderer(channel: string, data: any): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send(channel, data);
    }
  }
}

// ============================================================================
// Menu Adapter - Minimal stub for now
// ============================================================================

export class ElectronMenuAdapter implements MenuAdapter {
  setMenuItemEnabled(itemId: string, enabled: boolean): void {
    console.log('[STUB] setMenuItemEnabled', itemId, enabled);
  }

  createMainMenu(): void {
    console.log('[STUB] createMainMenu');
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
  appendLine(line: string): void {
    console.log('[HUGO OUTPUT]', line);
  }
}

// ============================================================================
// Screenshot Window Manager - Stub for now
// ============================================================================

export class ElectronScreenshotWindowManager implements ScreenshotWindowManager {
  createScreenshotAndFavicon(host: string, port: number, outputDir: string): void {
    console.log('[STUB] createScreenshotAndFavicon', host, port, outputDir);
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
      outputConsole: new ElectronOutputConsole(),
      screenshotWindowManager: new ElectronScreenshotWindowManager()
    },
    windowAdapter
  };
}
