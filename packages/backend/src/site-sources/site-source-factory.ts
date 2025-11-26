/**
 * Site Source Factory
 *
 * Factory for creating site source instances based on source configuration type.
 * Currently supports 'folder' type sources.
 */

import type { Workspace } from '@quiqr/types';
import type { PathHelper } from '../utils/path-helper.js';
import { FolderSiteSource } from './folder-site-source.js';

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
  private pathHelper: PathHelper;

  constructor(pathHelper: PathHelper) {
    this.pathHelper = pathHelper;
  }

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
    return new Type({ ...config, key }, this.pathHelper);
  }

  /**
   * Get the site source class for the given configuration
   *
   * @param config - The source configuration
   * @returns The site source class constructor
   * @throws Error if the source type is not implemented
   */
  private getType(config: SourceConfig): new (config: SourceConfig, pathHelper: PathHelper) => SiteSource {
    const type = config.type.toLowerCase();

    if (type === 'folder') {
      // Use new ESM implementation
      return FolderSiteSource;
    } else {
      throw new Error(`Site source (${config.type}) not implemented.`);
    }
  }
}
