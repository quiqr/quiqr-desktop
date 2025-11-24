/**
 * Dependency Injection Container
 *
 * Central container for all application dependencies.
 * Replaces scattered global variables with clean dependency injection.
 */

import type { PlatformAdapters } from '../adapters/types.js';
import { AppConfig } from './app-config.js';
import { AppState } from './app-state.js';
import { PathHelper } from '../utils/path-helper.js';

/**
 * Main application container with all dependencies
 */
export interface AppContainer {
  /**
   * Application configuration (persistent)
   */
  config: AppConfig;

  /**
   * Application runtime state (non-persistent)
   */
  state: AppState;

  /**
   * Platform adapters (Electron, CLI, Web, etc.)
   */
  adapters: PlatformAdapters;

  /**
   * Path helper utilities
   */
  pathHelper: PathHelper;
}

/**
 * Container creation options
 */
export interface ContainerOptions {
  /**
   * Path to user data directory
   */
  userDataPath: string;

  /**
   * Root path of the application
   */
  rootPath: string;

  /**
   * Platform adapters implementation
   */
  adapters: PlatformAdapters;

  /**
   * Optional config file name (defaults to 'quiqr-app-config.json')
   */
  configFileName?: string;
}

/**
 * Create the application container with all dependencies
 */
export function createContainer(options: ContainerOptions): AppContainer {
  const { userDataPath, rootPath, adapters, configFileName } = options;

  // Create config and state
  const config = new AppConfig(userDataPath, configFileName);
  const state = new AppState();

  // Create path helper with dependencies
  const pathHelper = new PathHelper(
    adapters.appInfo,
    rootPath,
    {
      dataFolder: config.prefs.dataFolder,
      currentSitePath: state.currentSitePath,
    }
  );

  return {
    config,
    state,
    adapters,
    pathHelper,
  };
}

/**
 * Type helper to extract container from context
 */
export type Container = AppContainer;
