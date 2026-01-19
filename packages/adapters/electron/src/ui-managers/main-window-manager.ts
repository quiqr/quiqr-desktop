/**
 * Main Window Manager - Manages the primary Electron window
 */

import { BrowserWindow } from 'electron';
import windowStateKeeper, { State } from 'electron-window-state';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;
let mainWindowState: State;

/**
 * Determine the frontend location based on environment
 */
function getLocation(window: BrowserWindow): void {
  if (isDev) {
    // Development: Connect to Vite dev server
    window.loadURL('http://localhost:4002');
  } else {
    // Production: Load from Express server which serves the frontend
    // This ensures BrowserRouter works correctly (no file:// protocol issues)
    window.loadURL('http://localhost:5150');
  }
}

/**
 * Create the main application window
 */
function createWindow(): BrowserWindow {
  // Remember window position and size
  mainWindowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 800
  });

  mainWindow = new BrowserWindow({
    show: false,
    frame: true,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 1055,
    minHeight: 700
  });

  // Let electron-window-state manage window position/size
  mainWindowState.manage(mainWindow);

  // Open DevTools if DEVTOOLS env var is set
  if (process.env.DEVTOOLS) {
    const devtools = new BrowserWindow();
    mainWindow.webContents.setDevToolsWebContents(devtools.webContents);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else if (isDev) {
    // In development, open DevTools by default
    mainWindow.webContents.openDevTools();
  }

  // Load the frontend
  getLocation(mainWindow);

  // Show window when ready to avoid blank/white screen
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Clear reference when closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

/**
 * Get the current main window instance
 */
export function getCurrentInstance(): BrowserWindow | null {
  return mainWindow;
}

/**
 * Get the current instance or create a new one if it doesn't exist
 */
export function getCurrentInstanceOrNew(): BrowserWindow {
  if (mainWindow) {
    return mainWindow;
  }

  return createWindow();
}

/**
 * Close the current site and show the site selector
 * NOTE: This needs to be wired up to the new backend API
 */
export async function closeSiteAndShowSelectSites(): Promise<boolean> {
  if (!mainWindow) {
    return false;
  }

  // TODO: Wire up to new backend API instead of global.pogoconf
  // For now, just redirect to site selector
  mainWindow.webContents.send('redirectToGivenLocation', '/refresh');
  mainWindow.webContents.send('redirectToGivenLocation', '/sites/last');
  mainWindow.setTitle('Quiqr: Select site');

  return true;
}
