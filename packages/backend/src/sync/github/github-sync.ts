/**
 * GitHub Sync Service
 *
 * Handles git-based sync with GitHub repositories.
 * TODO: Full implementation in Phase 2.5.3 (Git Operations)
 *
 * For now, this is a stub that throws "Not yet implemented" for all operations.
 * Import/export functionality works because it uses Embgit directly, not GithubSync.
 */

import type { PublConf } from '@quiqr/types';
import type { SyncService } from '../sync-factory.js';

/**
 * GitHub sync configuration
 */
export interface GithubSyncConfig {
  type: 'github';
  username?: string;
  email?: string;
  repository?: string;
  branch?: string;
  deployPrivateKey?: string;
  deployPublicKey?: string;
  publishScope?: 'build' | 'source';
  setGitHubActions?: boolean;
  overrideBaseURLSwitch?: boolean;
  overrideBaseURL?: string;
}

/**
 * GithubSync - Git-based sync with GitHub
 *
 * STUB IMPLEMENTATION - Full git sync coming in Phase 2.5.3
 */
export class GithubSync implements SyncService {
  private config: GithubSyncConfig;
  private siteKey: string;

  constructor(config: PublConf, siteKey: string) {
    this.config = config as GithubSyncConfig;
    this.siteKey = siteKey;
  }

  /**
   * Dispatch sync actions
   *
   * TODO: Implement in Phase 2.5.3
   * Actions: readRemote, refreshRemote, checkoutRef, pullFromRemote,
   *          hardPush, checkoutLatest, pushWithSoftMerge
   */
  async actionDispatcher(action: string, parameters?: unknown): Promise<unknown> {
    throw new Error(
      `GithubSync.${action}: Not yet implemented. ` +
      `Full git sync functionality will be implemented in Phase 2.5.3. ` +
      `Note: Git-based imports work via Embgit directly.`
    );
  }
}
