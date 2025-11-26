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
import type { FormatProvider } from '../../utils/format-providers/types.js';
import { FormatProviderResolver } from '../../utils/format-provider-resolver.js';
import { WorkspaceConfigValidator, type WorkspaceConfig } from './workspace-config-validator.js';
import { InitialWorkspaceConfigBuilder } from './initial-workspace-config-builder.js';
import { FileCacheToken } from './file-cache-token.js';
import type { PathHelper, EnvironmentInfo } from '../../utils/path-helper.js';
import type { AppConfig } from '../../config/app-config.js';
import type { SingleConfig, CollectionConfig } from '@quiqr/types';

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

    let config: WorkspaceConfig;
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

    config = await this._loadConfigurationsData(filePath, workspaceKey, workspacePath);
    (config as any).path = workspacePath;
    (config as any).key = workspaceKey;

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

    const primaryFiles = glob.sync(fileExpPrimary);
    if (primaryFiles.length > 0) {
      return primaryFiles[0];
    }

    const fileExpFallback = path.join(
      workspacePath,
      'sukoh.{' + this.formatProviderResolver.allFormatsExt().join(',') + '}'
    );
    const fallbackFiles = glob.sync(fileExpFallback);
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
    const dataPhase2Merged = await this._postProcessConfigObject(dataPhase1Parse, workspacePath);

    const validator = new WorkspaceConfigValidator();
    const result = validator.validate(dataPhase2Merged);
    if (result) {
      throw new Error(result);
    }

    return dataPhase2Merged as WorkspaceConfig;
  }

  /**
   * Ensure config object has required structure
   */
  private configObjectSkeleton(configOrg: any): any {
    if (configOrg) {
      if (!configOrg.menu) configOrg.menu = [];
      if (!configOrg.collections) configOrg.collections = [];
      if (!configOrg.singles) configOrg.singles = [];
      if (!configOrg.dynamics) configOrg.dynamics = [];
    }
    return configOrg;
  }

  /**
   * Post-process config object: load includes and merge partials
   */
  private async _postProcessConfigObject(configOrg: any, workspacePath: string): Promise<any> {
    configOrg = this.configObjectSkeleton(configOrg);

    // LOAD AND MERGE INCLUDES
    const siteModelIncludes = path.join(
      workspacePath,
      'quiqr',
      'model',
      'includes',
      '*.{' + this.formatProviderResolver.allFormatsExt().join(',') + '}'
    );
    configOrg = this._loadIncludes(configOrg, siteModelIncludes, true);

    const siteModelIncludesSingles = path.join(
      workspacePath,
      'quiqr',
      'model',
      'includes',
      'singles',
      '*.{' + this.formatProviderResolver.allFormatsExt().join(',') + '}'
    );
    configOrg = this._loadIncludesSub('singles', configOrg, siteModelIncludesSingles, true);

    const siteModelIncludesCollections = path.join(
      workspacePath,
      'quiqr',
      'model',
      'includes',
      'collections',
      '*.{' + this.formatProviderResolver.allFormatsExt().join(',') + '}'
    );
    configOrg = this._loadIncludesSub('collections', configOrg, siteModelIncludesCollections, true);

    const siteModelIncludesMenus = path.join(
      workspacePath,
      'quiqr',
      'model',
      'includes',
      'menus',
      '*.{' + this.formatProviderResolver.allFormatsExt().join(',') + '}'
    );
    configOrg = this._loadIncludesSub('menu', configOrg, siteModelIncludesMenus, true);

    const dogFoodIncludes = path.join(
      this.pathHelper.getApplicationResourcesDir(this.environmentInfo),
      'all',
      'dog_food_model/includes',
      '*.{' + this.formatProviderResolver.allFormatsExt().join(',') + '}'
    );
    configOrg = this._loadIncludes(configOrg, dogFoodIncludes, false);

    // MERGE PARTIALS
    const mergedDataCollections = await Promise.all(
      configOrg.collections.map((x: any) => this.getMergePartialResult(x, workspacePath))
    );
    configOrg.collections = mergedDataCollections;

    const mergedDataSingles = await Promise.all(
      configOrg.singles.map((x: any) => this.getMergePartialResult(x, workspacePath))
    );
    configOrg.singles = mergedDataSingles;

    const mergedDataDynamics = await Promise.all(
      configOrg.dynamics.map((x: any) => this.getMergePartialResult(x, workspacePath))
    );
    configOrg.dynamics = mergedDataDynamics;

    // CLEANUP
    if (configOrg.menu.length < 1) delete configOrg['menu'];
    if (configOrg.collections.length < 1) delete configOrg['collections'];
    if (configOrg.singles.length < 1) delete configOrg['singles'];
    if (configOrg.dynamics.length < 1) delete configOrg['dynamics'];

    return configOrg;
  }

  /**
   * Get merge partial result
   */
  async getMergePartialResult(mergeKey: any, workspacePath: string): Promise<any> {
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
   */
  private _loadIncludes(configObject: any, fileIncludes: string, showInParseInfo: boolean): any {
    const files = glob.sync(fileIncludes);

    const newObject: any = {};

    files.forEach((filename) => {
      const strData = fs.readFileSync(filename, 'utf8');
      let formatProvider = this.formatProviderResolver.resolveForFilePath(files[0]);
      if (formatProvider == null) {
        formatProvider = this.formatProviderResolver.getDefaultFormat();
      }
      const mergeData = formatProvider.parse(strData);

      if (showInParseInfo) {
        this.parseInfo.includeFiles.push({ key: path.parse(filename).name, filename: filename });
      }

      newObject[path.parse(filename).name] = deepmerge(
        mergeData,
        configObject[path.parse(filename).name] || {}
      );
    });

    return { ...configObject, ...newObject };
  }

  /**
   * Load sub-includes (singles, collections, menus)
   */
  private _loadIncludesSub(
    modelType: string,
    configObject: any,
    fileIncludes: string,
    showInParseInfo: boolean
  ): any {
    const files = glob.sync(fileIncludes);

    const newObject: any = { ...configObject };

    files.forEach((filename) => {
      const strData = fs.readFileSync(filename, 'utf8');
      let formatProvider = this.formatProviderResolver.resolveForFilePath(files[0]);
      if (formatProvider == null) {
        formatProvider = this.formatProviderResolver.getDefaultFormat();
      }

      const mergeDataSub = formatProvider.parse(strData);

      if (showInParseInfo) {
        this.parseInfo.includeFilesSub.push({ key: modelType, filename: filename });
      }

      newObject[modelType].push(mergeDataSub);
    });

    return newObject;
  }

  /**
   * Get encoded destination path for remote partials
   */
  getEncodedDestinationPath(filePartialDir: string, mergeKey: any): string {
    const encodeFilename = encodeURIComponent(mergeKey._mergePartial);
    return path.join(filePartialDir, encodeFilename);
  }

  /**
   * Merge partials into configuration
   */
  private async _mergePartials(mergeKey: any, workspacePath: string): Promise<any> {
    if (!('_mergePartial' in mergeKey)) {
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
      const files = glob.sync(filePartialPattern);
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
      const files = glob.sync(filePartialPattern);
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
      // Merge partial data with base config
      // mergeKey (base config) takes precedence over mergeData (partial) for duplicate field keys
      const newData = deepmerge(mergeData, mergeKey) as SingleConfig | CollectionConfig;

      // REMOVE DUPLICATE FIELDS - PREFER FIELDS FROM BASE CONFIG OVER PARTIAL FIELDS
      // Both singleConfig and collectionConfig have optional fields arrays
      // If a field key exists in both, the base config version is kept
      if (newData.fields && Array.isArray(newData.fields)) {
        newData.fields = newData.fields
          .reverse()
          .filter(
            (field: any, index: number, self: any[]) =>
              index === self.findIndex((t: any) => t.key === field.key)
          );
        // RESTORE ORIGINAL ORDER
        newData.fields = newData.fields.reverse();
      }

      mergeKey = newData;

      // ONLY WHEN MERGE WAS SUCCESSFUL DELETE THE KEY TO PREVENT ERROR.
      delete mergeKey['_mergePartial'];
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
      console.log(err);
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
