/**
 * Electron Main Process - New Architecture
 * Wires up the backend with Electron adapters and UI managers
 */

import { app, BrowserWindow } from 'electron';
import { createElectronAdapters } from './adapters/index.js';
import { createContainer } from '@quiqr/backend';
import { startServer } from '@quiqr/backend/api';
import { getCurrentInstanceOrNew, initializeRemoteMain } from './ui-managers/main-window-manager.js';
import { menuManager } from './ui-managers/menu-manager.js';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

/**
 * Start the backend server with Electron adapters
 */
async function startBackend() {
  console.log('='.repeat(60));
  console.log('Starting Quiqr Desktop with NEW Backend Architecture');
  console.log('='.repeat(60));

  try {
    // Create Electron adapters
    const { adapters, windowAdapter } = createElectronAdapters();
    console.log('Electron adapters created');

    // Get paths
    const userDataPath = app.getPath('userData');
    const rootPath = app.getAppPath();

    console.log(`User Data: ${userDataPath}`);
    console.log(`App Path: ${rootPath}`);

    // Create container with all dependencies
    const container = createContainer({
      userDataPath,
      rootPath,
      adapters,
      configFileName: 'quiqr-app-config.json'
    });

    console.log('Container created with dependency injection');

    // Start the backend server with container
    startServer(container, { port: 5150 });
    console.log('Backend server started on http://localhost:5150');

    console.log('='.repeat(60));

    // Return both windowAdapter and container
    return { windowAdapter, container };
  } catch (error) {
    console.error('Failed to start backend:', error);
    throw error;
  }
}

/**
 * Create the main application window
 */
function createWindow(container?: any): BrowserWindow {
  // Use the main window manager
  mainWindow = getCurrentInstanceOrNew();

  // Set up menu manager with container
  if (container) {
    menuManager.setContainer(container);
  }
  menuManager.setMainWindow(mainWindow);
  menuManager.createMainMenu();

  console.log('Main window and menu created');

  return mainWindow;
}

/**
 * Application ready event
 */
app.on('ready', async () => {
  console.log('Electron app ready!');

  // Initialize @electron/remote
  initializeRemoteMain();

  // Start backend first
  const { windowAdapter, container } = await startBackend();

  // Create the window with container reference
  mainWindow = createWindow(container);

  // Wire up the window adapter to the actual window
  if (windowAdapter && mainWindow) {
    windowAdapter.setMainWindow(mainWindow);
    console.log('Window adapter connected to main window');
  }

  console.log('');
  console.log('🎉 Quiqr Desktop ready!');
  console.log('   Frontend: ' + (isDev ? 'http://localhost:4002' : 'file://...'));
  console.log('   Backend:  http://localhost:5150');
  console.log('');
});

/**
 * All windows closed event
 */
app.on('window-all-closed', () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Activate event (macOS)
 */
app.on('activate', () => {
  // On macOS, recreate window when dock icon is clicked and no windows are open
  if (mainWindow === null) {
    createWindow();
  }
});

console.log('Electron main.ts loaded!');
