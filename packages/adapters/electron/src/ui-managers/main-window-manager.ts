/**
 * Main Window Manager - Manages the primary Electron window
 */

import { BrowserWindow, app } from 'electron';
import remoteMain from '@electron/remote/main/index.js';
import windowStateKeeper from 'electron-window-state';
import path from 'path';
import fs from 'fs-extra';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;
let mainWindowState: any = null;

/**
 * Determine the frontend location based on environment
 */
function getLocation(window: BrowserWindow): void {
  if (isDev) {
    // Development: Connect to Vite dev server
    window.loadURL('http://localhost:4002');
  } else {
    // Production: Load from built frontend
    // Try multiple possible locations for the frontend index.html
    const lookups = [
      path.join(app.getAppPath(), 'packages/frontend/build/index.html'),
      path.join(app.getAppPath(), 'frontend/build/index.html'),
      path.join(app.getAppPath(), 'dist/frontend/index.html'),
      path.join(app.getAppPath(), 'index.html')
    ];

    let indexFile: string | null = null;
    for (const lookup of lookups) {
      if (fs.existsSync(lookup)) {
        indexFile = lookup;
        console.log(`Found frontend at: ${indexFile}`);
        break;
      }
    }

    if (!indexFile) {
      throw new Error(`Could not find frontend index.html. Tried: ${lookups.join(', ')}`);
    }

    window.loadFile(indexFile);
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
      nodeIntegration: true,
      contextIsolation: false
      // Note: enableRemoteModule is deprecated, use @electron/remote instead
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

  // Enable @electron/remote for this window
  remoteMain.enable(mainWindow.webContents);

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

/**
 * Initialize remote main module
 * Call this before creating any windows
 */
export function initializeRemoteMain(): void {
  remoteMain.initialize();
}
