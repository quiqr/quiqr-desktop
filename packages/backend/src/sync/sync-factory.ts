/**
 * Sync Factory
 *
 * Factory for creating sync service instances based on publisher configuration type.
 * Routes to the appropriate sync implementation (folder, github, sysgit).
 */

import type { PublConf } from '@quiqr/types';

/**
 * Generic sync service interface
 * All sync implementations must implement this interface
 */
export interface SyncService {
  actionDispatcher(action: string, parameters?: unknown): Promise<unknown>;
}

/**
 * SyncFactory creates sync service instances based on publisher configuration
 */
export class SyncFactory {
  /**
   * Get a sync service instance for the given publisher configuration
   *
   * @param publisherConfig - The publisher configuration (folder, github, or sysgit)
   * @param siteKey - The site key
   * @returns A sync service instance
   * @throws Error if the sync type is not implemented
   */
  getPublisher(publisherConfig: PublConf, siteKey: string): SyncService {
    const type = publisherConfig.type;

    try {
      // For now, delegate to old JavaScript implementations
      // These will be migrated to TypeScript in Phase 2.11
      const typePath = `../../../backend/src-main/sync/${type}/${type}-sync`;

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const SyncServiceClass = require(typePath);
      return new SyncServiceClass(publisherConfig, siteKey);
    } catch (e) {
      console.error(`ERR could not instantiate SyncService: ${type}`);
      console.error(e);
      throw new Error(`Failed to create sync service for type: ${type}`);
    }
  }
}
