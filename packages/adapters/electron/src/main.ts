/**
 * Electron Main Process - New Architecture
 * Wires up the backend with Electron adapters and UI managers
 */

import { app, BrowserWindow } from 'electron';
import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import { createElectronAdapters } from './adapters/index.js';
import { createContainer } from '@quiqr/backend';
import { createServer } from '@quiqr/backend/api';
import { getCurrentInstanceOrNew, initializeRemoteMain } from './ui-managers/main-window-manager.js';
import { menuManager } from './ui-managers/menu-manager.js';

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

/**
 * Find the frontend build directory
 */
function findFrontendBuildDir(): string | null {
  const rootPath = app.getAppPath();
  const lookups = [
    path.join(rootPath, 'frontend/build'),
    path.join(rootPath, 'packages/frontend/build'),
    path.join(rootPath, 'dist/frontend'),
  ];

  for (const dir of lookups) {
    if (fs.existsSync(path.join(dir, 'index.html'))) {
      return dir;
    }
  }
  return null;
}

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

    // Create the Express app from backend
    const expressApp = createServer(container, { port: 5150 });

    // In production, serve the frontend from the same Express server
    if (!isDev) {
      const frontendDir = findFrontendBuildDir();
      if (frontendDir) {
        console.log(`Serving frontend from: ${frontendDir}`);

        // Serve static files from the frontend build directory
        expressApp.use(express.static(frontendDir));

        // SPA catch-all: serve index.html for any non-API route
        expressApp.get('*', (req, res) => {
          // Don't catch API routes
          if (req.path.startsWith('/api')) {
            res.status(404).json({ error: 'API endpoint not found' });
            return;
          }
          res.sendFile(path.join(frontendDir, 'index.html'));
        });
      } else {
        console.warn('Frontend build directory not found!');
      }
    }

    // Start listening
    expressApp.listen(5150, () => {
      console.log('Server running on http://localhost:5150');
    });

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
