/**
 * Web Shell Adapter
 *
 * Provides shell operations for standalone mode.
 * Since we're running in a browser, many shell operations aren't possible.
 * For openExternal, we throw an error so the frontend can handle it with window.open().
 */

import type { ShellAdapter } from '@quiqr/backend';

export class WebShellAdapter implements ShellAdapter {
  /**
   * Open a URL in the system's default browser
   * In web mode, this throws an error so the frontend can use window.open() fallback
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async openExternal(url: string): Promise<void> {
    throw new Error('openExternal not supported in web mode - use frontend window.open() fallback');
  }

  /**
   * Show a file in its containing folder
   * Not possible in web mode
   */
  showItemInFolder(fullPath: string): void {
    console.warn('[WebShellAdapter] showItemInFolder not supported in web mode:', fullPath);
  }

  /**
   * Open a file or folder in the system's default application
   * Not possible in web mode
   */
  async openPath(path: string): Promise<string> {
    console.warn('[WebShellAdapter] openPath not supported in web mode:', path);
    return '';
  }
}
