/**
 * Web Menu Adapter
 *
 * Provides browser-based menu functionality for standalone mode.
 * Maintains menu state in memory and exposes it via API endpoints.
 */

import type { MenuAdapter, AppContainer } from '@quiqr/backend';
import type {
  WebMenuState,
  WebMenuDefinition,
  WebMenuItemDefinition
} from '@quiqr/types';

// Re-export types for convenience
export type MenuState = WebMenuState;
export type MenuDefinition = WebMenuDefinition;
export type MenuItemDefinition = WebMenuItemDefinition;

export class WebMenuAdapter implements MenuAdapter {
  private menuState: MenuState;
  private container: AppContainer | null = null;

  constructor() {
    this.menuState = { menus: [], version: 0 };
  }

  /**
   * Set the container reference (called during initialization)
   */
  setContainer(container: AppContainer): void {
    this.container = container;
    this.buildMenuState();
  }

  /**
   * Create/recreate the main application menu
   */
  createMainMenu(): void {
    this.buildMenuState();
  }

  /**
   * Enable or disable a menu item by ID
   */
  setMenuItemEnabled(itemId: string, enabled: boolean): void {
    // Find and update the menu item in the state
    for (const menu of this.menuState.menus) {
      const item = this.findMenuItem(menu.items, itemId);
      if (item) {
        item.enabled = enabled;
        this.menuState.version = Date.now();
        return;
      }
    }
  }

  /**
   * Get current menu state (for API endpoint)
   */
  getMenuState(): MenuState {
    return this.menuState;
  }

  /**
   * Build menu state from container config
   */
  private buildMenuState(): void {
    if (!this.container) {
      this.menuState = { menus: [], version: 0 };
      return;
    }

    const config = this.container.config;
    const state = this.container.state;
    const siteSelected = !!state.currentSiteKey;

    this.menuState = {
      version: Date.now(),
      menus: [
        // File menu
        {
          id: 'file',
          label: 'File',
          items: [
            {
              id: 'site-library',
              type: 'normal',
              label: 'Site Library',
              enabled: true,
              action: 'showSiteLibrary',
            },
            { id: 'sep-1', type: 'separator' },
            {
              id: 'new-site',
              type: 'normal',
              label: 'New Quiqr Site',
              enabled: true,
              action: 'newSite',
            },
            {
              id: 'import-site',
              type: 'normal',
              label: 'Import Quiqr Site',
              enabled: true,
              action: 'importSite',
            },
            { id: 'sep-2', type: 'separator' },
            {
              id: 'close-site',
              type: 'normal',
              label: 'Close Site',
              enabled: siteSelected,
              action: 'closeSite',
            },
          ],
        },

        // Edit menu
        {
          id: 'edit',
          label: 'Edit',
          items: [
            {
              id: 'preferences',
              type: 'normal',
              label: 'Preferences',
              enabled: true,
              action: 'showPreferences',
            },
            {
              id: 'role',
              type: 'submenu',
              label: 'Role',
              enabled: true,
              submenu: [
                {
                  id: 'role-content-editor',
                  type: 'checkbox',
                  label: 'Content Editor',
                  checked: config.prefs.applicationRole === 'contentEditor',
                  enabled: true,
                  action: 'setRole:contentEditor',
                },
                {
                  id: 'role-site-developer',
                  type: 'checkbox',
                  label: 'Site Developer',
                  checked: config.prefs.applicationRole === 'siteDeveloper',
                  enabled: true,
                  action: 'setRole:siteDeveloper',
                },
              ],
            },
            { id: 'sep-1', type: 'separator' },
            {
              id: 'experimental',
              type: 'checkbox',
              label: 'Enable Experimental',
              checked: config.experimentalFeatures,
              enabled: true,
              action: 'toggleExperimental',
            },
          ],
        },

        // Hugo menu
        {
          id: 'hugo',
          label: 'Hugo',
          items: [
            {
              id: 'restart-server',
              type: 'normal',
              label: 'Restart Server',
              enabled: siteSelected,
              action: 'restartServer',
            },
            { id: 'sep-1', type: 'separator' },
            {
              id: 'draft-mode',
              type: 'checkbox',
              label: 'Server Draft Mode',
              checked: config.hugoServeDraftMode,
              enabled: true,
              action: 'toggleDraftMode',
            },
            {
              id: 'auto-serve',
              type: 'checkbox',
              label: 'Disable Auto Serve',
              checked: config.devDisableAutoHugoServe,
              enabled: true,
              action: 'toggleAutoServe',
            },
          ],
        },

        // Help menu
        {
          id: 'help',
          label: 'Help',
          items: [
            {
              id: 'welcome',
              type: 'normal',
              label: 'Show Welcome Screen',
              enabled: true,
              action: 'showWelcome',
            },
            {
              id: 'getting-started',
              type: 'normal',
              label: 'Getting Started',
              enabled: true,
              action: 'openExternal:https://book.quiqr.org/docs/10-getting-started/',
            },
            {
              id: 'quiqr-book',
              type: 'normal',
              label: 'Quiqr Book',
              enabled: true,
              action: 'openExternal:https://book.quiqr.org',
            },
            { id: 'sep-1', type: 'separator' },
            {
              id: 'version',
              type: 'normal',
              label: 'Quiqr Version',
              enabled: true,
              action: 'showVersion',
            },
            {
              id: 'release-notes',
              type: 'normal',
              label: 'Release Notes',
              enabled: true,
              action: 'openExternal:https://book.quiqr.org/docs/80-release-notes/01-quiqr-desktop/',
            },
          ],
        },
      ],
    };
  }

  /**
   * Find a menu item by ID (recursive for submenus)
   */
  private findMenuItem(items: MenuItemDefinition[], itemId: string): MenuItemDefinition | null {
    for (const item of items) {
      if (item.id === itemId) {
        return item;
      }
      if (item.submenu) {
        const found = this.findMenuItem(item.submenu, itemId);
        if (found) return found;
      }
    }
    return null;
  }
}
