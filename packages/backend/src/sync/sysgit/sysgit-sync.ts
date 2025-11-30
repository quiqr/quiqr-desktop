/**
 * Sysgit Sync Service
 *
 * Handles git-based sync using custom git server URLs via embgit.
 * Extends EmbgitSyncBase with custom URL handling.
 */

import type { PublConf } from '@quiqr/types';
import type { SyncServiceDependencies } from '../sync-factory.js';
import { EmbgitSyncBase, type BaseSyncConfig } from '../embgit-sync-base.js';

/**
 * Sysgit sync configuration
 */
export interface SysgitSyncConfig extends BaseSyncConfig {
  type: 'sysgit';
  git_server_url: string;
  repository: string;
}

/**
 * SysgitSync - Git-based sync using custom git server URL
 */
export class SysgitSync extends EmbgitSyncBase {
  protected override config: SysgitSyncConfig;

  constructor(config: PublConf, siteKey: string, dependencies: SyncServiceDependencies) {
    super(config, siteKey, dependencies);
    this.config = config as SysgitSyncConfig;
  }

  /**
   * Get the custom git server URL
   */
  getGitUrl(): string {
    return this.config.git_server_url;
  }

  /**
   * Get the log prefix for console output
   */
  getLogPrefix(): string {
    return 'SYSGIT';
  }
}
