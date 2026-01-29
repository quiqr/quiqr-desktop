/**
 * Site Service
 *
 * Service for managing sites and workspaces, including listing workspaces,
 * mounting workspaces, and handling publisher actions.
 */

import type { SiteConfig, Workspace, PublConf } from '@quiqr/types';
import type { SiteSource } from '../../site-sources/site-source-factory.js';
import type { SyncFactory } from '../../sync/sync-factory.js';

/**
 * SiteService handles workspace operations and publisher routing for a specific site
 */
export class SiteService {
  private config: SiteConfig;
  private siteSourceFactory: { get(key: string, config: unknown): SiteSource };
  private syncFactory: SyncFactory;

  constructor(
    config: SiteConfig,
    siteSourceFactory: { get(key: string, config: unknown): SiteSource },
    syncFactory: SyncFactory
  ) {
    this.config = config;
    this.siteSourceFactory = siteSourceFactory;
    this.syncFactory = syncFactory;
  }

  /**
   * Get the site source instance for this site
   * @private
   */
  private getSiteSource(): SiteSource {
    // If no source configuration exists, create a default folder source
    // with "main" as the default workspace path
    const sourceConfig = this.config.source || {
      type: 'folder' as const,
      path: 'main'
    };

    return this.siteSourceFactory.get(this.config.key, sourceConfig);
  }

  /**
   * List all workspaces for this site
   *
   * @returns Array of workspace objects
   */
  async listWorkspaces(): Promise<Workspace[]> {
    return this.getSiteSource().listWorkspaces();
  }

  /**
   * Get the workspace head info for a specific workspace
   *
   * @param workspaceKey - The workspace key to find
   * @returns The workspace object or undefined if not found
   */
  async getWorkspaceHead(workspaceKey: string): Promise<Workspace | undefined> {
    const workspaces = await this.listWorkspaces();
    return workspaces.find((x) => x.key === workspaceKey);
  }

  /**
   * Get the site configuration
   *
   * @returns The site configuration object
   */
  getSiteConfig(): SiteConfig {
    return this.config;
  }

  /**
   * Mount a workspace for editing
   *
   * @param workspaceKey - The workspace key to mount
   */
  async mountWorkspace(workspaceKey: string): Promise<void> {
    await this.getSiteSource().mountWorkspace(workspaceKey);
  }

  /**
   * Find the first matching item in array by key, or return default
   *
   * @param arr - Array to search
   * @param key - Key to search for
   * @returns The found item
   * @throws Error if no match found and no default available
   * @private
   */
  private findFirstMatchOrDefault<T extends { key?: string | null }>(
    arr: T[] | undefined,
    key?: string
  ): T {
    let result: T | undefined;

    if (key) {
      result = (arr || []).find((x) => x.key === key);
      if (result) return result;
    }

    result = (arr || []).find((x) => x.key === 'default' || x.key === '' || x.key == null);
    if (result) return result;

    if (arr !== undefined && arr.length === 1) {
      return arr[0];
    }

    if (key) {
      throw new Error(`Could not find a config for key "${key}" and a default value was not available.`);
    } else {
      throw new Error(`Could not find a default config.`);
    }
  }

  /**
   * Dispatch an action to a publisher
   *
   * @param publishConfig - The publish configuration
   * @param action - The action to dispatch
   * @param actionParameters - Parameters for the action
   * @returns The result from the publisher
   */
  async publisherDispatchAction(
    publishConfig: PublConf,
    action: string,
    actionParameters?: unknown,
    workspaceKey?: string
  ): Promise<unknown> {
    // Use provided workspaceKey or fall back to "main"
    const wsKey = workspaceKey || "main";
    const publisher = this.syncFactory.getPublisher(publishConfig, this.config.key, wsKey);
    return await publisher.actionDispatcher(action, actionParameters);
  }
}
