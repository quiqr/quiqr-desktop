/**
 * Workspace Service
 *
 * Manages workspace operations including:
 * - Configuration management
 * - Content operations (singles, collections, data files)
 * - Build and serve operations
 * - File operations and bundle management
 * - Image operations and thumbnails
 */

import path from 'path';
import { glob } from 'glob';
import fs from 'fs-extra';
import fssimple from 'fs';
import fm from 'front-matter';
import { promisify } from 'util';
import type { WorkspaceConfigProvider, ParseInfo } from './workspace-config-provider.js';
import type { FormatProviderResolver } from '../../utils/format-provider-resolver.js';
import type { FormatProvider, ParsedContent } from '../../utils/format-providers/types.js';
import { isContentFile, SUPPORTED_CONTENT_EXTENSIONS } from '../../utils/content-formats.js';
import type { PathHelper } from '../../utils/path-helper.js';
import { recurForceRemove } from '../../utils/file-dir-utils.js';
import { createThumbnailJob } from '../../jobs/index.js';
import { BuildActionService, type BuildActionResult } from '../../build-actions/index.js';
import { SITE_CATEGORIES } from '../../logging/index.js';
import type { CollectionConfig, ExtraBuildConfig, BuildConfig, ServeConfig } from '@quiqr/types';
import { frontMatterContentSchema } from '@quiqr/types';
import type { WorkspaceConfig } from './workspace-config-validator.js';
import type { AppConfig } from '../../config/app-config.js';
import type { AppState } from '../../config/app-state.js';
import type { AppContainer } from '../../config/container.js';
import type { ProviderFactory } from '../../ssg-providers/provider-factory.js';
import type { SSGDevServer, SSGServerConfig, SSGBuildConfig } from '../../ssg-providers/types.js';
import { WindowAdapter, OutputConsole, ScreenshotWindowManager, ShellAdapter } from '../../adapters/types.js';
import { isValidToString } from '../../sync/embgit-sync-base.js';

/**
 * Dependencies required by WorkspaceService
 */
export interface WorkspaceServiceDependencies {
  workspaceConfigProvider: WorkspaceConfigProvider;
  formatProviderResolver: FormatProviderResolver;
  pathHelper: PathHelper;
  appConfig: AppConfig;
  appState: AppState;
  providerFactory: ProviderFactory;
  windowAdapter: WindowAdapter;
  shellAdapter: ShellAdapter;
  outputConsole: OutputConsole;
  screenshotWindowManager: ScreenshotWindowManager;
  buildActionService: BuildActionService;
  container: AppContainer;
}

/**
 * Collection item metadata
 */
export interface CollectionItem {
  key: string;
  label: string;
  sortval?: string | null;
}

/**
 * Resource file in a content bundle
 */
export interface ResourceFile {
  src: string;
  __deleted?: boolean;
}

/**
 * Build action configuration
 */
export interface BuildActionConfig {
  key: string;
  execute: string;
}

/**
 * Collection item creation result
 */
export interface CollectionItemCreateResult {
  key?: string;
  unavailableReason?: 'already-exists';
}

/**
 * Collection item rename result
 */
export interface CollectionItemRenameResult {
  renamed: boolean;
  item?: CollectionItem;
}

/**
 * Collection item copy result
 */
export interface CollectionItemCopyResult {
  copied: boolean;
  item?: CollectionItem;
}

/**
 * Hugo language configuration
 */
export interface HugoLanguage {
  lang: string;
  source: string;
}

/**
 * WorkspaceService - Main service for workspace operations
 */
export class WorkspaceService {
  private workspacePath: string;
  private workspaceKey: string;
  private siteKey: string;
  private workspaceConfigProvider: WorkspaceConfigProvider;
  private formatProviderResolver: FormatProviderResolver;
  private pathHelper: PathHelper;
  private appConfig: AppConfig;
  private appState: AppState;
  private providerFactory: ProviderFactory;
  private windowAdapter: WindowAdapter;
  private shellAdapter: ShellAdapter;
  private outputConsole: OutputConsole;
  private screenshotWindowManager: ScreenshotWindowManager;
  private buildActionService: BuildActionService;
  private container: AppContainer;
  private currentDevServer?: SSGDevServer;
  private currentSSGType?: string;

  constructor(
    workspacePath: string,
    workspaceKey: string,
    siteKey: string,
    dependencies: WorkspaceServiceDependencies
  ) {
    this.workspacePath = workspacePath;
    this.workspaceKey = workspaceKey;
    this.siteKey = siteKey;
    this.workspaceConfigProvider = dependencies.workspaceConfigProvider;
    this.formatProviderResolver = dependencies.formatProviderResolver;
    this.pathHelper = dependencies.pathHelper;
    this.appConfig = dependencies.appConfig;
    this.appState = dependencies.appState;
    this.providerFactory = dependencies.providerFactory;
    this.windowAdapter = dependencies.windowAdapter;
    this.shellAdapter = dependencies.shellAdapter;
    this.outputConsole = dependencies.outputConsole;
    this.screenshotWindowManager = dependencies.screenshotWindowManager;
    this.buildActionService = dependencies.buildActionService;
    this.container = dependencies.container;
  }

  /**
   * Get the workspace path
   */
  getWorkspacePath(): string {
    return this.workspacePath;
  }

  /**
   * Get the workspace configurations data to be used by the client
   */
  async getConfigurationsData(): Promise<WorkspaceConfig> {
    return this.workspaceConfigProvider.readOrCreateMinimalModelConfig(
      this.workspacePath,
      this.workspaceKey
    );
  }

  /**
   * Clear configurations data cache
   */
  clearConfigurationsDataCache(): void {
    this.workspaceConfigProvider.clearCache();
  }

  /**
   * Get creator message from workspace
   */
  async getCreatorMessage(): Promise<string> {
    const indexPath = path.join(this.workspacePath, 'quiqr', 'home', 'index.md');
    try {
      if (fs.existsSync(indexPath)) {
        const data = await fs.readFile(indexPath, 'utf8');
        const obj = await this._smartParse(indexPath, ['md'], data);
        // TODO: probably move this validation to when we parse the data
        if (typeof obj === 'object' && obj !== null && 'mainContent' in obj && isValidToString(obj.mainContent)) {
          return obj.mainContent.toString();
        } else {
          return data;
        }
      }
    } catch (err) {
      console.error(err);
      console.error('error checking');
    }
    return '';
  }

  /**
   * Get model parse info
   */
  async getModelParseInfo(): Promise<ParseInfo> {
    await this.workspaceConfigProvider.readOrCreateMinimalModelConfig(
      this.workspacePath,
      this.workspaceKey
    );
    return this.workspaceConfigProvider.getModelParseInfo();
  }

  /**
   * Smart resolve format provider for a file
   */
  private async _smartResolveFormatProvider(
    filePath: string,
    fallbacks?: string[]
  ): Promise<FormatProvider | undefined> {
    let formatProvider: FormatProvider | undefined;

    if (isContentFile(filePath)) {
      if (fs.existsSync(filePath)) {
        const resolved = await this.formatProviderResolver.resolveForMdFilePromise(filePath);
        if (resolved) formatProvider = resolved;
      }
    } else {
      const resolved = this.formatProviderResolver.resolveForFilePath(filePath);
      if (resolved) formatProvider = resolved;
    }

    if (formatProvider) {
      return formatProvider;
    }

    if (fallbacks) {
      for (let i = 0; i < fallbacks.length; i++) {
        if (fallbacks[i]) {
          const resolved = this.formatProviderResolver.resolveForExtension(fallbacks[i]);
          if (resolved) {
            return resolved;
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Smart dump object to string using appropriate format provider
   */
  private async _smartDump(
    filePath: string,
    formatFallbacks: string[],
    obj: ParsedContent
  ): Promise<string> {
    let formatProvider = await this._smartResolveFormatProvider(filePath, formatFallbacks);
    if (formatProvider === undefined || formatProvider === null) {
      formatProvider = this.formatProviderResolver.getDefaultFormat();
    }
    if (isContentFile(filePath)) {
      return formatProvider.dumpContent(obj);
    } else {
      return formatProvider.dump(obj);
    }
  }

  /**
   * Smart parse string to object using appropriate format provider
   */
  private async _smartParse(
    filePath: string,
    formatFallbacks: string[],
    str: string
  ): Promise<ParsedContent | unknown> {
    if (!str || str.length === 0 || !/\S/.test(str)) {
      return {};
    }
    if (isContentFile(filePath)) {
      if (formatFallbacks) {
        formatFallbacks.push('yaml');
      }
    }
    const formatProvider = await this._smartResolveFormatProvider(filePath, formatFallbacks);
    if (formatProvider === undefined) {
      console.log('formatprovider undefined');
      return {};
    }

    if (isContentFile(filePath)) {
      return formatProvider.parseFromMdFileString(str);
    } else {
      return formatProvider.parse(str);
    }
  }

  /**
   * Get a single content item
   */
  async getSingle(singleKey: string, fileOverride?: string): Promise<unknown> {
    const config = await this.getConfigurationsData();

    const single = config.singles.find((x) => x.key === singleKey);
    if (single == null) throw new Error('Could not find single.');
    
    if (!single.file && !fileOverride) {
      throw new Error(`Single '${singleKey}' has no file configured`);
    }

    let fileLastPath = single.file || '';

    if (typeof fileOverride === 'string' && fileOverride.length > 0) {
      fileLastPath = fileOverride;
    }

    const filePath = path.join(this.workspacePath, fileLastPath);

    if (fs.existsSync(filePath)) {
      const data = await fs.readFile(filePath, 'utf8');

      let obj = await this._smartParse(
        filePath,
        [path.extname(single.file || fileLastPath).replace('.', '')],
        data
      );

      if (typeof single.pullOuterRootKey === 'string') {
        const newObj: Record<string, unknown> = {};
        newObj[single.pullOuterRootKey] = obj;
        obj = newObj;
      }

      return obj;
    } else {
      return {};
    }
  }

  /**
   * Get the folder containing a single
   */
  async getSingleFolder(singleKey: string): Promise<string> {
    const config = await this.getConfigurationsData();
    const single = config.singles.find((x) => x.key === singleKey);
    if (single == null) throw new Error('Could not find single.');
    if (!single.file) throw new Error(`Single '${singleKey}' has no file configured`);
    const filePath = path.join(this.workspacePath, single.file);

    const directory = path.dirname(filePath);

    if (fs.existsSync(directory)) {
      return directory;
    } else {
      return '';
    }
  }

  /**
   * Open a single in external editor
   */
  async openSingleInEditor(singleKey: string): Promise<void> {
    const config = await this.getConfigurationsData();
    const single = config.singles.find((x) => x.key === singleKey);
    if (single == null) throw new Error('Could not find single.');
    if (!single.file) throw new Error(`Single '${singleKey}' has no file configured`);
    const filePath = path.join(this.workspacePath, single.file);
    await this.shellAdapter.openPath(filePath);
  }

  /**
   * Update a single content item
   */
  async updateSingle(singleKey: string, document: Record<string, unknown>): Promise<unknown> {
    const config = await this.getConfigurationsData();
    const single = config.singles.find((x) => x.key === singleKey);
    if (single == null) throw new Error('Could not find single.');
    if (!single.file) throw new Error(`Single '${singleKey}' has no file configured`);
    const filePath = path.join(this.workspacePath, single.file);

    // Log update start
    this.container.logger.infoSite(
      this.siteKey,
      this.workspaceKey,
      SITE_CATEGORIES.CONTENT,
      'Single document update started',
      { singleKey, filePath }
    );

    try {
      const directory = path.dirname(filePath);

      if (!fs.existsSync(directory)) fs.mkdirSync(directory); // ensure directory existence

      let documentClone = JSON.parse(JSON.stringify(document));

      if (typeof single.pullOuterRootKey === 'string') {
        documentClone = documentClone[single.pullOuterRootKey];
      }

      this._stripNonDocumentData(documentClone);

      const stringData = await this._smartDump(
        filePath,
        [path.extname(single.file).replace('.', '')],
        documentClone
      );
      fs.writeFileSync(filePath, stringData);

      // Log success
      this.container.logger.infoSite(
        this.siteKey,
        this.workspaceKey,
        SITE_CATEGORIES.CONTENT,
        'Single document updated',
        { singleKey, filePath }
      );

      return document;
    } catch (error) {
      // Log error
      this.container.logger.errorSite(
        this.siteKey,
        this.workspaceKey,
        SITE_CATEGORIES.CONTENT,
        'Single document update failed',
        { 
          singleKey, 
          filePath, 
          error: error instanceof Error ? error.message : String(error) 
        }
      );
      throw error;
    }
  }

  /**
   * Get files from an absolute path
   */
  async getFilesFromAbsolutePath(filePath: string): Promise<ResourceFile[]> {
    const directory = path.join(this.workspacePath, filePath);

    const globExp = '*';
    const allFiles = await glob(globExp, {
      nodir: true,
      absolute: false,
      cwd: directory,
    });

    const expression = `_?index[.](${SUPPORTED_CONTENT_EXTENSIONS.join('|')})$`;
    const pageOrSectionIndexReg = new RegExp(expression);
    const filtered = allFiles.filter((x) => !pageOrSectionIndexReg.test(x));

    const merged = filtered.map((src) => ({ src }));

    return merged;
  }

  /**
   * Get resources from content bundle
   */
  async getResourcesFromContent(
    filePath: string,
    currentResources: ResourceFile[] = [],
    targetPath: string | null = null
  ): Promise<ResourceFile[]> {
    filePath = path.normalize(filePath);
    const directory = path.dirname(filePath);

    let globExp = '*';
    if (targetPath) {
      globExp = targetPath + '/*';
    }

    const allFiles = await glob(globExp, {
      nodir: true,
      absolute: false,
      cwd: directory,
    });

    const expression = `_?index[.](${SUPPORTED_CONTENT_EXTENSIONS.join('|')})$`;
    const pageOrSectionIndexReg = new RegExp(expression);
    const filtered = allFiles.filter((x) => !pageOrSectionIndexReg.test(x));

    const merged = filtered.map((src) => {
      return Object.assign({ src }, currentResources.find((r) => r.src === src));
    });
    return merged;
  }

  /**
   * Get a collection item
   */
  async getCollectionItem(collectionKey: string, collectionItemKey: string): Promise<unknown> {
    const config = await this.getConfigurationsData();
    const collection = config.collections.find((x) => x.key === collectionKey);
    if (collection == null) throw new Error('Could not find collection.');
    const filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
    if (await fs.exists(filePath)) {
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        throw new Error(`EISDIR: illegal operation on a directory, read: ${filePath}`);
      }
      const data = await fs.readFile(filePath, { encoding: 'utf8' });
      const obj = await this._smartParse(filePath, [collection.extension], data);

      return obj;
    } else {
      return undefined;
    }
  }

  /**
   * Create a new collection item
   */
  async createCollectionItemKey(
    collectionKey: string,
    collectionItemKey: string,
    itemTitle: string
  ): Promise<CollectionItemCreateResult> {
    const config = await this.getConfigurationsData();
    const collection = config.collections.find((x) => x.key === collectionKey);
    if (collection == null) throw new Error('Could not find collection.');
    let filePath: string;
    let returnedKey: string;
    if (collection.folder.startsWith('content')) {
      returnedKey = path.join(collectionItemKey, 'index.' + collection.extension);
      filePath = path.join(this.workspacePath, collection.folder, returnedKey);
    } else {
      returnedKey = collectionItemKey + '.' + collection.extension;
      filePath = path.join(this.workspacePath, collection.folder, returnedKey);
    }
    if (fs.existsSync(filePath)) return { unavailableReason: 'already-exists' };

    await fs.ensureDir(path.dirname(filePath));
    const stringData = await this._smartDump(filePath, [collection.dataformat], {
      title: itemTitle,
    });
    await fs.writeFile(filePath, stringData, { encoding: 'utf8' });

    return { key: returnedKey.replace(/\\/g, '/') };
  }

  /**
   * List collection items
   */
  async listCollectionItems(collectionKey: string): Promise<CollectionItem[]> {
    const collection = (await this.getConfigurationsData()).collections.find(
      (x) => x.key === collectionKey
    );

    if (collection == null) throw new Error('Could not find collection.');
    const folder = path.join(this.workspacePath, collection.folder).replace(/\\/g, '/');

    const supportedContentExt = ['md', 'html', 'markdown', 'qmd'];
    if (
      collection.folder.startsWith('content') ||
      supportedContentExt.indexOf(collection.extension) !== -1
    ) {
      // WHEN WE WANT TO IGNORE _index.md front pages
      let subDirStars = '**';
      if ('includeSubdirs' in collection && collection.includeSubdirs === false) {
        subDirStars = '';
      }

      let globExpression = path.join(
        folder,
        `${subDirStars}/*.{${supportedContentExt.join(',')}}`
      ).replace(/\\/g, '/');

      // WHEN WE WANT TO IGNORE _index.md front pages
      if ('hideIndex' in collection && collection.hideIndex === true) {
        globExpression = path.join(
          folder,
          `${subDirStars}/!(_index).{${supportedContentExt.join(',')}}`
        ).replace(/\\/g, '/');
      }

      const files = await glob(globExpression, {});
      const retFiles = files.map(function (item) {
        // Use path.posix.relative: both `item` (from glob) and `folder` are
        // already normalised to forward slashes, so posix relative gives a
        // reliable cross-platform relative key even when the drive-letter case
        // differs on Windows (which would silently break a string .replace()).
        const key = path.posix.relative(folder, item);
        const label = key.replace(/^\/?(.+)\/[^/]+$/, '$1');

        let sortval: string | null = null;
        if ('sortkey' in collection && collection.sortkey) {
          const data = fssimple.readFileSync(item, 'utf8');
          const rawContent = fm(data);
          const parseResult = frontMatterContentSchema.safeParse(rawContent);

          if (parseResult.success && collection.sortkey in parseResult.data.attributes) {
            sortval = String(parseResult.data.attributes[collection.sortkey]);
          }
        } else {
          sortval = label;
        }

        // Detect if this is a page bundle (file is named index.md/index.html in a directory)
        const isPageBundle = /\/index\.(md|html|markdown|qmd)$/.test(item);

        return { key, label, sortval, isPageBundle };
      });

      return retFiles;
    } else {
      // data folder and everything else
      const globExpression = path.join(
        folder,
        `**/*.{${this.formatProviderResolver.allFormatsExt().join(',')}}`
      ).replace(/\\/g, '/');

      const files = await glob(globExpression, {});
      return files.map(function (item) {
        const key = path.posix.relative(folder, item);
        const label = key;
        const sortval = key; // Default sortval to key for data folders
        return { key, label, sortval };
      });
    }
  }

  /**
   * Strip non-document data (internal fields starting with __)
   */
  private _stripNonDocumentData(document: Record<string, unknown>): void {
    for (const key in document) {
      if (key.startsWith('__')) {
        delete document[key];
      }
    }
  }

  /**
   * Rename a collection item
   */
  async renameCollectionItem(
    collectionKey: string,
    collectionItemKey: string,
    collectionItemNewKey: string
  ): Promise<CollectionItemRenameResult> {
    const config = await this.getConfigurationsData();
    const collection = config.collections.find((x) => x.key === collectionKey);
    if (collection == null) throw new Error('Could not find collection.');
    let filePath: string;
    let newFilePath: string;
    let newFileKey: string;
    let newLabel: string;

    if (collectionItemKey.includes('.' + collection.extension)) {
      filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
      newFilePath = path.join(
        this.workspacePath,
        collection.folder,
        collectionItemNewKey + '.' + collection.extension
      );
      newFileKey = path.join(collectionItemNewKey + '.' + collection.extension);
      newLabel = collectionItemNewKey + '.' + collection.extension;
    } else {
      filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
      newFilePath = path.join(this.workspacePath, collection.folder, collectionItemNewKey);
      newFileKey = path.join(collectionItemNewKey, 'index.' + collection.extension);
      newLabel = collectionItemNewKey;
    }

    if (!fs.existsSync(filePath)) {
      console.log('orig does not exist' + filePath);
    }
    if (fs.existsSync(newFilePath)) {
      console.log('new already  exist' + newFilePath);
      return { renamed: false };
    }
    fs.renameSync(filePath, newFilePath);
    return { renamed: true, item: { key: newFileKey.replace(/\\/g, '/'), label: newLabel } };
  }

  /**
   * Copy collection item to another language
   */
  async copyCollectionItemToLang(
    collectionKey: string,
    collectionItemKey: string,
    collectionItemNewKey: string,
    destLangCode: string
  ): Promise<CollectionItemCopyResult> {
    const config = await this.getConfigurationsData();
    const collection = config.collections.find((x) => x.key === collectionKey);
    if (collection == null) throw new Error('Could not find collection.');

    let newFilePath: string;
    let newFileKey: string;
    let newLabel: string;

    const langs = await this.getHugoConfigLanguages();

    const sourcelang = langs.find((lang) => {
      return collection.folder.startsWith(lang.source);
    });
    const destlang = langs.find((lang) => {
      return lang.lang == destLangCode;
    });

    if (!sourcelang || !destlang) {
      return { copied: false };
    }

    const pathInLang = collection.folder.slice(sourcelang.source.length);

    const filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);

    if (collectionItemKey.includes('.' + collection.extension)) {
      newFilePath = path.join(
        this.workspacePath,
        destlang.source,
        pathInLang,
        collectionItemNewKey + '.' + collection.extension
      );
      newFileKey = path.join(collectionItemNewKey + '.' + collection.extension);
      newLabel = collectionItemNewKey + '.' + collection.extension;
    } else {
      newFilePath = path.join(
        this.workspacePath,
        destlang.source,
        pathInLang,
        collectionItemNewKey
      );
      newFileKey = path.join(collectionItemNewKey, 'index.' + collection.extension);
      newLabel = collectionItemNewKey;
    }

    if (!fs.existsSync(filePath)) {
      console.log('orig does not exist' + filePath);
      return { copied: false };
    }
    if (fs.existsSync(newFilePath)) {
      console.log('new already  exist' + newFilePath);
      return { copied: false };
    }

    fs.copySync(filePath, newFilePath);
    return { copied: true, item: { key: newFileKey.replace(/\\/g, '/'), label: newLabel } };
  }

  /**
   * Copy a collection item
   */
  async copyCollectionItem(
    collectionKey: string,
    collectionItemKey: string,
    collectionItemNewKey: string
  ): Promise<CollectionItemCopyResult> {
    const config = await this.getConfigurationsData();
    const collection = config.collections.find((x) => x.key === collectionKey);
    if (collection == null) throw new Error('Could not find collection.');

    let filePath: string;
    let newFilePath: string;
    let newFileKey: string;
    let newLabel: string;

    if (collectionItemKey.includes('.' + collection.extension)) {
      filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
      newFilePath = path.join(
        this.workspacePath,
        collection.folder,
        collectionItemNewKey + '.' + collection.extension
      );
      newFileKey = path.join(collectionItemNewKey + '.' + collection.extension);
      newLabel = collectionItemNewKey + '.' + collection.extension;
    } else {
      filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
      newFilePath = path.join(this.workspacePath, collection.folder, collectionItemNewKey);
      newFileKey = path.join(collectionItemNewKey, 'index.' + collection.extension);
      newLabel = collectionItemNewKey;
    }

    if (!fs.existsSync(filePath)) {
      console.log('orig does not exist' + filePath);
      return { copied: false };
    }
    if (fs.existsSync(newFilePath)) {
      console.log('new already  exist' + newFilePath);
      return { copied: false };
    }

    fs.copySync(filePath, newFilePath);
    return { copied: true, item: { key: newFileKey.replace(/\\/g, '/'), label: newLabel } };
  }

  /**
   * Delete a collection item
   */
  async deleteCollectionItem(collectionKey: string, collectionItemKey: string): Promise<boolean> {
    const config = await this.getConfigurationsData();
    const collection = config.collections.find((x) => x.key === collectionKey);
    if (collection == null) throw new Error('Could not find collection.');

    let filePath = '';
    if (collectionItemKey.endsWith('/index.md')) {
      filePath = path.join(
        this.workspacePath,
        collection.folder,
        collectionItemKey.split('/')[0]
      );
    } else {
      filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
    }

    await recurForceRemove(filePath);

    return true;
  }

  /**
   * Make a collection item into a page bundle
   */
  async makePageBundleCollectionItem(
    collectionKey: string,
    collectionItemKey: string
  ): Promise<boolean> {
    const config = await this.getConfigurationsData();
    const collection = config.collections.find((x) => x.key === collectionKey);
    if (collection == null) throw new Error('Could not find collection.');
    const filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);

    if (fs.existsSync(filePath)) {
      const newdir = path.join(
        this.workspacePath,
        collection.folder,
        collectionItemKey.split('.').slice(0, -1).join('.')
      );
      fs.mkdirSync(newdir);
      fs.renameSync(filePath, path.join(newdir, 'index.md'));

      return true;
    }
    return false;
  }

  /**
   * Open collection item in external editor
   */
  async openCollectionItemInEditor(
    collectionKey: string,
    collectionItemKey: string
  ): Promise<void> {
    const config = await this.getConfigurationsData();
    const collection = config.collections.find((x) => x.key === collectionKey);
    if (collection == null) throw new Error('Could not find collection.');
    const filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);

    await this.shellAdapter.openPath(filePath);
  }

  /**
   * Get collection by key
   */
  async getCollectionByKey(collectionKey: string): Promise<CollectionConfig> {
    const config = await this.getConfigurationsData();
    const collection = config.collections.find((x) => x.key === collectionKey);

    if (collection == null) throw new Error('Could not find collection.');

    return collection;
  }

  /**
   * Build a collection item using a build action
   */
  async buildCollectionItem(
    collectionKey: string,
    collectionItemKey: string,
    buildAction: string
  ): Promise<BuildActionResult> {
    const collection = await this.getCollectionByKey(collectionKey);
    const filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);

    const buildActionDict = collection.build_actions?.find((x) => x.key === buildAction);
    if (!buildActionDict) {
      throw new Error(`Build action ${buildAction} not found in collection ${collectionKey}`);
    }

    return this.buildActionService.runAction(
      buildAction,
      buildActionDict.execute,
      filePath,
      this.workspacePath,
      this.siteKey,
      this.workspaceKey
    );
  }

  /**
   * Build a single using a build action
   */
  async buildSingle(singleKey: string, buildAction: string): Promise<BuildActionResult> {
    const config = await this.getConfigurationsData();
    const single = config.singles.find((x) => x.key === singleKey);
    if (single == null) throw new Error('Could not find single.');
    if (!single.file) throw new Error(`Single '${singleKey}' has no file configured`);

    const filePath = path.join(this.workspacePath, single.file);

    const buildActionDict = single.build_actions?.find((x) => x.key === buildAction);
    if (!buildActionDict) {
      throw new Error(`Build action ${buildAction} not found in single ${singleKey}`);
    }

    return this.buildActionService.runAction(
      buildAction,
      buildActionDict.execute,
      filePath,
      this.workspacePath,
      this.siteKey,
      this.workspaceKey
    );
  }

  /**
   * Update a collection item
   */
  async updateCollectionItem(
    collectionKey: string,
    collectionItemKey: string,
    document: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const config = await this.getConfigurationsData();
    const collection = config.collections.find((x) => x.key === collectionKey);
    if (collection == null) throw new Error('Could not find collection.');
    const filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);

    // Log update start
    this.container.logger.infoSite(
      this.siteKey,
      this.workspaceKey,
      SITE_CATEGORIES.CONTENT,
      'Collection item update started',
      { collectionKey, collectionItemKey, filePath }
    );

    try {
      const directory = path.dirname(filePath);

      if (!fs.existsSync(directory)) fs.mkdirSync(directory); // ensure directory existence

      const documentClone = JSON.parse(JSON.stringify(document));
      this._stripNonDocumentData(documentClone);
      const stringData = await this._smartDump(filePath, [collection.dataformat], documentClone);
      fs.writeFileSync(filePath, stringData);

      // Log success
      this.container.logger.infoSite(
        this.siteKey,
        this.workspaceKey,
        SITE_CATEGORIES.CONTENT,
        'Collection item updated',
        { collectionKey, collectionItemKey, filePath }
      );

      return document;
    } catch (error) {
      // Log error
      this.container.logger.errorSite(
        this.siteKey,
        this.workspaceKey,
        SITE_CATEGORIES.CONTENT,
        'Collection item update failed',
        { 
          collectionKey, 
          collectionItemKey, 
          filePath, 
          error: error instanceof Error ? error.message : String(error) 
        }
      );
      throw error;
    }
  }

  /**
   * Copy files into a collection item or single
   */
  async copyFilesIntoCollectionItem(
    collectionKey: string,
    collectionItemKey: string,
    targetPath: string,
    files: string[],
    forceFileName?: string
  ): Promise<string[]> {
    const config = await this.getConfigurationsData();

    let filesBasePath = '';
    // When file starts with / use the root of the site directory
    if (targetPath.charAt(0) == '/' || targetPath.charAt(0) == '\\') {
      filesBasePath = path.join(this.workspacePath, targetPath);
    } else {
      if (collectionKey == '') {
        filesBasePath = path.join(await this.getSingleFolder(collectionItemKey), targetPath);
      } else {
        const collection = config.collections.find((x) => x.key === collectionKey);
        if (collection == null) throw new Error('Could not find collection.');

        // Check if item is already a bundle (has directory separator)
        if (!collectionItemKey.includes('/')) {
          const itemPath = path.join(this.workspacePath, collection.folder, collectionItemKey);
          const bundleDirPath = path.join(
            this.workspacePath,
            collection.folder,
            collectionItemKey.replace(/\.[^.]+$/, '')
          );

          // Check if we need to convert to bundle
          if (fs.existsSync(itemPath) && fs.statSync(itemPath).isFile()) {
            // File exists as non-bundle - convert it
            await this.makePageBundleCollectionItem(collectionKey, collectionItemKey);
          }
          // If bundle directory already exists (either just converted or already was converted), update the key
          if (fs.existsSync(bundleDirPath) && fs.statSync(bundleDirPath).isDirectory()) {
            collectionItemKey = collectionItemKey.replace(/\.[^.]+$/, '') + '/index.md';
          }
        }

        // Extract the bundle directory from collectionItemKey
        // For bundle items like "project1/index.md", extract "project1"
        let bundleDir = collectionItemKey;
        if (collectionItemKey.includes('/')) {
          // Has directory separator - strip the filename part
          bundleDir = collectionItemKey.replace(/\/[^/]+$/, '');
        } else {
          // No directory separator - strip the file extension (shouldn't happen after auto-convert)
          bundleDir = collectionItemKey.replace(/\.[^.]+$/, '');
        }

        const pathFromItemRoot = path.join(bundleDir, targetPath);
        filesBasePath = path.join(this.workspacePath, collection.folder, pathFromItemRoot);
      }
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const from = file;
      let to = path.join(filesBasePath, path.basename(file));

      if (i == 0 && forceFileName) {
        to = path.join(filesBasePath, forceFileName);
        files[0] = forceFileName;
      }

      const toExists = fs.existsSync(to);
      if (toExists) {
        fs.unlinkSync(to);
      }

      await fs.copy(from, to);
    }

    return files.map((x) => {
      return path.join(targetPath, path.basename(x)).replace(/\\/g, '/');
    });
  }

  /**
   * Delete a file from a bundle path.
   * Used when removing files from bundle manager.
   */
  async deleteFileFromBundle(
    collectionKey: string,
    collectionItemKey: string,
    targetPath: string,
    filename: string
  ): Promise<boolean> {
    const config = await this.getConfigurationsData();

    let filesBasePath = '';
    // When path starts with / use the root of the site directory
    if (targetPath.charAt(0) === '/' || targetPath.charAt(0) === '\\') {
      filesBasePath = path.join(this.workspacePath, targetPath);
    } else {
      if (collectionKey === '') {
        filesBasePath = path.join(await this.getSingleFolder(collectionItemKey), targetPath);
      } else {
        const collection = config.collections.find((x) => x.key === collectionKey);
        if (collection == null) throw new Error('Could not find collection.');

        const pathFromItemRoot = path.join(
          collectionItemKey.replace(/\/[^/]+$/, ''),
          targetPath
        );
        filesBasePath = path.join(this.workspacePath, collection.folder, pathFromItemRoot);
      }
    }

    const filePath = path.join(filesBasePath, filename);

    if (fs.existsSync(filePath)) {
      await recurForceRemove(filePath);
      return true;
    }

    return false;
  }

  /**
   * Upload a file to a bundle path with base64 content.
   * Used by native browser file pickers.
   * Returns the uploaded file path and optionally the new collection item key if converted to bundle.
   */
  async uploadFileToBundlePath(
    collectionKey: string,
    collectionItemKey: string,
    targetPath: string,
    filename: string,
    base64Content: string
  ): Promise<{ uploadedPath: string; newCollectionItemKey?: string }> {
    const config = await this.getConfigurationsData();
    const originalCollectionItemKey = collectionItemKey;
    let wasConverted = false;

    let filesBasePath = '';
    // When path starts with / use the root of the site directory
    if (targetPath.charAt(0) === '/' || targetPath.charAt(0) === '\\') {
      filesBasePath = path.join(this.workspacePath, targetPath);
    } else {
      if (collectionKey === '') {
        filesBasePath = path.join(await this.getSingleFolder(collectionItemKey), targetPath);
      } else {
        const collection = config.collections.find((x) => x.key === collectionKey);
        if (collection == null) throw new Error('Could not find collection.');

        // Check if item is already a bundle (has directory separator)
        if (!collectionItemKey.includes('/')) {
          const itemPath = path.join(this.workspacePath, collection.folder, collectionItemKey);
          const bundleDirPath = path.join(
            this.workspacePath,
            collection.folder,
            collectionItemKey.replace(/\.[^.]+$/, '')
          );

          // Check if we need to convert to bundle
          if (fs.existsSync(itemPath) && fs.statSync(itemPath).isFile()) {
            // File exists as non-bundle - convert it
            await this.makePageBundleCollectionItem(collectionKey, collectionItemKey);
            wasConverted = true;
          }
          // If bundle directory already exists (either just converted or already was converted), update the key
          if (fs.existsSync(bundleDirPath) && fs.statSync(bundleDirPath).isDirectory()) {
            collectionItemKey = collectionItemKey.replace(/\.[^.]+$/, '') + '/index.md';
          }
        }

        // Extract the bundle directory from collectionItemKey
        // For bundle items like "project1/index.md", extract "project1"
        let bundleDir = collectionItemKey;
        if (collectionItemKey.includes('/')) {
          // Has directory separator - strip the filename part
          bundleDir = collectionItemKey.replace(/\/[^/]+$/, '');
        } else {
          // No directory separator - strip the file extension (shouldn't happen after auto-convert)
          bundleDir = collectionItemKey.replace(/\.[^.]+$/, '');
        }

        const pathFromItemRoot = path.join(bundleDir, targetPath);
        filesBasePath = path.join(this.workspacePath, collection.folder, pathFromItemRoot);
      }
    }

    // Ensure the target directory exists
    await fs.ensureDir(filesBasePath);

    const filePath = path.join(filesBasePath, filename);

    // If file exists, remove it first
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Decode base64 and write file
    const buffer = Buffer.from(base64Content, 'base64');
    await fs.writeFile(filePath, buffer);

    // Return the relative path from targetPath and new key if converted
    const result: { uploadedPath: string; newCollectionItemKey?: string } = {
      uploadedPath: path.join(targetPath, filename).replace(/\\/g, '/')
    };

    if (wasConverted && collectionItemKey !== originalCollectionItemKey) {
      result.newCollectionItemKey = collectionItemKey;
    }

    return result;
  }

  /**
   * Check if path exists (promisified)
   */
  private existsPromise(src: string): Promise<boolean> {
    return new Promise((resolve) => {
      fs.exists(src, (exists) => {
        resolve(exists);
      });
    });
  }

  /**
   * Remove thumbnail for item image
   */
  async removeThumbnailForItemImage(
    collectionKey: string,
    collectionItemKey: string,
    targetPath: string
  ): Promise<void> {
    let folder: string;
    const itemPath = collectionItemKey.replace(/\/[^/]+$/, '');
    if (collectionKey == '') {
      folder = path.basename(await this.getSingleFolder(collectionItemKey));
    } else {
      const config = await this.getConfigurationsData();

      const collection = config.collections.find((x) => x.key === collectionKey);
      if (!collection) {
        throw new Error('Could not find collection.');
      }
      folder = collection.folder;
    }

    let thumbSrc = path.join(
      this.workspacePath,
      '.quiqr-cache/thumbs',
      folder,
      itemPath,
      targetPath
    );
    if (targetPath.charAt(0) == '/' || targetPath.charAt(0) == '\\') {
      thumbSrc = path.join(this.workspacePath, '.quiqr-cache/thumbs', targetPath);
    }

    const thumbSrcExists = await this.existsPromise(thumbSrc);
    if (thumbSrcExists) {
      fs.remove(thumbSrc);
    }
  }

  /**
   * Get files in a bundle
   */
  async getFilesInBundle(
    collectionKey: string,
    collectionItemKey: string,
    targetPath: string,
    extensions?: string[],
    forceFileName?: string
  ): Promise<ResourceFile[] | undefined> {
    const show = false;
    if (show) {
      console.log(forceFileName);
      console.log(extensions);
    }

    let files: ResourceFile[] = [];
    let folder: string;
    let filePath: string;

    const config = await this.getConfigurationsData();

    if (collectionKey == '') {
      const single = config.singles.find((x) => x.key === collectionItemKey);
      if (single == null) throw new Error('Could not find single.');
      if (!single.file) throw new Error(`Single '${collectionItemKey}' has no file configured`);
      filePath = path.join(this.workspacePath, single.file);
    } else {
      const collection = config.collections.find((x) => x.key === collectionKey);
      if (!collection) {
        throw new Error('Could not find collection.');
      }
      folder = collection.folder;
      filePath = path.join(this.workspacePath, folder, collectionItemKey);
    }

    if (await fs.exists(filePath)) {
      if (isContentFile(filePath)) {
        files = await this.getResourcesFromContent(filePath, [], targetPath);
      }
      return files;
    }
  }

  /**
   * Get thumbnail for collection or single item image
   */
  async getThumbnailForCollectionOrSingleItemImage(
    collectionKey: string,
    itemKey: string,
    targetPath: string
  ): Promise<string> {
    const itemPath = itemKey.replace(/\/[^/]+$/, '');

    if (targetPath.charAt(0) == '/' || targetPath.charAt(0) == '\\') {
      return this.getThumbnailForAbsoluteImgPath(
        path.join(this.workspacePath, targetPath),
        targetPath
      );
    } else if (collectionKey == '') {
      return this.getThumbnailForAbsoluteImgPath(
        path.join(await this.getSingleFolder(itemKey), targetPath), // complete path
        targetPath, // targetPath
        path.basename(await this.getSingleFolder(itemKey)), // folder
        itemPath
      );
    } else {
      const config = await this.getConfigurationsData();
      const collection = config.collections.find((x) => x.key === collectionKey);
      if (collection == null) throw new Error('Could not find collection.');
      const folder = collection.folder;

      return this.getThumbnailForAbsoluteImgPath(
        path.join(this.workspacePath, collection.folder, itemPath, targetPath), // completePath
        targetPath,
        folder,
        itemPath
      );
    }
  }

  /**
   * Get thumbnail for absolute image path
   */
  async getThumbnailForAbsoluteImgPath(
    completePath: string,
    targetPath: string,
    folder: string = '',
    itemPath: string = ''
  ): Promise<string> {
    const srcExists = await this.existsPromise(completePath);
    if (!srcExists) {
      return 'NOT_FOUND';
    }

    const thumbSrc = path.join(
      this.workspacePath,
      '.quiqr-cache/thumbs',
      folder,
      itemPath,
      targetPath
    );
    const thumbSrcExists = await this.existsPromise(thumbSrc);
    let ext = path.extname(thumbSrc).replace('.', '').toLowerCase();

    if (
      ext === 'png' ||
      ext === 'jpg' ||
      ext === 'jpeg' ||
      ext === 'svg' ||
      ext === 'gif'
    ) {
      if (!thumbSrcExists) {
        try {
          await createThumbnailJob(completePath, thumbSrc);
        } catch {
          return 'NOT_FOUND';
        }
      }

      if (ext === 'svg') ext = 'svg+xml';

      const mime = `image/${ext}`;
      const buffer = await promisify(fs.readFile)(thumbSrc);
      const base64 = buffer.toString('base64');

      return `data:${mime};base64,${base64}`;
    } else {
      return 'NO_IMAGE';
    }
  }

  /**
   * Find first match or default in array
   */
  private _findFirstMatchOrDefault(arr: BuildConfig[] | ServeConfig[] | undefined, key: string): BuildConfig | ServeConfig {
    let result;

    if (key) {
      result = (arr || []).find((x) => x.key === key);
      if (result) return result;
    }

    result = (arr || []).find((x) => x.key === 'default' || x.key === '' || x.key == null);
    if (result) return result;

    if (arr !== undefined && arr.length === 1) return arr[0];

    if (key) {
      throw new Error(
        `Could not find a config for key "${key}" and a default value was not available.`
      );
    } else {
      throw new Error(`Could not find a default config.`);
    }
  }

  /**
   * Set current base URL from SSG config
   */
  async setCurrentBaseUrl(ssgType: string, ssgVersion: string, configFile?: string): Promise<void> {
    // Reset currentBaseUrl
    this.appState.currentBaseUrl = undefined;

    try {
      const provider = await this.providerFactory.getProvider(ssgType);
      const configQuerier = provider.createConfigQuerier(this.workspacePath, ssgVersion, configFile);

      if (!configQuerier) {
        return; // Provider doesn't support config querying
      }

      const lines = await configQuerier.getConfigLines();
      const key = 'baseurl';
      const item = lines.find((element: string) => {
        return element.startsWith(key);
      });

      if (item) {
        // TOML
        let currentBaseUrl: string;
        if (item.includes('=')) {
          currentBaseUrl = item.split('=')[1].replace(/"/g, '').trim();
        }
        // YAML
        else {
          currentBaseUrl = item.replace('baseurl:', '').replace(/"/g, '').trim();
        }
        // TODO JSON
        if (currentBaseUrl && currentBaseUrl !== '/') {
          try {
            const url = new URL(currentBaseUrl);
            this.appState.currentBaseUrl = url.pathname;
          } catch {
            // Invalid URL, leave currentBaseUrl as undefined
          }
        }
      }
    } catch (error) {
      // If config querying fails, just leave currentBaseUrl as undefined
      console.warn('Failed to query SSG config for baseURL:', error);
    }
  }

  /**
   * Get SSG config languages (Hugo-specific feature)
   */
  async getHugoConfigLanguages(): Promise<HugoLanguage[]> {
    const workspaceDetails = await this.getConfigurationsData();

    try {
      let serveConfig: Partial<ServeConfig> | null = null;
      if (workspaceDetails.serve && workspaceDetails.serve.length) {
        serveConfig = this._findFirstMatchOrDefault(workspaceDetails.serve, '');
      } else {
        serveConfig = { config: '' };
      }

      const provider = await this.providerFactory.getProvider(workspaceDetails.ssgType);
      const configQuerier = provider.createConfigQuerier(
        this.workspacePath,
        workspaceDetails.ssgVersion,
        serveConfig.config
      );

      if (!configQuerier) {
        return []; // Provider doesn't support config querying
      }

      const config = await configQuerier.getConfig();

      if (!config.mounts) {
        return [];
      }

      // config.mounts can be either an array or an object with a mounts property
      // TODO: fix this weirdness with the mounts??
      const mountsArray = Array.isArray(config.mounts)
        ? config.mounts
        : (config.mounts as any).mounts;

      if (!Array.isArray(mountsArray)) {
        return [];
      }

      const filteredArray = mountsArray.filter((mount: any) => {
        return 'lang' in mount;
      }) as HugoLanguage[];

      return filteredArray;
    } catch (error) {
      console.warn('Failed to query SSG config languages:', error);
      return [];
    }
  }

  /**
   * Start SSG development server
   * Note: SSG binary must be pre-downloaded by the frontend before calling this method.
   * The frontend coordinates downloads via SSE to show progress to the user.
   */
  async serve(): Promise<void> {
    const workspaceDetails = await this.getConfigurationsData();
    const { ssgType, ssgVersion } = workspaceDetails;

    // Verify SSG binary is installed (if required) - frontend is responsible for downloading it first
    const provider = await this.providerFactory.getProvider(ssgType);
    const metadata = provider.getMetadata();

    if (metadata.requiresBinary) {
      const ssgBin = this.pathHelper.getSSGBinForVer(ssgType, ssgVersion);
      if (!fs.existsSync(ssgBin)) {
        throw new Error(
          `${metadata.name} version ${ssgVersion} is not installed. ` +
            `Please wait for the download to complete before starting the server.`
        );
      }
    }

    // Get serve configuration
    let serveConfig: any;
    if (workspaceDetails.serve && workspaceDetails.serve.length) {
      serveConfig = this._findFirstMatchOrDefault(workspaceDetails.serve, '');
    } else {
      serveConfig = { config: '' };
    }

    // Set current base URL
    await this.setCurrentBaseUrl(ssgType, ssgVersion, serveConfig.config);

    // Create dev server config
    const serverConfig: SSGServerConfig = {
      workspacePath: this.workspacePath,
      version: ssgVersion,
      configFile: serveConfig.config,
      siteKey: this.siteKey,
      workspaceKey: this.workspaceKey,
    };

    // Create and start dev server
    this.currentDevServer = provider.createDevServer(serverConfig);
    this.currentSSGType = ssgType;

    try {
      await this.currentDevServer.serve();

      // Make screenshot if no screenshots are made already
      const screenshotDir = path.join(
        this.workspacePath,
        'quiqr',
        'etalage',
        'screenshots'
      );
      if (!fs.existsSync(screenshotDir)) {
        console.log('autocreate screenshots');
        this.genereateEtalageImages();
      }
    } catch (error) {
      // Clean up on error
      this.currentDevServer = undefined;
      this.currentSSGType = undefined;
      throw error;
    }
  }

  /**
   * Stop the dev server if running
   */
  stopHugoServer(): void {
    if (this.currentDevServer) {
      this.currentDevServer.stopIfRunning();
      this.currentDevServer = undefined;
      this.currentSSGType = undefined;
    }
  }

  /**
   * Build the SSG site
   */
  async build(buildKey?: string, extraConfig: ExtraBuildConfig = {}): Promise<void> {
    const workspaceDetails = await this.getConfigurationsData();
    const { ssgType, ssgVersion } = workspaceDetails;

    // Get build configuration
    let buildConfig: any;
    if (workspaceDetails.build && workspaceDetails.build.length) {
      buildConfig = this._findFirstMatchOrDefault(workspaceDetails.build, buildKey || '');
    } else {
      buildConfig = { config: '' };
    }

    const destination = path.join(this.pathHelper.getBuildDir(this.workspacePath), 'public');

    // Create build config
    const builderConfig: SSGBuildConfig = {
      workspacePath: this.workspacePath,
      version: ssgVersion,
      configFile: buildConfig.config,
      destination: destination,
    };

    if (extraConfig.overrideBaseURLSwitch) {
      builderConfig.baseUrl = extraConfig.overrideBaseURL;
    }

    // Create and execute builder
    const provider = await this.providerFactory.getProvider(ssgType);
    const builder = provider.createBuilder(builderConfig);

    await builder.build();
  }

  /**
   * Generate etalage (showcase) images
   */
  async genereateEtalageImages(): Promise<void> {
    await recurForceRemove(
      this.pathHelper.workspaceCacheThumbsPath(
        this.workspacePath,
        path.join('quiqr', 'etalage', 'screenshots')
      )
    );
    await recurForceRemove(
      this.pathHelper.workspaceCacheThumbsPath(
        this.workspacePath,
        path.join('quiqr', 'etalage', 'favicon')
      )
    );

    const etalageDir = path.join(this.workspacePath, 'quiqr', 'etalage');
    this.screenshotWindowManager.createScreenshotAndFavicon('localhost', 13131, etalageDir);
  }

  /**
   * Get the current dev server instance
   */
  getCurrentHugoServer(): SSGDevServer | undefined {
    return this.currentDevServer;
  }
}
