/**
 * Sysgit Sync Service
 *
 * Handles git-based sync using system git.
 * TODO: Full implementation in Phase 2.5.3 (Git Operations)
 *
 * For now, this is a stub that throws "Not yet implemented" for all operations.
 * Import/export functionality works because it uses Embgit directly, not SysgitSync.
 */

import type { PublConf } from '@quiqr/types';
import type { SyncService } from '../sync-factory.js';

/**
 * Sysgit sync configuration
 */
export interface SysgitSyncConfig {
  type: 'sysgit';
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
 * SysgitSync - Git-based sync using system git
 *
 * STUB IMPLEMENTATION - Full git sync coming in Phase 2.5.3
 */
export class SysgitSync implements SyncService {
  private config: SysgitSyncConfig;
  private siteKey: string;

  constructor(config: PublConf, siteKey: string) {
    this.config = config as SysgitSyncConfig;
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
      `SysgitSync.${action}: Not yet implemented. ` +
      `Full git sync functionality will be implemented in Phase 2.5.3. ` +
      `Note: Git-based imports work via Embgit directly.`
    );
  }
}
