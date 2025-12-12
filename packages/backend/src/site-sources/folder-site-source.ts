/**
 * Folder Site Source
 *
 * Represents a site stored in local folders.
 * Each subdirectory in the site root can be a workspace (e.g., 'main', 'staging', 'develop').
 */

import fs from 'fs-extra';
import path from 'path';
import type { Workspace } from '@quiqr/types';
import type { PathHelper } from '../utils/path-helper.js';
import type { SiteSource, SourceConfig } from './site-source-factory.js';

/**
 * Directories to exclude when discovering workspaces
 */
const EXCLUDED_DIRS = [
  '.git',
  '.quiqr-cache',
  'node_modules',
  'publish',
  'temp',
  '.DS_Store'
];

export class FolderSiteSource implements SiteSource {
  private config: SourceConfig;
  private pathHelper: PathHelper;

  constructor(config: SourceConfig, pathHelper: PathHelper) {
    this.config = config;
    this.pathHelper = pathHelper;
    // console.log('[FolderSiteSource] Created for:', config.key, config.path);
  }

  /**
   * Get the absolute path to the site root directory
   */
  private getSiteRootPath(): string {
    const siteRoot = this.pathHelper.getSiteRoot(this.config.key || '');
    if (!siteRoot) {
      throw new Error(`Could not determine site root for key: ${this.config.key}`);
    }
    return siteRoot;
  }

  /**
   * Get the absolute path to a specific workspace
   */
  private getWorkspacePath(workspaceKey: string): string {
    return path.join(this.getSiteRootPath(), workspaceKey);
  }

  /**
   * Check if a directory is a valid workspace directory
   */
  private async isValidWorkspace(dirPath: string): Promise<boolean> {
    try {
      const stat = await fs.lstat(dirPath);
      if (!stat.isDirectory()) {
        return false;
      }

      // Check if it contains typical Hugo/Quarto files
      const hugoConfigExists = await this.hasHugoConfig(dirPath);
      const quiqrDirExists = await fs.pathExists(path.join(dirPath, 'quiqr'));
      const contentDirExists = await fs.pathExists(path.join(dirPath, 'content'));

      // A valid workspace should have at least one of these
      return hugoConfigExists || quiqrDirExists || contentDirExists;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if directory has a Hugo configuration file
   */
  private async hasHugoConfig(dirPath: string): Promise<boolean> {
    const configFiles = [
      'config.toml',
      'config.yaml',
      'config.yml',
      'config.json',
      'hugo.toml',
      'hugo.yaml',
      'hugo.yml',
      'hugo.json'
    ];

    for (const configFile of configFiles) {
      if (await fs.pathExists(path.join(dirPath, configFile))) {
        return true;
      }
    }
    return false;
  }

  /**
   * List all workspaces in the site root directory
   */
  async listWorkspaces(): Promise<Workspace[]> {
    //console.log('[FolderSiteSource] Discovering workspaces for site:', this.config.key);

    try {
      const siteRoot = this.getSiteRootPath();

      // Check if site root exists
      if (!await fs.pathExists(siteRoot)) {
        console.warn('[FolderSiteSource] Site root does not exist:', siteRoot);
        return [];
      }

      // Read all entries in the site root
      const entries = await fs.readdir(siteRoot);

      const workspaces: Workspace[] = [];

      // Check each entry to see if it's a valid workspace
      for (const entry of entries) {
        // Skip excluded directories and files
        if (EXCLUDED_DIRS.includes(entry)) {
          continue;
        }

        // Skip files (config.json, etc.)
        if (entry.includes('.')) {
          continue;
        }

        const entryPath = path.join(siteRoot, entry);

        // Check if it's a valid workspace directory
        if (await this.isValidWorkspace(entryPath)) {
          workspaces.push({
            key: entry,
            path: entryPath,
            state: 'ready'
          });
        }
      }

      // If no workspaces found, check if the configured path itself is a workspace
      if (workspaces.length === 0 && this.config.path) {
        const configuredPath = this.getWorkspacePath(this.config.path);
        if (await this.isValidWorkspace(configuredPath)) {
          workspaces.push({
            key: this.config.path,
            path: configuredPath,
            state: 'ready'
          });
        }
      }

      //console.log('[FolderSiteSource] Found', workspaces.length, 'workspace(s)');
      return workspaces;
    } catch (error) {
      //console.error('[FolderSiteSource] Error discovering workspaces:', error);
      return [];
    }
  }

  /**
   * Mount a workspace (preparation for editing)
   * For folder sources, this is typically a no-op as workspaces are already accessible
   */
  async mountWorkspace(workspaceKey: string): Promise<void> {
    console.log('[FolderSiteSource] Mounting workspace:', workspaceKey);

    try {
      const workspacePath = this.getWorkspacePath(workspaceKey);

      // Verify workspace exists
      if (!await fs.pathExists(workspacePath)) {
        throw new Error(`Workspace '${workspaceKey}' does not exist at path: ${workspacePath}`);
      }

      // Verify it's a valid workspace
      if (!await this.isValidWorkspace(workspacePath)) {
        throw new Error(`Directory '${workspaceKey}' is not a valid workspace`);
      }

      console.log('[FolderSiteSource] Workspace mounted successfully:', workspaceKey);
    } catch (error) {
      console.error('[FolderSiteSource] Error mounting workspace:', error);
      throw error;
    }
  }

  /**
   * Update workspace from source (e.g., git pull)
   * For simple folder sources, this checks if the folder is a git repository
   * and performs a git pull if so.
   */
  async update(): Promise<void> {
    console.log('[FolderSiteSource] Updating workspaces for site:', this.config.key);

    try {
      const siteRoot = this.getSiteRootPath();

      // Check if the site root is a git repository
      const gitDir = path.join(siteRoot, '.git');
      const isGitRepo = await fs.pathExists(gitDir);

      if (isGitRepo) {
        console.log('[FolderSiteSource] Site is a git repository - update should use git sync');
        // Note: Actual git operations should be handled by the SyncFactory/GitSync
        // This is just a marker that update is possible
      } else {
        console.log('[FolderSiteSource] Site is not a git repository - no update needed');
      }
    } catch (error) {
      console.error('[FolderSiteSource] Error during update:', error);
      throw error;
    }
  }
}
