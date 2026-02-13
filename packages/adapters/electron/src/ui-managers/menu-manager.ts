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
import type { AppContainer } from '@quiqr/backend';

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
  private container: AppContainer | null = null;

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
   * Set the container reference (called during initialization)
   */
  setContainer(container: AppContainer): void {
    this.container = container;
    this.updateOptionsFromConfig();
  }

  /**
   * Update menu options from container config
   */
  private updateOptionsFromConfig(): void {
    if (!this.container) return;

    const config = this.container.config;
    const state = this.container.state;

    this.options = {
      ...this.options,
      siteSelected: !!state.currentSiteKey,
      experimentalFeatures: config.experimentalFeatures,
      disablePartialCache: config.disablePartialCache,
      hugoServeDraftMode: config.hugoServeDraftMode,
      devDisableAutoHugoServe: config.devDisableAutoHugoServe,
      applicationRole: config.prefs.applicationRole || 'contentEditor'
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
      click: async () => {
        if (!this.container) return;

        try {
          // Update role via container config
          this.container.config.setPrefKey('applicationRole', role.key);
          await this.container.config.save();

          // Update menu options and rebuild
          this.updateOptionsFromConfig();
          this.createMainMenu();

          // Notify frontend
          if (this.mainWindow) {
            this.mainWindow.webContents.send('role-changed', role.key);
          }
        } catch (error) {
          console.error('Failed to change role:', error);
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
        click: async () => {
          if (!this.container) return;

          try {
            const newValue = !this.options.disablePartialCache;
            this.container.config.setDisablePartialCache(newValue);
            await this.container.config.save();

            this.updateOptionsFromConfig();
            this.createMainMenu();
          } catch (error) {
            console.error('Failed to toggle partial cache:', error);
          }
        }
      },
      {
        id: 'invalidate-cache',
        label: 'Invalidate Sites Cache',
        click: async () => {
          if (!this.container) return;

          try {
            this.container.configurationProvider.invalidateCache();
            console.log('Cache invalidated successfully');
          } catch (error) {
            console.error('Failed to invalidate cache:', error);
          }
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
          {
            id: 'scaffold-model',
            label: 'Scaffold Model',
            enabled: this.options.siteSelected,
            submenu: [
              {
                id: 'scaffold-single',
                label: 'Scaffold Single from File...',
                enabled: this.options.siteSelected,
                click: async () => {
                  if (!this.container) return;

                  try {
                    const state = this.container.state;
                    if (!state.currentSiteKey || !state.currentWorkspaceKey) {
                      console.warn('No site selected');
                      return;
                    }

                    const scaffoldService = await this.container.getScaffoldModelService(
                      state.currentSiteKey,
                      state.currentWorkspaceKey
                    );
                    const result = await scaffoldService.scaffoldSingleFromFile('single');

                    if (result.success) {
                      console.log(`Scaffolded single model: ${result.modelKey}`);
                      // Notify frontend to refresh
                      if (this.mainWindow) {
                        this.mainWindow.webContents.send('model-changed');
                      }
                    } else if (result.error) {
                      console.error('Scaffold failed:', result.error);
                    }
                  } catch (error) {
                    console.error('Failed to scaffold single:', error);
                  }
                }
              },
              {
                id: 'scaffold-collection',
                label: 'Scaffold Collection from File...',
                enabled: this.options.siteSelected,
                click: async () => {
                  if (!this.container) return;

                  try {
                    const state = this.container.state;
                    if (!state.currentSiteKey || !state.currentWorkspaceKey) {
                      console.warn('No site selected');
                      return;
                    }

                    const scaffoldService = await this.container.getScaffoldModelService(
                      state.currentSiteKey,
                      state.currentWorkspaceKey
                    );
                    const result = await scaffoldService.scaffoldCollectionFromFile('collection');

                    if (result.success) {
                      console.log(`Scaffolded collection model: ${result.modelKey}`);
                      // Notify frontend to refresh
                      if (this.mainWindow) {
                        this.mainWindow.webContents.send('model-changed');
                      }
                    } else if (result.error) {
                      console.error('Scaffold failed:', result.error);
                    }
                  } catch (error) {
                    console.error('Failed to scaffold collection:', error);
                  }
                }
              }
            ]
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
            click: async () => {

              if (!this.container) return;

              try {
                const newValue = !this.options.experimentalFeatures;
                this.container.config.setExperimentalFeatures(newValue);
                await this.container.config.save();

                this.updateOptionsFromConfig();
                this.createMainMenu();
              } catch (error) {
                console.error('Failed to toggle experimental features:', error);
              }
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
            click: async () => {
              if (!this.container) return;

              try {
                const workspaceService = this.container.getCurrentWorkspaceService();

                if (workspaceService) {
                  // Stop and restart the server
                  workspaceService.stopHugoServer();
                  await workspaceService.serve();
                  console.log('Hugo server restarted successfully');
                } else {
                  console.warn('No workspace is currently running');
                }
              } catch (error) {
                console.error('Failed to restart Hugo server:', error);
              }
            }
          },
          { type: 'separator' },
          {
            label: 'Server Draft Mode',
            type: 'checkbox',
            checked: this.options.hugoServeDraftMode,
            click: async () => {
              if (!this.container) return;

              try {
                const newValue = !this.options.hugoServeDraftMode;
                this.container.config.setHugoServeDraftMode(newValue);
                await this.container.config.save();

                this.updateOptionsFromConfig();
                this.createMainMenu();

                // Note: The server will need to be restarted for this to take effect
                console.log(`Draft mode ${newValue ? 'enabled' : 'disabled'}. Restart server for changes to take effect.`);
              } catch (error) {
                console.error('Failed to toggle draft mode:', error);
              }
            }
          },
          {
            label: 'Disable Auto Serve',
            type: 'checkbox',
            checked: this.options.devDisableAutoHugoServe,
            click: async () => {
              if (!this.container) return;

              try {
                const newValue = !this.options.devDisableAutoHugoServe;
                this.container.config.setDevDisableAutoHugoServe(newValue);
                await this.container.config.save();

                this.updateOptionsFromConfig();
                this.createMainMenu();
              } catch (error) {
                console.error('Failed to toggle auto serve:', error);
              }
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
    // Update options from config before building menu
    this.updateOptionsFromConfig();

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
