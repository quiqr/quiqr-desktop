/**
 * Log Window Manager - Manages the console/log output window
 */

import { BrowserWindow, app } from 'electron';
import windowStateKeeper from 'electron-window-state';
import path from 'path';
import fs from 'fs-extra';

const isDev = process.env.NODE_ENV === 'development';

let logWindow: BrowserWindow | null = null;
let logWindowState: any = null;

/**
 * Determine the console page location based on environment
 */
function getLocation(window: BrowserWindow): void {
  if (isDev) {
    // Development: Load console route from Vite dev server
    window.loadURL('http://localhost:4002/console');
  } else {
    // Production: Try to find console.html
    const lookups = [
      path.join(app.getAppPath(), 'packages/frontend/build/console.html'),
      path.join(app.getAppPath(), 'frontend/build/console.html'),
      path.join(app.getAppPath(), 'dist/frontend/console.html'),
      path.join(app.getAppPath(), 'console.html')
    ];

    let indexFile: string | null = null;
    for (const lookup of lookups) {
      if (fs.existsSync(lookup)) {
        indexFile = lookup;
        console.log(`Found console page at: ${indexFile}`);
        break;
      }
    }

    if (!indexFile) {
      console.warn(`Could not find console.html. Tried: ${lookups.join(', ')}`);
      // Fallback: just use the main page with console flag
      indexFile = path.join(app.getAppPath(), 'frontend/build/index.html');
    }

    window.loadFile(indexFile, { query: { console: 'true' } });
  }
}

/**
 * Create the log/console window
 */
function createWindow(): BrowserWindow {
  // Remember window position and size
  logWindowState = windowStateKeeper({
    file: 'log-window-state.json', // Separate state file from main window
    defaultWidth: 800,
    defaultHeight: 600
  });

  logWindow = new BrowserWindow({
    show: false,
    frame: true,
    backgroundColor: '#ffffff',
    title: 'Quiqr Console',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    x: logWindowState.x,
    y: logWindowState.y,
    width: logWindowState.width,
    height: logWindowState.height,
    minWidth: 600,
    minHeight: 400
  });

  // Let electron-window-state manage window position/size
  logWindowState.manage(logWindow);

  // Open DevTools if DEVTOOLS env var is set
  if (process.env.DEVTOOLS) {
    const devtools = new BrowserWindow();
    logWindow.webContents.setDevToolsWebContents(devtools.webContents);
    logWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Load the console page
  getLocation(logWindow);

  // Show window when ready
  logWindow.once('ready-to-show', () => {
    logWindow?.show();
  });

  // Clear reference when closed (but don't quit the app)
  logWindow.on('closed', () => {
    logWindow = null;
  });

  return logWindow;
}

/**
 * Get the current log window instance
 */
export function getCurrentInstance(): BrowserWindow | null {
  return logWindow;
}

/**
 * Get the current instance or create a new one if it doesn't exist
 * If the window already exists, bring it to front
 */
export function getCurrentInstanceOrNew(): BrowserWindow {
  if (logWindow) {
    logWindow.show();
    logWindow.focus();
    return logWindow;
  }

  return createWindow();
}

/**
 * Show the log window with specific content
 */
export function showLogWindow(content: string): void {
  const window = getCurrentInstanceOrNew();

  // Send the log content to the renderer
  window.webContents.send('log-content', content);
}
