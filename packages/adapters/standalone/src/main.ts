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
import { WebAppInfoAdapter } from './adapters/app-info-adapter.js';
import { findFrontendBuildDir } from './frontend-path.js';
import { GLOBAL_CATEGORIES } from '@quiqr/backend/logging';
import { randomBytes } from 'crypto';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';

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
    const configDirPath = process.env.QUIQR_CONF_DIR
      || join(homedir(), '.quiqr-standalone');

    // Find the project root (where resources folder is located)
    const rootPath = findProjectRoot();

    console.log(`Config Dir: ${configDirPath}`);
    console.log(`Root Path: ${rootPath}`);

    // Ensure data directory exists
    mkdirSync(configDirPath, { recursive: true });

    // If QUIQR_CONFIG_FILE is set, copy external config into the data directory
    // so the unified config service reads from its expected location.
    const externalConfigFile = process.env.QUIQR_CONFIG_FILE;
    if (externalConfigFile) {
      const targetPath = join(configDirPath, 'instance_settings.json');
      try {
        copyFileSync(externalConfigFile, targetPath);
        console.log(`Config copied from ${externalConfigFile}`);
      } catch (e) {
        console.error(`Failed to copy config from ${externalConfigFile}:`, e);
        process.exit(1);
      }
    }

    // Create container with dev adapters but standalone appInfo (so runtime is correct from the start)
    const devAdapters = createDevAdapters();
    devAdapters.appInfo = new WebAppInfoAdapter(rootPath);
    const container = createContainer({
      configDirPath,
      rootPath,
      adapters: devAdapters,
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
      // Read session secret from runtime state (not instance_settings.json).
      // This separation allows instance_settings.json to be externally managed
      // (e.g., by NixOS) without the server overwriting it.
      const runtimeStatePath = join(configDirPath, 'runtime_state.json');
      let runtimeState: Record<string, unknown> = {};
      try {
        if (existsSync(runtimeStatePath)) {
          runtimeState = JSON.parse(readFileSync(runtimeStatePath, 'utf-8'));
        }
      } catch {
        runtimeState = {};
      }

      // Use secret from: runtime state > config > generate new
      let secret = (runtimeState.sessionSecret as string)
        || authConfig.session?.secret;

      if (!secret) {
        secret = randomBytes(32).toString('hex');
      }

      // Always persist to runtime state (ensures it survives config regeneration)
      if (runtimeState.sessionSecret !== secret) {
        try {
          runtimeState.sessionSecret = secret;
          writeFileSync(runtimeStatePath, JSON.stringify(runtimeState, null, 2), 'utf-8');
          console.log('Session secret persisted to runtime_state.json.');
        } catch (e) {
          console.warn('Could not persist session secret to runtime_state.json:', e);
        }
      }

      // Create auth provider
      const usersFile = authConfig.local?.usersFile || 'users.json';
      const authProvider = new LocalFileAuthProvider(configDirPath, usersFile);
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

    // Get port and host from environment or use defaults
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5150;
    const host = process.env.HOST || process.env.BIND_ADDRESS || undefined;

    // Initialize structured logger
    const logRetention = (container.unifiedConfig.getInstanceSetting('logging.retention') as number) ?? 30;
    container.logger.initCleanup(logRetention);

    // Log application start
    container.logger.info(GLOBAL_CATEGORIES.STANDALONE_INIT, 'Quiqr Backend started in standalone mode', {
      configDirPath,
      rootPath,
      port,
      logRetention
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
    startServer(container, { port, host, frontendPath, auth });

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
