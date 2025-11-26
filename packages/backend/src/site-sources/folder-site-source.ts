/**
 * Folder Site Source - Minimal stub for MVP
 *
 * Represents a site stored in a local folder.
 * This is a minimal implementation to get the adapter working.
 */

import type { Workspace } from '@quiqr/types';
import type { SiteSource, SourceConfig } from './site-source-factory.js';

export class FolderSiteSource implements SiteSource {
  private config: SourceConfig;

  constructor(config: SourceConfig) {
    this.config = config;
    console.log('[FolderSiteSource] Created for:', config.key, config.path);
  }

  async listWorkspaces(): Promise<Workspace[]> {
    console.log('[FolderSiteSource] listWorkspaces stub called');
    // TODO: Implement actual workspace discovery
    // For now, return a single default workspace
    return [
      {
        key: 'main',
        path: this.config.path,
        state: 'ready'
      }
    ];
  }

  async mountWorkspace(workspaceKey: string): Promise<void> {
    console.log('[FolderSiteSource] mountWorkspace stub called:', workspaceKey);
    // TODO: Implement workspace mounting logic
    // For now, just log it
  }

  async update(): Promise<void> {
    console.log('[FolderSiteSource] update stub called');
    // TODO: Implement update logic (git pull, etc.)
  }
}
