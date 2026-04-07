/**
 * Standalone Backend Server
 *
 * Runs the Quiqr backend Express server without Electron.
 * Useful for development, testing, and standalone server scenarios.
 */

import { createDevAdapters, createContainer, LocalFileAuthProvider } from '@quiqr/backend';
import { startServer } from '@quiqr/backend/api';
import type { ServerAuthOptions } from '@quiqr/backend/api';
import { createWebAdapters } from './adapters/index.js';
import { findFrontendBuildDir } from './frontend-path.js';
import { GLOBAL_CATEGORIES } from '@quiqr/backend/logging';
import { randomBytes } from 'crypto';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Find the project root by looking for package.json with workspaces
 */
function findProjectRoot(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Start from the current directory and go up
  let currentDir = __dirname;

  while (currentDir !== dirname(currentDir)) {
    const packageJsonPath = join(currentDir, 'package.json');

    // Check if package.json exists and has workspaces (indicates project root)
    if (existsSync(packageJsonPath)) {
      try {
        const pkgContent = readFileSync(packageJsonPath, 'utf-8');
        const pkg = JSON.parse(pkgContent);
        if (pkg.workspaces) {
          return currentDir;
        }
      } catch {
        // Continue searching
      }
    }

    // Go up one directory
    currentDir = dirname(currentDir);
  }

  // Fallback to cwd
  return process.cwd();
}

/**
 * Start the standalone backend server
 */
let appContainer: any = null;

async function startStandaloneBackend() {
  console.log('='.repeat(60));
  console.log('Starting Quiqr Backend in STANDALONE Mode');
  console.log('='.repeat(60));

  try {
    // Get paths
    // For standalone mode, use a dedicated directory in user's home
    const userDataPath = join(homedir(), '.quiqr-standalone');

    // Find the project root (where resources folder is located)
    const rootPath = findProjectRoot();

    console.log(`User Data: ${userDataPath}`);
    console.log(`Root Path: ${rootPath}`);

    // Create container first with dev adapters (temporary)
    const container = createContainer({
      userDataPath,
      rootPath,
      adapters: createDevAdapters(), // Temporary placeholder
      configFileName: 'quiqr-app-config.json'
    });

    console.log('Container created with dependency injection');

    // Store container for shutdown handler
    appContainer = container;

    // Configure authentication (before web adapters, so menu includes User menu)
    let auth: ServerAuthOptions | undefined;
    const authConfig = container.unifiedConfig.getInstanceSetting('auth') as
      { enabled?: boolean; provider?: string; local?: { usersFile?: string }; session?: { secret?: string; accessTokenExpiry?: string; refreshTokenExpiry?: string } } | undefined;

    if (authConfig?.enabled) {
      // Auto-generate session secret if not set
      let secret = authConfig.session?.secret;
      if (!secret) {
        secret = randomBytes(32).toString('hex');
        // Persist the generated secret to instance settings
        const settingsPath = join(userDataPath, 'instance_settings.json');
        try {
          const current = existsSync(settingsPath) ? JSON.parse(readFileSync(settingsPath, 'utf-8')) : {};
          if (!current.auth) current.auth = {};
          if (!current.auth.session) current.auth.session = {};
          current.auth.session.secret = secret;
          writeFileSync(settingsPath, JSON.stringify(current, null, 2), 'utf-8');
          console.log('Generated and persisted auth session secret.');
        } catch (e) {
          console.warn('Could not persist session secret to instance settings:', e);
        }
      }

      // Create auth provider
      const usersFile = authConfig.local?.usersFile || 'users.json';
      const authProvider = new LocalFileAuthProvider(userDataPath, usersFile);
      container.authProvider = authProvider;

      // First-run: create default admin user if users file doesn't exist
      if (!authProvider.usersFileExists()) {
        const defaultEmail = 'admin@localhost';
        const defaultPassword = 'admin';
        await authProvider.createUser(defaultEmail, defaultPassword, true);
        console.log('');
        console.log('='.repeat(60));
        console.log('  First-run: default admin user created');
        console.log(`  Email:    ${defaultEmail}`);
        console.log(`  Password: ${defaultPassword}`);
        console.log('  You MUST change this password on first login.');
        console.log('='.repeat(60));
        console.log('');
      }

      auth = {
        enabled: true,
        secret,
        accessTokenExpiry: authConfig.session?.accessTokenExpiry || '15m',
        refreshTokenExpiry: authConfig.session?.refreshTokenExpiry || '7d',
      };

      console.log('Authentication enabled (local file provider).');
    }

    // Replace with web adapters (includes real menu adapter)
    // Done after auth setup so the menu includes the User menu when auth is enabled
    const webAdapters = createWebAdapters(container, rootPath);
    container.adapters = webAdapters;

    console.log('Web adapters initialized (menu, window, appInfo)');

    // Get port from environment or use default
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5150;

    // Initialize structured logger
    const prefs = container.config.prefs;
    const logRetentionDays = prefs.logRetentionDays ?? 30;
    container.logger.initCleanup(logRetentionDays);

    // Log application start
    container.logger.info(GLOBAL_CATEGORIES.STANDALONE_INIT, 'Quiqr Backend started in standalone mode', {
      userDataPath,
      rootPath,
      port,
      logRetentionDays
    });

    // Resolve frontend build path (skip in dev mode — use Vite dev server instead)
    let frontendPath: string | undefined;
    if (isDev) {
      console.log('Development mode: skipping frontend serving. Use Vite dev server on :4002 for hot reload.');
    } else {
      frontendPath = findFrontendBuildDir(rootPath);
      if (frontendPath) {
        console.log(`Serving frontend from: ${frontendPath}`);
      } else {
        console.warn(`WARNING: Frontend build not found.`);
        console.warn(`  Run 'npm run build -w @quiqr/frontend' to build the frontend.`);
        console.warn(`  The API server is running, but no frontend will be served.`);
      }
    }

    // Start the Express server
    startServer(container, { port, frontendPath, auth });

    container.logger.info(GLOBAL_CATEGORIES.STANDALONE_INIT, 'Quiqr Backend ready', {
      api: `http://localhost:${port}`,
      frontend: frontendPath ? `http://localhost:${port}` : 'not served',
      mode: isDev ? 'development' : 'production',
      note: 'Standalone mode - UI operations will log to console'
    });

    console.log(`Quiqr Standalone ready!`);
    console.log(`   API:      http://localhost:${port}/api/`);
    if (frontendPath) {
      console.log(`   Frontend: http://localhost:${port}`);
    }
    console.log(`   Mode:     ${isDev ? 'development' : 'production'}`);
    console.log('');
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\nShutting down gracefully...');
  if (appContainer) {
    await appContainer.logger.shutdown();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\nShutting down gracefully...');
  if (appContainer) {
    await appContainer.logger.shutdown();
  }
  process.exit(0);
});

// Start the server
startStandaloneBackend().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
