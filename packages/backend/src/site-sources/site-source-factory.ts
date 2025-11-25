/**
 * Site Source Factory
 *
 * Factory for creating site source instances based on source configuration type.
 * Currently supports 'folder' type sources.
 */

import type { Workspace } from '@quiqr/types';

/**
 * Source configuration for a site
 */
export interface SourceConfig {
  type: string;
  path: string;
  key?: string;
  [key: string]: unknown;
}

/**
 * Generic site source interface
 * All site source implementations must implement this interface
 */
export interface SiteSource {
  listWorkspaces(): Promise<Workspace[]>;
  mountWorkspace(workspaceKey: string): Promise<void>;
  update?(): Promise<void>;
}

/**
 * SiteSourceFactory creates site source instances based on source configuration
 */
export class SiteSourceFactory {
  /**
   * Get a site source instance for the given configuration
   *
   * @param key - The site key
   * @param config - The source configuration
   * @returns A site source instance
   * @throws Error if the source type is not implemented
   */
  get(key: string, config: SourceConfig): SiteSource {
    const Type = this.getType(config);
    return new Type({ ...config, key });
  }

  /**
   * Get the site source class for the given configuration
   *
   * @param config - The source configuration
   * @returns The site source class constructor
   * @throws Error if the source type is not implemented
   */
  private getType(config: SourceConfig): new (config: SourceConfig) => SiteSource {
    const type = config.type.toLowerCase();

    if (type === 'folder') {
      // For now, delegate to old JavaScript implementation
      // This will be migrated to TypeScript in a future phase
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const FolderSiteSource = require('../../../backend/src-main/site-sources/folder-site-source');
      return FolderSiteSource;
    } else {
      throw new Error(`Site source (${config.type}) not implemented.`);
    }
  }
}
