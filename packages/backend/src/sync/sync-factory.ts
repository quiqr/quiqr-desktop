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
import { GitSync } from './git/git-sync.js';

/**
 * Generic sync service interface
 * All sync implementations must implement this interface
 */
export interface SyncService {
  actionDispatcher(action: string, parameters?: unknown): Promise<unknown>;
}

/**
 * Progress callback for streaming sync progress via SSE
 */
export type SyncProgressCallback = (message: string, progress: number) => void;

/**
 * Dependencies required by sync services
 */
export interface SyncServiceDependencies {
  pathHelper: PathHelper;
  outputConsole: OutputConsole;
  windowAdapter: WindowAdapter;
  configurationProvider: ConfigurationDataProvider;
  embgit: Embgit;
  /** Optional callback for streaming progress updates (used by SSE endpoints) */
  progressCallback?: SyncProgressCallback;
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
   * @param progressCallback - Optional callback for streaming progress (overrides default)
   * @returns A sync service instance
   * @throws Error if the sync type is not implemented or dependencies not set
   */
  getPublisher(
    publisherConfig: PublConf,
    siteKey: string,
    progressCallback?: SyncProgressCallback
  ): SyncService {
    if (!this.dependencies) {
      throw new Error('SyncFactory dependencies not set. Call setDependencies() first.');
    }

    // Create dependencies with optional progress callback override
    const deps: SyncServiceDependencies = {
      ...this.dependencies,
      progressCallback: progressCallback ?? this.dependencies.progressCallback,
    };

    const type = publisherConfig.type;

    switch (type) {
      case 'folder':
        return new FolderSync(publisherConfig, siteKey, deps);

      case 'github':
        return new GithubSync(publisherConfig, siteKey, deps);

      case 'sysgit':
        return new SysgitSync(publisherConfig, siteKey, deps);

      case 'git':
        return new GitSync(publisherConfig, siteKey, deps);

      default:
        throw new Error(`Unknown sync type: ${type}`);
    }
  }
}
