/**
 * Configuration Data Provider
 *
 * Discovers, loads, and caches site configurations from the filesystem.
 * Handles automatic migrations for legacy configs and etalage data loading.
 *
 * Migrated from: backend/src-main/app-prefs-state/configuration-data-provider.js
 */

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import type { PathHelper } from '../../utils/path-helper.js';
import type { FormatProviderResolver } from '../../utils/format-provider-resolver.js';
import { isRecord } from '../../utils/format-providers/types.js';
import { siteConfigSchema } from '@quiqr/types/schemas';
import type { SiteConfig, Configurations } from '@quiqr/types';

/**
 * Extended site config with runtime properties added during loading
 */
export interface RuntimeSiteConfig extends SiteConfig {
  configPath: string;
  published: string;
}

/**
 * Etalage data structure (showcase metadata for a site)
 */
interface EtalageData {
  screenshots: string[];
  favicons: string[];
  [key: string]: unknown; // Allow additional properties from etalage.json
}

/**
 * Logger interface for output
 */
interface Logger {
  appendLine(message: string): void;
}

/**
 * ConfigurationDataProvider loads and caches site configurations
 */
export class ConfigurationDataProvider {
  private cache?: Configurations;
  private pathHelper: PathHelper;
  private formatResolver: FormatProviderResolver;
  private logger: Logger;

  constructor(
    pathHelper: PathHelper,
    formatResolver: FormatProviderResolver,
    logger: Logger
  ) {
    this.pathHelper = pathHelper;
    this.formatResolver = formatResolver;
    this.logger = logger;
  }

  /**
   * Invalidate the configuration cache
   */
  invalidateCache(): void {
    this.cache = undefined;
  }

  /**
   * Get all site configurations (async)
   * @param options - Optional invalidateCache flag
   */
  async getConfigurations(options: { invalidateCache?: boolean } = {}): Promise<Configurations> {
    if (options.invalidateCache) {
      this.cache = undefined;
    }

    if (this.cache) {
      return this.cache;
    }

    const root = this.pathHelper.getRoot();

    // Search patterns for site configs
    const sitePathPattern = path.join(root, 'sites', '*/config.json').replace(/\\/gi, '/');
    const oldSitePathPattern = path.join(root, 'config.*.json').replace(/\\/gi, '/');

    // Find all config files
    const files = [
      ...(await glob(sitePathPattern)),
      ...(await glob(oldSitePathPattern))
    ].map(x => path.normalize(x));

    const sites: RuntimeSiteConfig[] = [];

    for (const conffile of files) {
      if (!fs.existsSync(conffile)) {
        continue;
      }

      try {
        // Read and parse the config file
        const strData = fs.readFileSync(conffile, { encoding: 'utf-8' });
        const formatProvider = this.formatResolver.resolveForFilePath(conffile);

        if (!formatProvider) {
          throw new Error(`Could not resolve a format provider for file ${conffile}.`);
        }

        let site = formatProvider.parse(strData) as SiteConfig;
        let needsMigration = false;

        // Migration: Ensure name field exists - use key as fallback
        if (!site.name && site.key) {
          site.name = site.key;
          needsMigration = true;
          this.logger.appendLine(`Migration: Added missing 'name' field to '${conffile}'`);
        }

        // Migration: Ensure source field exists - use default folder source
        if (!site.source) {
          site.source = {
            type: 'folder',
            path: 'main'
          };
          needsMigration = true;
          this.logger.appendLine(`Migration: Added missing 'source' field to '${conffile}'`);
        }

        // Save the migrated config back to disk
        if (needsMigration) {
          try {
            fs.writeFileSync(conffile, JSON.stringify(site, null, 2), { encoding: 'utf8' });
            this.logger.appendLine(`Migrated site config '${conffile}'`);
          } catch (writeErr) {
            this.logger.appendLine(
              `Warning: Could not save migrated config '${conffile}': ${writeErr instanceof Error ? writeErr.message : String(writeErr)}`
            );
          }
        }

        // Validate the site config with Zod
        const validatedSite = siteConfigSchema.parse(site);

        // Convert relative paths to absolute
        if (validatedSite.source) {
          validatedSite.source.path = this.siteSourceRelativeToAbsolute(
            validatedSite,
            conffile
          );
        }

        // Add runtime properties
        const runtimeSite: RuntimeSiteConfig = {
          ...validatedSite,
          published: 'unknown',
          configPath: conffile,
          etalage: this.getEtalage(validatedSite)
        };

        sites.push(runtimeSite);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        this.logger.appendLine(`Configuration file is invalid '${conffile}': ${errorMsg}`);
      }
    }

    const configurations: Configurations = { sites };
    this.cache = configurations;

    return configurations;
  }

  /**
   * Get a single site configuration by key
   */
  async getSiteConfig(siteKey: string): Promise<RuntimeSiteConfig | null> {
    const configurations = await this.getConfigurations();
    const site = configurations.sites.find(s => s.key === siteKey);
    return site ? (site as RuntimeSiteConfig) : null;
  }

  /**
   * Convert relative site source paths to absolute paths
   */
  private siteSourceRelativeToAbsolute(site: SiteConfig, conffile: string): string {
    if (!site.source) {
      return '';
    }

    const sourcePath = site.source.path;

    // If path is already absolute (starts with /), return as-is
    if (sourcePath.substring(0, 1) === '/') {
      return sourcePath;
    }

    // Otherwise, resolve relative to site directory
    const siteKey = path.basename(path.dirname(conffile));
    return path.join(this.pathHelper.getRoot(), 'sites', siteKey, sourcePath);
  }

  /**
   * Load etalage data (showcase metadata) for a site
   */
  private getEtalage(site: SiteConfig): EtalageData {
    if (!site.source) {
      return { screenshots: [], favicons: [] };
    }

    const sourcePath = site.source.path;
    const etalagePath = path.join(sourcePath, 'quiqr/etalage/etalage.json');
    const etalageScreenshotsPath = path.join(sourcePath, 'quiqr/etalage/screenshots/');
    const etalageFaviconPath = path.join(sourcePath, 'quiqr/etalage/favicon/');

    let etalage: EtalageData = {
      screenshots: [],
      favicons: []
    };

    // Load etalage.json if it exists
    if (fs.existsSync(etalagePath)) {
      try {
        const strData = fs.readFileSync(etalagePath, { encoding: 'utf-8' });
        const formatProvider = this.formatResolver.resolveForFilePath(etalagePath);
        if (formatProvider) {
          const parsed = formatProvider.parse(strData);
          if (isRecord(parsed)) {
            etalage = { ...etalage, ...parsed };
          }
        }
      } catch (e) {
        this.logger.appendLine(
          `Warning: Could not load etalage.json for site: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    }

    // Find screenshot files
    try {
      const screenshotPattern = path.join(etalageScreenshotsPath, '*.{png,jpg,jpeg,gif}').replace(/\\/gi, '/');
      const screenshotFiles = glob.sync(screenshotPattern).map(x => {
        const normalized = path.normalize(x);
        return normalized.substr(sourcePath.length);
      });
      etalage.screenshots = screenshotFiles;
    } catch (e) {
      // Ignore glob errors (directory doesn't exist, etc.)
    }

    // Find favicon files
    try {
      const faviconPattern = path.join(etalageFaviconPath, '*.{png,jpg,jpeg,gif,ico}').replace(/\\/gi, '/');
      const faviconFiles = glob.sync(faviconPattern).map(x => {
        const normalized = path.normalize(x);
        return normalized.substr(sourcePath.length);
      });
      etalage.favicons = faviconFiles;
    } catch (e) {
      // Ignore glob errors (directory doesn't exist, etc.)
    }

    return etalage;
  }
}

/**
 * Simple console logger adapter
 */
export class ConsoleLogger implements Logger {
  appendLine(message: string): void {
    console.log(message);
  }
}
