/**
 * Menu Manager - Manages the application menu
 *
 * NOTE: This is a simplified version for Phase 3. Some features depend on
 * modules not yet migrated (pogozipper, scaffold-model). These are marked
 * with TODO comments and can be enabled once those modules are migrated.
 */

import { Menu, app, shell, dialog, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs-extra';

interface MenuManagerOptions {
  mainWindow: BrowserWindow | null;
  siteSelected: boolean;
  experimentalFeatures: boolean;
  disablePartialCache: boolean;
  hugoServeDraftMode: boolean;
  devDisableAutoHugoServe: boolean;
  applicationRole: string;
}

export class MenuManager {
  private mainWindow: BrowserWindow | null = null;
  private currentMenu: Menu | null = null;
  private options: MenuManagerOptions;

  constructor() {
    this.options = {
      mainWindow: null,
      siteSelected: false,
      experimentalFeatures: false,
      disablePartialCache: false,
      hugoServeDraftMode: false,
      devDisableAutoHugoServe: false,
      applicationRole: 'contentEditor'
    };
  }

  /**
   * Update menu options (called when app state changes)
   */
  updateOptions(options: Partial<MenuManagerOptions>): void {
    this.options = { ...this.options, ...options };
    this.createMainMenu();
  }

  /**
   * Set the main window reference
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
    this.options.mainWindow = window;
  }

  /**
   * Show version dialog
   */
  async showVersion(): Promise<void> {
    const version = app.getVersion();

    // Try to read build info if available
    let buildInfo = '';
    const buildIdPath = path.join(app.getAppPath(), 'resources', 'all', 'build-git-id.txt');
    const buildDatePath = path.join(app.getAppPath(), 'resources', 'all', 'build-date.txt');

    try {
      if (await fs.pathExists(buildIdPath)) {
        const buildId = await fs.readFile(buildIdPath, 'utf8');
        buildInfo += `\nBuild ID: ${buildId.trim()}`;
      }
      if (await fs.pathExists(buildDatePath)) {
        const buildDate = await fs.readFile(buildDatePath, 'utf8');
        buildInfo += `\nBuild Date: ${buildDate.trim()}`;
      }
    } catch (error) {
      console.error('Error reading build info:', error);
    }

    await dialog.showMessageBox({
      type: 'info',
      title: 'About Quiqr Desktop',
      message: `Quiqr Desktop\n\nVersion: ${version}${buildInfo}`,
      buttons: ['Close']
    });
  }

  /**
   * Navigate to preferences page
   */
  showPreferences(): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('redirectToGivenLocation', '/prefs');
    }
  }

  /**
   * Navigate to site library
   */
  showSiteLibrary(): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('redirectToGivenLocation', '/sites/last');
    }
  }

  /**
   * Create the roles selection submenu
   */
  private createRolesSubmenu(): Electron.MenuItemConstructorOptions[] {
    const roles = [
      { key: 'contentEditor', label: 'Content Editor' },
      { key: 'siteDeveloper', label: 'Site Developer' }
    ];

    return roles.map(role => ({
      id: `role-${role.key}`,
      label: role.label,
      type: 'checkbox',
      checked: role.key === this.options.applicationRole,
      click: () => {
        // TODO: Wire up to backend API to change role
        console.log(`Role changed to: ${role.key}`);
        if (this.mainWindow) {
          this.mainWindow.webContents.send('role-changed', role.key);
        }
      }
    }));
  }

  /**
   * Create the experimental features submenu
   */
  private createExperimentalSubmenu(): Electron.MenuItemConstructorOptions[] {
    return [
      {
        label: 'Disable CMS Partials Cache',
        type: 'checkbox',
        checked: this.options.disablePartialCache,
        click: () => {
          // TODO: Wire up to backend API
          console.log('Toggle partial cache');
        }
      },
      {
        id: 'invalidate-cache',
        label: 'Invalidate Sites Cache',
        click: () => {
          // TODO: Wire up to backend API
          console.log('Invalidate cache');
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Import/Export (Coming Soon)',
        enabled: false,
        submenu: [
          { label: 'Import Site', enabled: false },
          { label: 'Export Site', enabled: false }
        ]
      }
    ];
  }

  /**
   * Build the main menu array
   */
  private buildMainMenuTemplate(): Electron.MenuItemConstructorOptions[] {
    const isMac = process.platform === 'darwin';

    const template: Electron.MenuItemConstructorOptions[] = [
      // App menu (macOS only)
      ...(isMac ? [{
        label: app.name,
        submenu: [
          { role: 'about' as const },
          { type: 'separator' as const },
          {
            label: 'Preferences',
            click: () => this.showPreferences()
          },
          {
            label: 'Role',
            submenu: this.createRolesSubmenu()
          },
          { type: 'separator' as const },
          { role: 'services' as const },
          { type: 'separator' as const },
          { role: 'hide' as const },
          { role: 'hideOthers' as const },
          { role: 'unhide' as const },
          { type: 'separator' as const },
          { role: 'quit' as const }
        ]
      }] : []),

      // File menu
      {
        label: 'File',
        submenu: [
          {
            id: 'switch-select-sites-view',
            label: 'Site Library',
            click: () => this.showSiteLibrary()
          },
          { type: 'separator' },
          {
            id: 'new-site',
            label: 'New Quiqr Site',
            click: () => {
              if (this.mainWindow) {
                this.mainWindow.webContents.send('newSiteDialogOpen');
              }
            }
          },
          {
            id: 'import-site',
            label: 'Import Quiqr Site',
            click: () => {
              if (this.mainWindow) {
                this.mainWindow.webContents.send('importSiteDialogOpen');
              }
            }
          },
          { type: 'separator' },
          {
            id: 'close-site',
            label: 'Close Site',
            enabled: this.options.siteSelected,
            click: () => this.showSiteLibrary()
          },
          { type: 'separator' },
          isMac ? { role: 'close' as const } : { role: 'quit' as const }
        ]
      },

      // Edit menu
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' as const },
          { role: 'redo' as const },
          { type: 'separator' as const },
          { role: 'cut' as const },
          { role: 'copy' as const },
          { role: 'paste' as const },
          { type: 'separator' as const },
          {
            label: 'Preferences',
            click: () => this.showPreferences()
          },
          {
            label: 'Role',
            submenu: this.createRolesSubmenu()
          },
          { type: 'separator' as const },
          {
            label: 'Enable Experimental',
            type: 'checkbox',
            checked: this.options.experimentalFeatures,
            click: () => {
              // TODO: Wire up to backend API
              console.log('Toggle experimental features');
            }
          },
          ...(this.options.experimentalFeatures ? [{
            label: 'Experimental',
            submenu: this.createExperimentalSubmenu()
          }] : [])
        ]
      },

      // View menu
      {
        label: 'View',
        submenu: [
          { role: 'togglefullscreen' as const },
          { role: 'reload' as const },
          { role: 'toggleDevTools' as const }
        ]
      },

      // Window menu
      {
        label: 'Window',
        submenu: [
          { role: 'minimize' as const },
          { role: 'zoom' as const },
          ...(isMac ? [
            { type: 'separator' as const },
            { role: 'front' as const },
            { type: 'separator' as const },
            { role: 'window' as const }
          ] : [])
        ]
      },

      // Hugo menu
      {
        label: 'Hugo',
        submenu: [
          {
            id: 'restart-server',
            label: 'Restart Server',
            enabled: this.options.siteSelected,
            click: () => {
              // TODO: Wire up to backend API to restart Hugo server
              console.log('Restart Hugo server');
            }
          },
          { type: 'separator' },
          {
            label: 'Server Draft Mode',
            type: 'checkbox',
            checked: this.options.hugoServeDraftMode,
            click: () => {
              // TODO: Wire up to backend API
              console.log('Toggle draft mode');
            }
          },
          {
            label: 'Disable Auto Serve',
            type: 'checkbox',
            checked: this.options.devDisableAutoHugoServe,
            click: () => {
              // TODO: Wire up to backend API
              console.log('Toggle auto serve');
            }
          }
        ]
      },

      // Help menu
      {
        role: 'help',
        submenu: [
          {
            label: 'Show Welcome Screen',
            click: () => {
              if (this.mainWindow) {
                this.mainWindow.webContents.send('openSplashDialog');
              }
            }
          },
          {
            label: 'Getting Started',
            click: () => shell.openExternal('https://book.quiqr.org/docs/10-getting-started/')
          },
          {
            label: 'Quiqr Book',
            click: () => shell.openExternal('https://book.quiqr.org')
          },
          { type: 'separator' },
          {
            label: 'Troubleshooting',
            submenu: [
              {
                label: 'Report Issue',
                click: () => shell.openExternal('https://github.com/quiqr/quiqr-desktop/issues/new')
              }
            ]
          },
          { type: 'separator' },
          {
            label: 'Quiqr Version',
            click: () => this.showVersion()
          },
          {
            label: 'Release Notes',
            click: () => shell.openExternal('https://book.quiqr.org/docs/80-release-notes/01-quiqr-desktop/')
          }
        ]
      }
    ];

    return template;
  }

  /**
   * Create and set the main application menu
   */
  createMainMenu(): void {
    const template = this.buildMainMenuTemplate();
    this.currentMenu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(this.currentMenu);
  }

  /**
   * Enable/disable a menu item by ID
   */
  setMenuItemEnabled(itemId: string, enabled: boolean): void {
    if (!this.currentMenu) return;

    const menuItem = this.currentMenu.getMenuItemById(itemId);
    if (menuItem) {
      menuItem.enabled = enabled;
    }
  }
}

// Export a singleton instance
export const menuManager = new MenuManager();
