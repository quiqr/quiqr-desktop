/**
 * Model Watcher
 *
 * Watches the quiqr/model directory for changes and clears the workspace
 * configuration cache when files are added, changed, or removed.
 */

import chokidar, { type FSWatcher, type ChokidarOptions } from 'chokidar';
import path from 'path';
import type { WorkspaceConfigProvider } from './workspace-config-provider.js';

/**
 * Options for creating a ModelWatcher
 */
export interface ModelWatcherOptions {
  workspacePath: string;
  workspaceConfigProvider: WorkspaceConfigProvider;
  onCacheCleared?: () => void; // Optional callback for debugging/testing
}

/**
 * ModelWatcher - Watches model directory for changes
 *
 * When any file in {workspacePath}/quiqr/model changes,
 * it clears the WorkspaceConfigProvider cache.
 */
export class ModelWatcher {
  private watcher: FSWatcher | undefined;
  private workspacePath: string;
  private workspaceConfigProvider: WorkspaceConfigProvider;
  private onCacheCleared?: () => void;

  constructor(options: ModelWatcherOptions) {
    this.workspacePath = options.workspacePath;
    this.workspaceConfigProvider = options.workspaceConfigProvider;
    this.onCacheCleared = options.onCacheCleared;
  }

  /**
   * Start watching the model directory
   */
  start(): void {
    // Stop any existing watcher first
    this.stop();

    const watchDir = path.join(this.workspacePath, 'quiqr', 'model');

    const watchOptions: ChokidarOptions = {
      ignored: /(^|[/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true, // Don't fire events for existing files on startup
    };

    this.watcher = chokidar.watch(watchDir, watchOptions);

    const handleChange = () => {
      this.workspaceConfigProvider.clearCache();
      this.onCacheCleared?.();
    };

    this.watcher
      .on('add', handleChange)
      .on('change', handleChange)
      .on('unlink', handleChange);
  }

  /**
   * Stop watching and clean up resources
   */
  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = undefined;
    }
  }

  /**
   * Check if the watcher is currently active
   */
  isWatching(): boolean {
    return this.watcher !== undefined;
  }

  /**
   * Get the path being watched
   */
  getWatchPath(): string {
    return path.join(this.workspacePath, 'quiqr', 'model');
  }
}

/**
 * Factory function to create and start a ModelWatcher
 */
export function createModelWatcher(options: ModelWatcherOptions): ModelWatcher {
  const watcher = new ModelWatcher(options);
  watcher.start();
  return watcher;
}
