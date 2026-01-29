/**
 * Web Window Adapter
 *
 * Provides minimal window management for standalone mode.
 * Most window operations are no-ops in browser environment.
 */

import type { WindowAdapter } from '@quiqr/backend';

export class WebWindowAdapter implements WindowAdapter {
  /**
   * Reload the main application window
   * In web mode, this would require server-sent events or similar
   * For now, just log the request
   */
  reloadMainWindow(): void {
    console.log('[RELOAD] Main window reload requested');
    // Future: Could send SSE event to trigger frontend reload
  }

  /**
   * Send data to the renderer process
   * In web mode, this would use SSE or WebSocket
   * For now, just log the message
   */
  sendToRenderer(channel: string, data: string | object): void {
    console.log('[TO_RENDERER]', channel, data);
    // Future: Could push via SSE/WebSocket to frontend
  }

  /**
   * Close the current site and redirect to site library
   */
  async openSiteLibrary(): Promise<void> {
    console.log('[NAVIGATE] Opening site library');
    // Future: Could send navigation event to frontend
  }

  /**
   * Show or hide the menu bar
   * No-op in web mode (menu bar is always visible or controlled by frontend)
   */
  setMenuBarVisibility(visible: boolean): void {
    console.log('[MENU_BAR_VISIBILITY]', visible);
    // No-op in web mode
  }

  /**
   * Append a line to the output console/log window
   */
  appendToOutputConsole(line: string): void {
    console.log('[OUTPUT]', line);
    // Future: Could push via SSE/WebSocket to frontend console
  }
}
