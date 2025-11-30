/**
 * Sync Factory
 *
 * Factory for creating sync service instances based on publisher configuration type.
 * Routes to the appropriate sync implementation (folder, github, sysgit).
 */

import type { PublConf } from '@quiqr/types';
import type { PathHelper } from '../utils/path-helper.js';
import type { OutputConsole, WindowAdapter } from '../adapters/types.js';
import type { ConfigurationDataProvider } from '../services/configuration/index.js';
import type { Embgit } from '../embgit/embgit.js';
import { FolderSync } from './folder/folder-sync.js';
import { GithubSync } from './github/github-sync.js';
import { SysgitSync } from './sysgit/sysgit-sync.js';

/**
 * Generic sync service interface
 * All sync implementations must implement this interface
 */
export interface SyncService {
  actionDispatcher(action: string, parameters?: unknown): Promise<unknown>;
}

/**
 * Dependencies required by sync services
 */
export interface SyncServiceDependencies {
  pathHelper: PathHelper;
  outputConsole: OutputConsole;
  windowAdapter: WindowAdapter;
  configurationProvider: ConfigurationDataProvider;
  embgit: Embgit;
}

/**
 * SyncFactory creates sync service instances based on publisher configuration
 */
export class SyncFactory {
  private dependencies?: SyncServiceDependencies;

  /**
   * Set dependencies for sync services
   * This should be called once during app initialization
   */
  setDependencies(dependencies: SyncServiceDependencies): void {
    this.dependencies = dependencies;
  }

  /**
   * Get a sync service instance for the given publisher configuration
   *
   * @param publisherConfig - The publisher configuration (folder, github, or sysgit)
   * @param siteKey - The site key
   * @returns A sync service instance
   * @throws Error if the sync type is not implemented or dependencies not set
   */
  getPublisher(publisherConfig: PublConf, siteKey: string): SyncService {
    if (!this.dependencies) {
      throw new Error('SyncFactory dependencies not set. Call setDependencies() first.');
    }

    const { pathHelper, outputConsole, windowAdapter, configurationProvider } = this.dependencies;
    const type = publisherConfig.type;

    switch (type) {
      case 'folder':
        return new FolderSync(
          publisherConfig,
          siteKey,
          pathHelper,
          outputConsole,
          windowAdapter,
          configurationProvider
        );

      case 'github':
        return new GithubSync(publisherConfig, siteKey, this.dependencies);

      case 'sysgit':
        return new SysgitSync(publisherConfig, siteKey, this.dependencies);

      default:
        throw new Error(`Unknown sync type: ${type}`);
    }
  }
}
