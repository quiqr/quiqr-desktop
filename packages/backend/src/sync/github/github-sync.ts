/**
 * GitHub Sync Service
 *
 * Handles git-based sync with GitHub repositories using embgit.
 * Extends EmbgitSyncBase with GitHub-specific URL construction.
 */

import type { PublConf } from '@quiqr/types';
import type { SyncServiceDependencies } from '../sync-factory.js';
import { EmbgitSyncBase, type BaseSyncConfig } from '../embgit-sync-base.js';

/**
 * GitHub sync configuration
 */
export interface GithubSyncConfig extends BaseSyncConfig {
  type: 'github';
  username: string;
  repository: string;
}

/**
 * GithubSync - Git-based sync with GitHub
 */
export class GithubSync extends EmbgitSyncBase {
  protected override config: GithubSyncConfig;

  constructor(config: PublConf, siteKey: string, dependencies: SyncServiceDependencies) {
    super(config, siteKey, dependencies);
    this.config = config as GithubSyncConfig;
  }

  /**
   * Get the GitHub SSH URL
   */
  getGitUrl(): string {
    return `git@github.com:${this.config.username}/${this.config.repository}.git`;
  }

  /**
   * Get the log prefix for console output
   */
  getLogPrefix(): string {
    return 'GITHUB';
  }
}
