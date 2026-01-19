/**
 * Workspace Config Provider
 *
 * Loads, parses, validates, and caches workspace configuration files.
 * Handles includes, partials, and remote config merging.
 */

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import deepmerge from 'deepmerge';

/**
 * Convert Windows backslash paths to forward slashes for glob compatibility
 */
function toGlobPath(p: string): string {
  return p.replace(/\\/g, '/');
}
import { isRecord } from '../../utils/format-providers/types.js';
import { FormatProviderResolver } from '../../utils/format-provider-resolver.js';
import { WorkspaceConfigValidator, type WorkspaceConfig } from './workspace-config-validator.js';
import { InitialWorkspaceConfigBuilder } from './initial-workspace-config-builder.js';
import { FileCacheToken } from './file-cache-token.js';
import type { PathHelper, EnvironmentInfo } from '../../utils/path-helper.js';
import type { AppConfig } from '../../config/app-config.js';
import {
  type MergeableConfigItem,
  type PartialWorkspaceConfig,
  type MenuConfig,
  type Field,
} from '@quiqr/types';

/**
 * Parse information - tracks which files were used to build the config
 */
export interface ParseInfo {
  baseFile: string;
  includeFiles: Array<{ key: string; filename: string }>;
  includeFilesSub: Array<{ key: string; filename: string }>;
  partialFiles: Array<{ key: string; filename: string }>;
}

/**
 * Cache entry for workspace configurations
 */
interface CacheEntry {
  token: FileCacheToken;
  config: WorkspaceConfig;
}

/**
 * WorkspaceConfigProvider loads and manages workspace configuration
 * Uses dependency injection instead of global state
 */
export class WorkspaceConfigProvider {
  private cache: Record<string, CacheEntry> = {};
  private parseInfo: ParseInfo = {
    baseFile: '',
    includeFiles: [],
    includeFilesSub: [],
    partialFiles: [],
  };
  private formatProviderResolver: FormatProviderResolver;
  private pathHelper: PathHelper;
  private appConfig: AppConfig;
  private environmentInfo: EnvironmentInfo;

  constructor(
    formatProviderResolver: FormatProviderResolver,
    pathHelper: PathHelper,
    appConfig: AppConfig,
    environmentInfo: EnvironmentInfo
  ) {
    this.formatProviderResolver = formatProviderResolver;
    this.pathHelper = pathHelper;
    this.appConfig = appConfig;
    this.environmentInfo = environmentInfo;
  }

  /**
   * Clear the configuration cache
   */
  clearCache(): void {
    this.cache = {};
    this.parseInfo = {
      baseFile: '',
      includeFiles: [],
      includeFilesSub: [],
      partialFiles: [],
    };
  }

  /**
   * Read or create minimal model config for a workspace
   */
  async readOrCreateMinimalModelConfig(
    workspacePath: string,
    workspaceKey: string
  ): Promise<WorkspaceConfig> {
    let filePath = this.getQuiqrModelBasePath(workspacePath);

    this.parseInfo.baseFile = filePath || '';

    let token: FileCacheToken;

    if (filePath != null) {
      const cached = this.cache[filePath];
      token = await new FileCacheToken([filePath]).build();

      if (cached != null) {
        if (await cached.token.match(token)) {
          // can be reused
          return cached.config;
        }
      }
    } else {
      // File is missing > need to build default config and update cache
      // CREATE quiqr/model/base.yaml and some other default files
      const configBuilder = new InitialWorkspaceConfigBuilder(
        workspacePath,
        this.formatProviderResolver,
        this.pathHelper
      );
      filePath = configBuilder.buildAll();

      token = await new FileCacheToken([filePath]).build();
    }

    const config: WorkspaceConfig = await this._loadConfigurationsData(filePath, workspaceKey, workspacePath);
    config.path = workspacePath;
    config.key = workspaceKey;

    this.cache[filePath] = { token, config };
    return config;
  }

  /**
   * Get path of quiqr/model/base.{yaml|toml|json}
   */
  getQuiqrModelBasePath(workspacePath: string): string | undefined {
    const fileExpPrimary = path.join(
      workspacePath,
      'quiqr',
      'model',
      'base.{' + this.formatProviderResolver.allFormatsExt().join(',') + '}'
    );

    const primaryFiles = glob.sync(toGlobPath(fileExpPrimary));
    if (primaryFiles.length > 0) {
      return primaryFiles[0];
    }

    const fileExpFallback = path.join(
      workspacePath,
      'sukoh.{' + this.formatProviderResolver.allFormatsExt().join(',') + '}'
    );
    const fallbackFiles = glob.sync(toGlobPath(fileExpFallback));
    return fallbackFiles[0];
  }

  /**
   * Load configuration data from file
   */
  private async _loadConfigurationsData(
    filePath: string,
    workspaceKey: string,
    workspacePath: string
  ): Promise<WorkspaceConfig> {
    const strData = fs.readFileSync(filePath, 'utf8');
    let formatProvider = this.formatProviderResolver.resolveForFilePath(filePath);
    if (formatProvider == null) {
      formatProvider = this.formatProviderResolver.getDefaultFormat();
    }

    const dataPhase1Parse = formatProvider.parse(strData);
    if (!isRecord(dataPhase1Parse)) {
      throw new Error(`Invalid config file format: ${filePath} - expected object`);
    }
    const dataPhase2Merged = await this._postProcessConfigObject(dataPhase1Parse, workspacePath);

    // Validate and migrate the config using Zod schemas
    // The validator mutates the config to apply migrations (hugover -> ssgType/ssgVersion)
    const validator = new WorkspaceConfigValidator();
    const validationError = validator.validate(dataPhase2Merged as Partial<WorkspaceConfig>);
    if (validationError) {
      throw new Error(validationError);
    }

    // After successful validation, the config conforms to WorkspaceConfig
    // The cast is safe here because the validator has verified the structure
    return dataPhase2Merged as WorkspaceConfig;
  }

  /**
   * Ensure config object has required structure
   * Builds a PartialWorkspaceConfig with defaults for missing arrays
   */
  private configObjectSkeleton(configOrg: Record<string, unknown>): PartialWorkspaceConfig {
    return {
      ...configOrg,
      menu: Array.isArray(configOrg.menu) ? (configOrg.menu as MenuConfig) : [],
      collections: Array.isArray(configOrg.collections)
        ? (configOrg.collections as MergeableConfigItem[])
        : [],
      singles: Array.isArray(configOrg.singles)
        ? (configOrg.singles as MergeableConfigItem[])
        : [],
      dynamics: Array.isArray(configOrg.dynamics)
        ? (configOrg.dynamics as MergeableConfigItem[])
        : [],
    };
  }

  /**
   * Post-process config object: load includes and merge partials
   */
  private async _postProcessConfigObject(
    configOrg: Record<string, unknown>,
    workspacePath: string
  ): Promise<PartialWorkspaceConfig> {
    let config = this.configObjectSkeleton(configOrg);

    // LOAD AND MERGE INCLUDES
    const siteModelIncludes = path.join(
      workspacePath,
      'quiqr',
      'model',
      'includes',
      '*.{' + this.formatProviderResolver.allFormatsExt().join(',') + '}'
    );
    config = this._loadIncludes(config, siteModelIncludes, true);

    const siteModelIncludesSingles = path.join(
      workspacePath,
      'quiqr',
      'model',
      'includes',
      'singles',
      '*.{' + this.formatProviderResolver.allFormatsExt().join(',') + '}'
    );
    config = this._loadIncludesSub('singles', config, siteModelIncludesSingles, true);

    const siteModelIncludesCollections = path.join(
      workspacePath,
      'quiqr',
      'model',
      'includes',
      'collections',
      '*.{' + this.formatProviderResolver.allFormatsExt().join(',') + '}'
    );
    config = this._loadIncludesSub('collections', config, siteModelIncludesCollections, true);

    const siteModelIncludesMenus = path.join(
      workspacePath,
      'quiqr',
      'model',
      'includes',
      'menus',
      '*.{' + this.formatProviderResolver.allFormatsExt().join(',') + '}'
    );
    config = this._loadIncludesSub('menu', config, siteModelIncludesMenus, true);

    const dogFoodIncludes = path.join(
      this.pathHelper.getApplicationResourcesDir(this.environmentInfo),
      'all',
      'dog_food_model/includes',
      '*.{' + this.formatProviderResolver.allFormatsExt().join(',') + '}'
    );
    config = this._loadIncludes(config, dogFoodIncludes, false);

    // MERGE PARTIALS
    const mergedDataCollections = await Promise.all(
      config.collections.map((x) => this.getMergePartialResult(x, workspacePath))
    );
    config.collections = mergedDataCollections;

    const mergedDataSingles = await Promise.all(
      config.singles.map((x) => this.getMergePartialResult(x, workspacePath))
    );
    config.singles = mergedDataSingles;

    const mergedDataDynamics = await Promise.all(
      config.dynamics.map((x) => this.getMergePartialResult(x, workspacePath))
    );
    config.dynamics = mergedDataDynamics;

    // CLEANUP
    if (config.menu.length < 1) delete (config as Partial<PartialWorkspaceConfig>).menu;
    if (config.collections.length < 1) delete (config as Partial<PartialWorkspaceConfig>).collections;
    if (config.singles.length < 1) delete (config as Partial<PartialWorkspaceConfig>).singles;
    if (config.dynamics.length < 1) delete (config as Partial<PartialWorkspaceConfig>).dynamics;

    return config;
  }

  /**
   * Get merge partial result
   */
  async getMergePartialResult(
    mergeKey: MergeableConfigItem,
    workspacePath: string
  ): Promise<MergeableConfigItem> {
    const result = await this._mergePartials(mergeKey, workspacePath);
    return result;
  }

  /**
   * Get remote partials cache directory
   */
  partialRemoteCacheDir(workspacePath: string): string {
    return path.join(workspacePath, 'quiqr', 'model', 'partialsRemoteCache');
  }

  /**
   * Create remote partials cache directory
   */
  createPartialsRemoteCacheDir(workspacePath: string): string {
    const filePartialDir = this.partialRemoteCacheDir(workspacePath);
    fs.ensureDirSync(filePartialDir);
    return filePartialDir;
  }

  /**
   * Load includes and merge into config object
   * Handles both object includes (merged by key) and array includes (for collections, singles, menu, dynamics)
   */
  private _loadIncludes(
    configObject: PartialWorkspaceConfig,
    fileIncludes: string,
    showInParseInfo: boolean
  ): PartialWorkspaceConfig {
    const files = glob.sync(toGlobPath(fileIncludes));

    const newObject: Record<string, unknown> = {};
    // Track array includes separately to merge with existing arrays
    const arrayKeys = ['collections', 'singles', 'dynamics', 'menu'];

    files.forEach((filename) => {
      const strData = fs.readFileSync(filename, 'utf8');
      let formatProvider = this.formatProviderResolver.resolveForFilePath(filename);
      if (formatProvider == null) {
        formatProvider = this.formatProviderResolver.getDefaultFormat();
      }
      const mergeData = formatProvider.parse(strData);
      const key = path.parse(filename).name;

      if (showInParseInfo) {
        this.parseInfo.includeFiles.push({ key, filename });
      }

      // Handle array includes (collections.yaml, singles.yaml, menu.yaml, dynamics.yaml)
      if (Array.isArray(mergeData) && arrayKeys.includes(key)) {
        const existingArray = configObject[key];
        if (Array.isArray(existingArray)) {
          // Concatenate with existing array
          newObject[key] = [...existingArray, ...mergeData];
        } else {
          newObject[key] = mergeData;
        }
        return;
      }

      // Handle object includes (merged by key)
      if (!isRecord(mergeData)) {
        return;
      }

      const existingValue = configObject[key];
      newObject[key] = deepmerge(
        mergeData,
        isRecord(existingValue) ? existingValue : {}
      );
    });

    return { ...configObject, ...newObject };
  }

  /**
   * Load sub-includes (singles, collections, menus)
   */
  private _loadIncludesSub(
    modelType: keyof Pick<PartialWorkspaceConfig, 'singles' | 'collections' | 'menu'>,
    configObject: PartialWorkspaceConfig,
    fileIncludes: string,
    showInParseInfo: boolean
  ): PartialWorkspaceConfig {
    const files = glob.sync(toGlobPath(fileIncludes));

    const newObject = { ...configObject };

    files.forEach((filename) => {
      const strData = fs.readFileSync(filename, 'utf8');
      let formatProvider = this.formatProviderResolver.resolveForFilePath(filename);
      if (formatProvider == null) {
        formatProvider = this.formatProviderResolver.getDefaultFormat();
      }

      const mergeDataSub = formatProvider.parse(strData);

      if (showInParseInfo) {
        this.parseInfo.includeFilesSub.push({ key: modelType, filename: filename });
      }

      if (modelType === 'menu') {
        // Menu items are MenuSection objects
        newObject.menu.push(mergeDataSub as MenuConfig[number]);
      } else {
        // Singles and collections are MergeableConfigItem objects
        newObject[modelType].push(mergeDataSub as MergeableConfigItem);
      }
    });

    return newObject;
  }

  /**
   * Get encoded destination path for remote partials
   */
  getEncodedDestinationPath(
    filePartialDir: string,
    mergeKey: MergeableConfigItem & { _mergePartial: string }
  ): string {
    const encodeFilename = encodeURIComponent(mergeKey._mergePartial);
    return path.join(filePartialDir, encodeFilename);
  }

  /**
   * Type guard to check if a config item has _mergePartial property
   */
  private hasMergePartial(
    item: MergeableConfigItem
  ): item is MergeableConfigItem & { _mergePartial: string } {
    return '_mergePartial' in item && typeof item._mergePartial === 'string';
  }

  /**
   * Merge partials into configuration
   */
  private async _mergePartials(
    mergeKey: MergeableConfigItem,
    workspacePath: string
  ): Promise<MergeableConfigItem> {
    if (!this.hasMergePartial(mergeKey)) {
      return mergeKey;
    }

    let filePartial = '';

    if (mergeKey._mergePartial.startsWith('file://')) {
      filePartial = this.getEncodedDestinationPath(
        this.createPartialsRemoteCacheDir(workspacePath),
        mergeKey
      );

      if (this.appConfig.disablePartialCache || !fs.existsSync(filePartial)) {
        await fs.copy(mergeKey._mergePartial.substring(7), filePartial);
      }
    } else if (
      mergeKey._mergePartial.startsWith('http://') ||
      mergeKey._mergePartial.startsWith('https://')
    ) {
      filePartial = this.getEncodedDestinationPath(
        this.createPartialsRemoteCacheDir(workspacePath),
        mergeKey
      );

      if (this.appConfig.disablePartialCache || !fs.existsSync(filePartial)) {
        await this._getRemotePartial(mergeKey._mergePartial, filePartial);
      }
    } else if (mergeKey._mergePartial.startsWith('dogfood_site://')) {
      const filePartialPattern = path.join(
        this.pathHelper.getApplicationResourcesDir(this.environmentInfo),
        'all',
        'dog_food_model',
        'partials',
        mergeKey._mergePartial.slice(15) +
          '.{' +
          this.formatProviderResolver.allFormatsExt().join(',') +
          '}'
      );
      const files = glob.sync(toGlobPath(filePartialPattern));
      if (files.length > 0) {
        filePartial = files[0];
      }
    } else {
      const filePartialPattern = path.join(
        workspacePath,
        'quiqr',
        'model',
        'partials',
        mergeKey._mergePartial + '.{' + this.formatProviderResolver.allFormatsExt().join(',') + '}'
      );
      const files = glob.sync(toGlobPath(filePartialPattern));
      if (files.length > 0) {
        filePartial = files[0];
      }
    }

    if (filePartial && fs.existsSync(filePartial)) {
      if (!mergeKey._mergePartial.startsWith('dogfood_site://')) {
        this.parseInfo.partialFiles.push({ key: mergeKey.key, filename: filePartial });
      }

      const strData = await fs.readFile(filePartial, 'utf8');
      let formatProvider = this.formatProviderResolver.resolveForFilePath(filePartial);
      if (formatProvider == null) {
        formatProvider = this.formatProviderResolver.getDefaultFormat();
      }
      const mergeData = formatProvider.parse(strData);

      if (!isRecord(mergeData)) {
        throw new Error(`Invalid partial file format: ${filePartial}`);
      }

      // Merge partial data with base config
      // mergeKey (base config) takes precedence over mergeData (partial) for duplicate field keys
      const newData = deepmerge(mergeData, mergeKey) as MergeableConfigItem;

      // REMOVE DUPLICATE FIELDS - PREFER FIELDS FROM BASE CONFIG OVER PARTIAL FIELDS
      // Both singleConfig and collectionConfig have optional fields arrays
      // If a field key exists in both, the base config version is kept
      const fields = newData.fields;
      if (fields && Array.isArray(fields)) {
        const typedFields = fields as Field[];
        const deduped = typedFields
          .reverse()
          .filter(
            (field: Field, index: number, self: Field[]) =>
              index === self.findIndex((t) => t.key === field.key)
          );
        // RESTORE ORIGINAL ORDER
        newData.fields = deduped.reverse();
      }

      // ONLY WHEN MERGE WAS SUCCESSFUL DELETE THE KEY TO PREVENT ERROR.
      delete newData._mergePartial;

      return newData;
    }

    return mergeKey;
  }

  /**
   * Fetch remote partial from URL
   */
  private async _getRemotePartial(url: string, destination: string): Promise<string> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch remote partial: ${response.status} ${response.statusText}`);
      }

      const data = await response.text();
      fs.writeFileSync(destination, data);
      return destination;
    } catch (err) {
      if (err instanceof Error) {
        console.log(`Error fetching remote partial from ${url}: ${err.message}`);
      } else {
        console.log('Unknown error fetching remote partial:', err);
      }
      throw err;
    }
  }

  /**
   * Get model parse information
   */
  getModelParseInfo(): ParseInfo {
    return this.parseInfo;
  }

  getEnvironmentInfo(): EnvironmentInfo {
    return this.environmentInfo;
  }
}
