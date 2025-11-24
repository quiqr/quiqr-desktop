/**
 * Platform Adapter Interfaces
 *
 * These interfaces abstract platform-specific functionality (Electron, CLI, Web, etc.)
 * allowing the backend to remain platform-agnostic.
 */

// ============================================================================
// Dialog Adapter - File system dialogs
// ============================================================================

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: Array<
    | 'openFile'
    | 'openDirectory'
    | 'multiSelections'
    | 'showHiddenFiles'
    | 'createDirectory'
    | 'promptToCreate'
    | 'noResolveAliases'
    | 'treatPackageAsDirectory'
  >;
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: Array<
    | 'showHiddenFiles'
    | 'createDirectory'
    | 'showOverwriteConfirmation'
    | 'dontAddToRecent'
  >;
}

export interface MessageBoxOptions {
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  buttons?: string[];
  defaultId?: number;
  title?: string;
  message: string;
  detail?: string;
  checkboxLabel?: string;
  checkboxChecked?: boolean;
  cancelId?: number;
  noLink?: boolean;
  normalizeAccessKeys?: boolean;
}

export interface DialogAdapter {
  /**
   * Show an open file/folder dialog
   * @returns Array of selected file/folder paths, or empty array if canceled
   */
  showOpenDialog(options: OpenDialogOptions): Promise<string[]>;

  /**
   * Show a save file dialog
   * @returns Selected file path, or undefined if canceled
   */
  showSaveDialog(options: SaveDialogOptions): Promise<string | undefined>;

  /**
   * Show a message box dialog
   * @returns Index of the clicked button
   */
  showMessageBox(options: MessageBoxOptions): Promise<number>;
}

// ============================================================================
// Shell Adapter - OS shell operations
// ============================================================================

export interface ShellAdapter {
  /**
   * Open a URL in the system's default browser
   */
  openExternal(url: string): Promise<void>;

  /**
   * Show a file in its containing folder (e.g., in Finder/Explorer)
   */
  showItemInFolder(fullPath: string): void;

  /**
   * Open a file or folder with the system's default application
   * @returns Error message if failed, empty string if successful
   */
  openPath(path: string): Promise<string>;
}

// ============================================================================
// Window Adapter - Window management
// ============================================================================

export interface WindowAdapter {
  /**
   * Show a log window with content (for debugging/error display)
   */
  showLogWindow(content: string): void;

  /**
   * Reload the main application window
   */
  reloadMainWindow(): void;

  /**
   * Send data to the renderer process
   */
  sendToRenderer(channel: string, data: any): void;
}

// ============================================================================
// Menu Adapter - Application menu management
// ============================================================================

export interface MenuAdapter {
  /**
   * Enable or disable a menu item by ID
   */
  setMenuItemEnabled(itemId: string, enabled: boolean): void;

  /**
   * Create/recreate the main application menu
   */
  createMainMenu(): void;
}

// ============================================================================
// AppInfo Adapter - Application information
// ============================================================================

export interface AppInfoAdapter {
  /**
   * Check if the application is packaged (production) or running in development
   */
  isPackaged(): boolean;

  /**
   * Get the application's installation path
   */
  getAppPath(): string;

  /**
   * Get the application version
   */
  getVersion(): string;

  /**
   * Get a special directory path (userData, home, temp, etc.)
   */
  getPath(name: 'home' | 'appData' | 'userData' | 'temp' | 'downloads'): string;
}

// ============================================================================
// Combined Platform Adapters
// ============================================================================

/**
 * Complete set of platform adapters injected into backend services
 */
export interface PlatformAdapters {
  dialog: DialogAdapter;
  shell: ShellAdapter;
  window: WindowAdapter;
  menu: MenuAdapter;
  appInfo: AppInfoAdapter;
}
