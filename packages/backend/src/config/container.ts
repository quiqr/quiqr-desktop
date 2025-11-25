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
import { FormatProviderResolver } from '../utils/format-provider-resolver.js';
import { ConfigurationDataProvider, ConsoleLogger } from '../services/configuration/index.js';
import { HugoUtils } from '../hugo/hugo-utils.js';
import { LibraryService } from '../services/library/library-service.js';
import { SyncFactory } from '../sync/sync-factory.js';
import { SiteSourceFactory } from '../site-sources/site-source-factory.js';

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

  /**
   * Format provider resolver (JSON, YAML, TOML)
   */
  formatResolver: FormatProviderResolver;

  /**
   * Configuration data provider (site configs)
   */
  configurationProvider: ConfigurationDataProvider;

  /**
   * Hugo utilities (site creation, config generation)
   */
  hugoUtils: HugoUtils;

  /**
   * Library service (site management and CRUD operations)
   */
  libraryService: LibraryService;

  /**
   * Sync factory (creates sync service instances)
   */
  syncFactory: SyncFactory;

  /**
   * Site source factory (creates site source instances)
   */
  siteSourceFactory: SiteSourceFactory;
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

  // Create format resolver
  const formatResolver = new FormatProviderResolver();

  // Create configuration provider with dependencies
  const logger = new ConsoleLogger();
  const configurationProvider = new ConfigurationDataProvider(
    pathHelper,
    formatResolver,
    logger
  );

  // Create Hugo utilities
  const hugoUtils = new HugoUtils();

  // Create factories
  const syncFactory = new SyncFactory();
  const siteSourceFactory = new SiteSourceFactory();

  // Create the container object first (needed for circular dependency)
  const container: AppContainer = {
    config,
    state,
    adapters,
    pathHelper,
    formatResolver,
    configurationProvider,
    hugoUtils,
    syncFactory,
    siteSourceFactory,
  } as AppContainer;

  // Create library service with container dependency
  const libraryService = new LibraryService(container);
  container.libraryService = libraryService;

  return container;
}

/**
 * Type helper to extract container from context
 */
export type Container = AppContainer;
