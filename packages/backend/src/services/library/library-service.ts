/**
 * Library Service
 *
 * Service class containing utility functions for creating and manipulating unmounted sites.
 */

import type { SiteConfig } from '@quiqr/types';
import del from 'del';
import fs from 'fs-extra';
import path from 'path';
import type { AppContainer } from '../../config/index.js';
import type { HugoConfigFormat } from '../../hugo/hugo-utils.js';
import { InitialWorkspaceConfigBuilder } from '../workspace/initial-workspace-config-builder.js';

/**
 * Site configuration that can be written to disk (subset of SiteConfig)
 */
interface WritableSiteConfig {
  key: string;
  name: string;
  source: {
    type: string;
    path: string;
  };
  publish?: unknown[];
  lastPublish?: number;
  [key: string]: unknown;
}

/**
 * LibraryService handles site configuration management and site lifecycle operations
 */
export class LibraryService {
  private appContainer: AppContainer;

  constructor(appContainer: AppContainer) {
    this.appContainer = appContainer;
  }

  /**
   * Get a site configuration by its key
   *
   * @param siteKey - The unique key identifying the site
   * @returns The site configuration
   * @throws Error if site is not found
   */
  async getSiteConf(siteKey: string): Promise<SiteConfig> {
    const options = { invalidateCache: true };
    const configurations = await this.appContainer.configurationProvider.getConfigurations(
      options
    );
    const site = configurations.sites.find((x) => x.key === siteKey);

    if (!site) {
      throw new Error(`Could not find siteconf with sitekey ${siteKey}`);
    }

    return site;
  }

  /**
   * Check if a site configuration attribute value is already in use
   *
   * @param attr - The attribute name to check (e.g., 'key', 'name')
   * @param value - The value to check for duplicates
   * @returns True if duplicate exists, false otherwise
   */
  async checkDuplicateSiteConfAttrStringValue(
    attr: string,
    value: string
  ): Promise<boolean> {
    const options = { invalidateCache: false };
    const configurations = await this.appContainer.configurationProvider.getConfigurations(
      options
    );

    const duplicate = configurations.sites.find(
      (x) => x[attr as keyof SiteConfig]?.toString().toLowerCase() === value.toLowerCase()
    );

    return !!duplicate;
  }

  /**
   * Create a new Hugo site with Quiqr configuration
   *
   * @param siteName - The display name for the site
   * @param hugoVersion - The Hugo version to use
   * @param configFormat - The configuration file format (toml, yaml, json)
   * @returns The generated site key
   */
  async createNewHugoQuiqrSite(
    siteName: string,
    hugoVersion: string,
    configFormat: HugoConfigFormat
  ): Promise<string> {
    const siteKey = await this.createSiteKeyFromName(siteName);

    const pathSite = this.appContainer.pathHelper.getSiteRoot(siteKey);
    if (!pathSite) {
      throw new Error(`Could not create site root for siteKey: ${siteKey}`);
    }
    await fs.ensureDir(pathSite);

    const pathSource = path.join(pathSite, 'main');
    await this.appContainer.hugoUtils.createSiteDir(pathSource, siteName, configFormat);

    const configBuilder = new InitialWorkspaceConfigBuilder(
      pathSource,
      this.appContainer.formatResolver,
      this.appContainer.pathHelper
    );
    configBuilder.buildAll(hugoVersion);

    const newConf = this.createMountConfUnmanaged(siteKey, siteKey, pathSource);
    await fs.writeFile(
      this.appContainer.pathHelper.getSiteMountConfigPath(siteKey),
      JSON.stringify(newConf, null, 2),
      { encoding: 'utf8' }
    );

    return siteKey;
  }

  /**
   * Generate a unique site key from a site name
   *
   * @param name - The site name to convert to a key
   * @returns A unique, URL-safe site key
   */
  async createSiteKeyFromName(name: string): Promise<string> {
    let newKey = name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();

    const duplicate = await this.checkDuplicateSiteConfAttrStringValue('key', newKey);
    if (duplicate) {
      newKey = newKey + '-' + this.appContainer.pathHelper.randomPathSafeString(4);
    }

    return newKey;
  }

  /**
   * Create an unmanaged site mount configuration
   *
   * @param siteKey - The unique site key
   * @param siteName - The display name
   * @param pathSource - The source directory path
   * @returns Site configuration object
   */
  createMountConfUnmanaged(
    siteKey: string,
    siteName: string,
    pathSource: string
  ): WritableSiteConfig {
    return {
      key: siteKey,
      name: siteName,
      source: {
        type: 'folder',
        path: path.basename(pathSource), // Always relative from 30sep2024
      },
      publish: [],
      lastPublish: 0,
    };
  }

  /**
   * Create a new site from an existing temporary directory
   *
   * @param siteKey - The unique site key
   * @param tempDir - The temporary directory containing the site files
   */
  async createNewSiteWithTempDirAndKey(siteKey: string, tempDir: string): Promise<void> {
    const pathSite = this.appContainer.pathHelper.getSiteRoot(siteKey);
    if (!pathSite) {
      throw new Error(`Could not create site root for siteKey: ${siteKey}`);
    }

    const pathSource = path.join(pathSite, 'main');

    await fs.ensureDir(pathSite);
    await fs.move(tempDir, pathSource);

    const newConf = this.createMountConfUnmanaged(siteKey, siteKey, pathSource);
    await fs.writeFile(
      this.appContainer.pathHelper.getSiteMountConfigPath(siteKey),
      JSON.stringify(newConf, null, 2),
      { encoding: 'utf8' }
    );
  }

  /**
   * Remove invalid configuration keys that shouldn't be persisted
   *
   * @param conf - The configuration object to clean
   * @returns The cleaned configuration
   */
  private deleteInvalidConfKeys(conf: Record<string, unknown>): Record<string, unknown> {
    const cleanConf = { ...conf };
    delete cleanConf['configPath'];
    delete cleanConf['owner'];
    delete cleanConf['published'];
    delete cleanConf['publishKey'];
    delete cleanConf['etalage'];

    return cleanConf;
  }

  /**
   * Write a site configuration to disk
   *
   * @param newConf - The configuration to write
   * @param siteKey - The site key
   * @returns True on success
   */
  async writeSiteConf(newConf: Record<string, unknown>, siteKey: string): Promise<boolean> {
    let cleanConf = this.deleteInvalidConfKeys(newConf);

    // Ensure name field always exists - use key as fallback
    if (!cleanConf.name) {
      cleanConf.name = cleanConf.key || siteKey;
    }

    await fs.writeFile(
      this.appContainer.pathHelper.getSiteMountConfigPath(siteKey),
      JSON.stringify(cleanConf, null, 2),
      { encoding: 'utf8' }
    );

    return true;
  }

  /**
   * Delete a site and all its files
   *
   * @param siteKey - The site key to delete
   */
  async deleteSite(siteKey: string): Promise<void> {
    await fs.remove(this.appContainer.pathHelper.getSiteMountConfigPath(siteKey));

    const siteRoot = this.appContainer.pathHelper.getSiteRoot(siteKey);
    if (siteRoot) {
      await del([siteRoot], { force: true });
    }
  }
}
