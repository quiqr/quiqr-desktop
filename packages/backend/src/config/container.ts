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
import { WorkspaceConfigProvider } from '../services/workspace/workspace-config-provider.js';
import { FolderImporter } from '../import/folder-importer.js';
import { GitImporter } from '../import/git-importer.js';
import { Pogozipper } from '../import/pogozipper.js';
import { Embgit } from '../embgit/embgit.js';
import { WorkspaceService, type WorkspaceServiceDependencies } from '../services/workspace/workspace-service.js';
import { BuildActionService } from '../build-actions/index.js';
import { HugoDownloader } from '../hugo/hugo-downloader.js';
import type { EnvironmentInfo } from '../utils/path-helper.js';

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

  /**
   * Workspace config provider (loads workspace configs)
   */
  workspaceConfigProvider: WorkspaceConfigProvider;

  /**
   * Folder importer (imports sites from local directories)
   */
  folderImporter: FolderImporter;

  /**
   * Embgit (embedded git client)
   */
  embgit: Embgit;

  /**
   * Git importer (imports sites from git repositories)
   */
  gitImporter: GitImporter;

  /**
   * Pogozipper (ZIP-based import/export for sites, themes, content)
   */
  pogozipper: Pogozipper;

  /**
   * Hugo downloader (downloads and installs Hugo binaries)
   */
  hugoDownloader: HugoDownloader;

  /**
   * Environment information (platform, packaging status)
   */
  environmentInfo: EnvironmentInfo;

  /**
   * Factory function to create WorkspaceService instances
   * WorkspaceService is per-workspace, not a singleton
   */
  createWorkspaceService: (
    workspacePath: string,
    workspaceKey: string,
    siteKey: string
  ) => WorkspaceService;

  /**
   * Helper to get a WorkspaceService instance
   * Handles the common pattern of: get site → get workspace → create service
   */
  getWorkspaceService: (
    siteKey: string,
    workspaceKey: string
  ) => Promise<WorkspaceService>;

  /**
   * Get the currently cached WorkspaceService (for operations that need persistence like Hugo server)
   * Returns undefined if no workspace is currently cached
   */
  getCurrentWorkspaceService: () => WorkspaceService | undefined;
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
  const siteSourceFactory = new SiteSourceFactory(pathHelper);

  // Initialize syncFactory with dependencies (will be set after configurationProvider is created)
  // This is done below after all dependencies are available

  // Create environment info from platform
  const environmentInfo: EnvironmentInfo = {
    platform:
      process.platform === 'darwin' ? 'macOS' as const :
      process.platform === 'win32' ? 'windows' as const :
      'linux' as const,
    isPackaged: adapters.appInfo.isPackaged(),
  };

  // Create Hugo downloader
  const hugoDownloader = new HugoDownloader({
    pathHelper,
    outputConsole: adapters.outputConsole,
    environmentInfo,
  });

  // Create workspace config provider
  const workspaceConfigProvider = new WorkspaceConfigProvider(
    formatResolver,
    pathHelper,
    config,
    environmentInfo
  );

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
    workspaceConfigProvider,
    hugoDownloader,
    environmentInfo,
  } as AppContainer;

  // Create library service with container dependency
  const libraryService = new LibraryService(container);
  container.libraryService = libraryService;

  // Create folder importer with all dependencies
  const folderImporter = new FolderImporter(
    pathHelper,
    formatResolver,
    libraryService,
    workspaceConfigProvider
  );
  container.folderImporter = folderImporter;

  // Create embgit with dependencies
  const embgit = new Embgit(
    pathHelper,
    adapters.outputConsole,
    adapters.appInfo,
    rootPath,
    environmentInfo
  );
  container.embgit = embgit;

  // Create git importer with dependencies
  const gitImporter = new GitImporter(
    embgit,
    pathHelper,
    formatResolver,
    libraryService
  );
  container.gitImporter = gitImporter;

  // Create pogozipper with dependencies
  const pogozipper = new Pogozipper(
    pathHelper,
    libraryService,
    adapters.dialog,
    adapters.window
  );
  container.pogozipper = pogozipper;

  // Initialize syncFactory with dependencies
  syncFactory.setDependencies({
    pathHelper,
    outputConsole: adapters.outputConsole,
    windowAdapter: adapters.window,
    configurationProvider,
    embgit,
  });

  // Create BuildActionService (uses outputConsole for logging)
  const buildActionService = new BuildActionService(adapters.outputConsole);

  // Create WorkspaceService factory
  // Note: OutputConsole and ScreenshotWindowManager are provided by Electron runtime
  container.createWorkspaceService = (
    workspacePath: string,
    workspaceKey: string,
    siteKey: string
  ) => {
    const dependencies: WorkspaceServiceDependencies = {
      workspaceConfigProvider,
      formatProviderResolver: formatResolver,
      pathHelper,
      appConfig: config,
      appState: state,
      windowAdapter: adapters.window,
      shellAdapter: adapters.shell,
      outputConsole: adapters.outputConsole,
      screenshotWindowManager: adapters.screenshotWindowManager,
      buildActionService,
    };

    return new WorkspaceService(workspacePath, workspaceKey, siteKey, dependencies);
  };

  // Cache for the current WorkspaceService (needed for Hugo server persistence)
  let cachedWorkspaceService: WorkspaceService | undefined;
  let cachedWorkspaceKey: string | undefined;
  let cachedSiteKey: string | undefined;

  // Helper to get WorkspaceService (common pattern used across handlers)
  container.getWorkspaceService = async (
    siteKey: string,
    workspaceKey: string
  ): Promise<WorkspaceService> => {
    // Import SiteService dynamically to avoid circular dependency
    const { SiteService } = await import('../services/site/site-service.js');

    // Get site configuration
    const siteConfig = await libraryService.getSiteConf(siteKey);

    // Create SiteService instance
    const siteService = new SiteService(
      siteConfig,
      siteSourceFactory,
      syncFactory
    );

    // Handle special workspace keys that should resolve to the default workspace
    let resolvedWorkspaceKey = workspaceKey;
    if (workspaceKey === 'source' || workspaceKey === 'default') {
      // Resolve to the first available workspace
      const workspaces = await siteService.listWorkspaces();
      if (workspaces.length === 0) {
        throw new Error(`No workspaces found for site: ${siteKey}`);
      }
      resolvedWorkspaceKey = workspaces[0].key;
    }

    // Return cached instance if it matches the requested workspace
    if (
      cachedWorkspaceService &&
      cachedSiteKey === siteKey &&
      cachedWorkspaceKey === resolvedWorkspaceKey
    ) {
      return cachedWorkspaceService;
    }

    // Get workspace head to find the path
    const workspaceHead = await siteService.getWorkspaceHead(resolvedWorkspaceKey);

    if (!workspaceHead) {
      throw new Error(`Workspace not found: ${resolvedWorkspaceKey} for site: ${siteKey}`);
    }

    // Create WorkspaceService and cache it
    const workspaceService = container.createWorkspaceService(
      workspaceHead.path,
      resolvedWorkspaceKey,
      siteKey
    );

    cachedWorkspaceService = workspaceService;
    cachedSiteKey = siteKey;
    cachedWorkspaceKey = resolvedWorkspaceKey;

    return workspaceService;
  };

  // Get the currently cached WorkspaceService
  container.getCurrentWorkspaceService = () => {
    return cachedWorkspaceService;
  };

  return container;
}

/**
 * Type helper to extract container from context
 */
export type Container = AppContainer;
