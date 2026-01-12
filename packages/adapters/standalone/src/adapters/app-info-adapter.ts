/**
 * Web App Info Adapter
 *
 * Provides application information for standalone mode.
 * Reads version from package.json and provides proper paths.
 */

import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import type { AppInfoAdapter } from '@quiqr/backend';

export class WebAppInfoAdapter implements AppInfoAdapter {
  private version: string = '0.0.0-dev';
  private appPath: string;

  constructor(rootPath?: string) {
    // Use provided rootPath or fall back to process.cwd()
    this.appPath = rootPath || process.cwd();

    // Try to read version from package.json
    this.loadVersion();
  }

  /**
   * Load version from package.json
   */
  private loadVersion(): void {
    try {
      // Read version from root package.json
      const packageJsonPath = path.join(this.appPath, 'package.json');
      if (existsSync(packageJsonPath)) {
        const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonContent);
        this.version = packageJson.version || '0.0.0-dev';
        console.log(`[WebAppInfoAdapter] Loaded version ${this.version} from ${packageJsonPath}`);
      } else {
        console.warn(`[WebAppInfoAdapter] package.json not found at ${packageJsonPath}`);
      }
    } catch (error) {
      console.warn('[WebAppInfoAdapter] Could not read package.json version:', error);
    }
  }

  /**
   * Check if the application is packaged
   * In standalone mode, we're always "packaged" (running as a server)
   */
  isPackaged(): boolean {
    return true;
  }

  /**
   * Get the application's installation path
   */
  getAppPath(): string {
    return this.appPath;
  }

  /**
   * Get the application version
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Get a special directory path
   */
  getPath(name: 'home' | 'appData' | 'userData' | 'temp' | 'downloads'): string {
    switch (name) {
      case 'home':
        return process.env.HOME || process.env.USERPROFILE || '/tmp';
      case 'appData':
        // On Linux: ~/.config, on macOS: ~/Library/Application Support, on Windows: %APPDATA%
        if (process.platform === 'win32') {
          return process.env.APPDATA || path.join(this.getPath('home'), 'AppData', 'Roaming');
        } else if (process.platform === 'darwin') {
          return path.join(this.getPath('home'), 'Library', 'Application Support');
        } else {
          return path.join(this.getPath('home'), '.config');
        }
      case 'userData':
        // User data directory for the app
        return path.join(this.getPath('appData'), 'quiqr-desktop');
      case 'temp':
        return process.env.TMPDIR || process.env.TEMP || '/tmp';
      case 'downloads':
        return path.join(this.getPath('home'), 'Downloads');
      default:
        return this.appPath;
    }
  }
}
