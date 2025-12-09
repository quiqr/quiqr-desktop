/**
 * Folder Sync Service
 *
 * Syncs built site to a local folder (no git operations).
 * Used for local deployments or simple file-based publishing.
 */

import path from 'path';
import fs from 'fs-extra';
import type { PublConf } from '@quiqr/types';
import type { SyncService, SyncServiceDependencies, SyncProgressCallback } from '../sync-factory.js';
import type { PathHelper } from '../../utils/path-helper.js';
import type { OutputConsole, WindowAdapter } from '../../adapters/types.js';
import type { ConfigurationDataProvider } from '../../services/configuration/index.js';
import { recurForceRemove } from '../../utils/file-dir-utils.js';

/**
 * Configuration specific to folder sync
 */
export interface FolderSyncConfig {
  type: 'folder';
  path?: string;
  publishScope: 'build' | 'source';
  overrideBaseURLSwitch?: boolean;
  overrideBaseURL?: string;
}

/**
 * FolderSync - Syncs site to a local folder
 */
export class FolderSync implements SyncService {
  private config: FolderSyncConfig;
  private siteKey: string;
  private pathHelper: PathHelper;
  private outputConsole: OutputConsole;
  private windowAdapter: WindowAdapter;
  private configurationProvider: ConfigurationDataProvider;
  private progressCallback?: SyncProgressCallback;

  constructor(
    config: PublConf,
    siteKey: string,
    dependencies: SyncServiceDependencies
  ) {
    this.config = config as FolderSyncConfig;
    this.siteKey = siteKey;
    this.pathHelper = dependencies.pathHelper;
    this.outputConsole = dependencies.outputConsole;
    this.windowAdapter = dependencies.windowAdapter;
    this.configurationProvider = dependencies.configurationProvider;
    this.progressCallback = dependencies.progressCallback;
  }

  /**
   * Dispatch sync actions
   */
  async actionDispatcher(action: string, parameters?: unknown): Promise<unknown> {
    switch (action) {
      case 'pullFromRemote':
        return this.pullFastForwardMerge();
      case 'pushToRemote':
        return this.publish();
      default:
        throw new Error(`Action not implemented: ${action}`);
    }
  }

  /**
   * Pull from remote (sync from destination to source)
   */
  private async pullFastForwardMerge(): Promise<string> {
    if (!this.config.path) {
      throw new Error('Folder sync path is not configured');
    }

    const configurations = await this.configurationProvider.getConfigurations({});
    const site = configurations.sites.find((x) => x.key === this.siteKey);

    if (!site || !site.source?.path) {
      throw new Error(`Site not found or invalid source path: ${this.siteKey}`);
    }

    await this.ensureSyncDir(site.source.path);
    await this.syncSourceToDestination(this.config.path, site.source.path);

    return 'reset-and-pulled-from-remote';
  }

  /**
   * Publish to remote (sync from source to destination)
   */
  private async publish(): Promise<boolean> {
    if (!this.config.path) {
      throw new Error('Folder sync path is not configured');
    }

    const destPath = this.config.path!; // Non-null assertion - checked above
    await this.ensureSyncDir(destPath);

    const from = this.pathHelper.getLastBuildDir();
    if (!from) {
      throw new Error('Could not determine last build directory');
    }

    this.outputConsole.appendLine('START FOLDER SYNC');
    this.outputConsole.appendLine('-----------------');
    this.outputConsole.appendLine('  from is:     ' + from);
    this.outputConsole.appendLine('');
    this.outputConsole.appendLine('  destination path:    ' + destPath);
    this.outputConsole.appendLine('  override BaseURL:    ' + (this.config.overrideBaseURL || ''));
    this.outputConsole.appendLine('-----------------');
    this.outputConsole.appendLine('');

    this.sendProgress('Prepare files before uploading..', 30);

    if (this.config.publishScope === 'build') {
      await this.publishBuild(destPath, from);
    } else {
      await this.publishSource(destPath, from);
    }

    return true;
  }

  /**
   * Publish built files only
   */
  private async publishBuild(fullDestinationPath: string, from: string): Promise<boolean> {
    await this.syncSourceToDestination(path.join(from, 'public'), fullDestinationPath);
    await this.removeUnwanted(fullDestinationPath);
    this.outputConsole.appendLine('prepare and sync finished');
    return true;
  }

  /**
   * Publish source files
   */
  private async publishSource(fullDestinationPath: string, from: string): Promise<boolean> {
    await this.syncSourceToDestination(from, fullDestinationPath);
    await this.removeUnwanted(fullDestinationPath);

    if (this.config.publishScope === 'source') {
      await recurForceRemove(path.join(fullDestinationPath, 'public'));
    }

    await fs.ensureDir(path.join(fullDestinationPath, 'static'));

    this.outputConsole.appendLine('prepare and sync finished');
    return true;
  }

  /**
   * Remove unwanted files from destination
   */
  private async removeUnwanted(fullDestinationPath: string): Promise<void> {
    await recurForceRemove(path.join(fullDestinationPath, '.quiqr-cache'));
    await recurForceRemove(path.join(fullDestinationPath, '.gitlab-ci.yml'));
    await recurForceRemove(path.join(fullDestinationPath, '.gitignore'));
    await recurForceRemove(path.join(fullDestinationPath, '.sukoh'));
    await recurForceRemove(path.join(fullDestinationPath, '.hugo_build.lock'));
    await recurForceRemove(path.join(fullDestinationPath, '.git'));
  }

  /**
   * Sync source to destination
   */
  private async syncSourceToDestination(
    sourcePath: string,
    fullDestinationPath: string
  ): Promise<void> {
    await fs.copy(sourcePath, fullDestinationPath);
    this.outputConsole.appendLine('synced source to destination ...');
  }

  /**
   * Ensure sync directory is clean and ready
   */
  private async ensureSyncDir(dir: string): Promise<string> {
    await fs.ensureDir(dir);
    await fs.emptyDir(dir);
    await fs.ensureDir(dir);
    return dir;
  }

  /**
   * Send progress update via SSE callback or fall back to window adapter
   */
  private sendProgress(message: string, progress: number): void {
    if (this.progressCallback) {
      this.progressCallback(message, progress);
    } else {
      this.windowAdapter.sendToRenderer('updateProgress', { message, progress });
    }
  }
}
