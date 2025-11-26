// Electron main with NEW backend architecture!
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createElectronAdapters } from './adapters/index.js';
import { createContainer } from '@quiqr/backend';
import { startServer } from '@quiqr/backend/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

// Start the NEW backend with adapters!
async function startBackend() {
  console.log('STARTING FROM @quiqr/adapter-electron with NEW BACKEND!');

  try {
    // Create Electron adapters
    const { adapters, windowAdapter } = createElectronAdapters();
    console.log('Electron adapters created!');

    // Get paths
    const userDataPath = app.getPath('userData');
    const rootPath = app.getAppPath();

    console.log('Creating container with adapters...');
    console.log('  userDataPath:', userDataPath);
    console.log('  rootPath:', rootPath);

    // Create container with all dependencies
    const container = createContainer({
      userDataPath,
      rootPath,
      adapters,
      configFileName: 'quiqr-app-config.json'
    });

    console.log('Container created!');

    // Start the backend server with container
    startServer(container, { port: 5150 });
    console.log('Backend server started on port 5150!');

    // Return windowAdapter so we can wire it up to the window later
    return windowAdapter;
  } catch (error) {
    console.error('Failed to start backend:', error);
    throw error;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1055,
    minHeight: 700,
    backgroundColor: '#ffffff',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the frontend
  if (isDev) {
    mainWindow.loadURL('http://localhost:4002');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the built frontend
    const indexPath = path.join(__dirname, '../../../..', 'frontend/build/index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  console.log('Main window created!');
}

app.on('ready', async () => {
  console.log('Electron app ready!');
  const windowAdapter = await startBackend();
  createWindow();

  // Wire up the window adapter to the actual window
  if (windowAdapter && mainWindow) {
    windowAdapter.setMainWindow(mainWindow);
    console.log('Window adapter connected to main window!');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

console.log('Electron main.ts loaded!');
