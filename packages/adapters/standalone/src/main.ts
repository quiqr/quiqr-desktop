/**
 * Standalone Backend Server
 *
 * Runs the Quiqr backend Express server without Electron.
 * Useful for development, testing, and standalone server scenarios.
 */

import { createDevAdapters } from '@quiqr/backend/adapters';
import { createContainer } from '@quiqr/backend';
import { startServer } from '@quiqr/backend/api';
import { homedir } from 'os';
import { join } from 'path';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Start the standalone backend server
 */
async function startStandaloneBackend() {
  console.log('='.repeat(60));
  console.log('Starting Quiqr Backend in STANDALONE Mode');
  console.log('='.repeat(60));

  try {
    // Create dev adapters (no-op implementations for UI operations)
    const adapters = createDevAdapters();
    console.log('Dev adapters created');

    // Get paths
    // For standalone mode, use a dedicated directory in user's home
    const userDataPath = join(homedir(), '.quiqr-standalone');
    const rootPath = process.cwd();

    console.log(`User Data: ${userDataPath}`);
    console.log(`Root Path: ${rootPath}`);

    // Create container with all dependencies
    const container = createContainer({
      userDataPath,
      rootPath,
      adapters,
      configFileName: 'quiqr-app-config.json'
    });

    console.log('Container created with dependency injection');

    // Get port from environment or use default
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5150;

    // Start the backend server with container
    startServer(container, { port });
    console.log(`Backend server started on http://localhost:${port}`);

    console.log('='.repeat(60));
    console.log('');
    console.log('🚀 Quiqr Backend ready!');
    console.log(`   API:  http://localhost:${port}`);
    console.log(`   Mode: ${isDev ? 'development' : 'production'}`);
    console.log('');
    console.log('Note: This is standalone mode. UI operations will log to console.');
    console.log('');
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nShutting down gracefully...');
  process.exit(0);
});

// Start the server
startStandaloneBackend().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
