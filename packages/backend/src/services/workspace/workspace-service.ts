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
import type { FormatProvider } from '../../utils/format-providers/types.js';
import { isContentFile, SUPPORTED_CONTENT_EXTENSIONS } from '../../utils/content-formats.js';
import type { PathHelper } from '../../utils/path-helper.js';
import { recurForceRemove } from '../../utils/file-dir-utils.js';
import { createThumbnailJob } from '../../jobs/index.js';
import { HugoBuilder, type HugoBuildConfig } from '../../hugo/hugo-builder.js';
import { HugoServer, type HugoServerConfig } from '../../hugo/hugo-server.js';
import { HugoConfig, type QSiteConfig } from '../../hugo/hugo-config.js';
import { BuildActionService, type BuildActionResult } from '../../build-actions/index.js';
import type { SingleConfig, CollectionConfig } from '@quiqr/types';
import type { WorkspaceConfig } from './workspace-config-validator.js';
import type { AppConfig } from '../../config/app-config.js';
import type { AppState } from '../../config/app-state.js';
import type { HugoDownloader } from '../../hugo/hugo-downloader.js';
import { WindowAdapter, OutputConsole, ScreenshotWindowManager, ShellAdapter } from '../../adapters/types.js';

/**
 * Dependencies required by WorkspaceService
 */
export interface WorkspaceServiceDependencies {
  workspaceConfigProvider: WorkspaceConfigProvider;
  formatProviderResolver: FormatProviderResolver;
  pathHelper: PathHelper;
  appConfig: AppConfig;
  appState: AppState;
  hugoDownloader: HugoDownloader;
  windowAdapter: WindowAdapter;
  shellAdapter: ShellAdapter;
  outputConsole: OutputConsole;
  screenshotWindowManager: ScreenshotWindowManager;
  buildActionService: BuildActionService;
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
 * Extra build configuration
 */
export interface ExtraBuildConfig {
  overrideBaseURLSwitch?: boolean;
  overrideBaseURL?: string;
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
  private hugoDownloader: HugoDownloader;
  private windowAdapter: WindowAdapter;
  private shellAdapter: ShellAdapter;
  private outputConsole: OutputConsole;
  private screenshotWindowManager: ScreenshotWindowManager;
  private buildActionService: BuildActionService;
  private currentHugoServer?: HugoServer;

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
    this.hugoDownloader = dependencies.hugoDownloader;
    this.windowAdapter = dependencies.windowAdapter;
    this.shellAdapter = dependencies.shellAdapter;
    this.outputConsole = dependencies.outputConsole;
    this.screenshotWindowManager = dependencies.screenshotWindowManager;
    this.buildActionService = dependencies.buildActionService;
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
        if ('mainContent' in obj) {
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
    obj: any
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
  ): Promise<any> {
    if (!str || str.length === 0 || !/\S/.test(str)) {
      return {};
    }
    if (isContentFile(filePath)) {
      if (formatFallbacks) {
        formatFallbacks.push('yaml');
      }
    }
    let formatProvider = await this._smartResolveFormatProvider(filePath, formatFallbacks);
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
  async getSingle(singleKey: string, fileOverride?: string): Promise<any> {
    const config = await this.getConfigurationsData();

    const single = config.singles.find((x) => x.key === singleKey);
    if (single == null) throw new Error('Could not find single.');
    if (!single.file && !fileOverride) {
      throw new Error(`Single '${singleKey}' has no file configured`);
    }

    let fileLastPath = single.file || '';

    if (typeof fileOverride === 'string') fileLastPath = fileOverride;

    const filePath = path.join(this.workspacePath, fileLastPath);

    if (fs.existsSync(filePath)) {
      const data = await fs.readFile(filePath, 'utf8');

      let obj = await this._smartParse(
        filePath,
        [path.extname(single.file || fileLastPath).replace('.', '')],
        data
      );

      if (typeof single.pullOuterRootKey === 'string') {
        const newObj: any = {};
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
  async updateSingle(singleKey: string, document: any): Promise<any> {
    const config = await this.getConfigurationsData();
    const single = config.singles.find((x) => x.key === singleKey);
    if (single == null) throw new Error('Could not find single.');
    if (!single.file) throw new Error(`Single '${singleKey}' has no file configured`);
    const filePath = path.join(this.workspacePath, single.file);

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

    return document;
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

    const merged = filtered.map((src) => {
      return Object.assign({ src }, [].find((r: any) => r.src === src));
    });
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
  async getCollectionItem(collectionKey: string, collectionItemKey: string): Promise<any> {
    const config = await this.getConfigurationsData();
    const collection = config.collections.find((x) => x.key === collectionKey);
    if (collection == null) throw new Error('Could not find collection.');
    const filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
    if (await fs.exists(filePath)) {
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
      );

      // WHEN WE WANT TO IGNORE _index.md front pages
      if ('hideIndex' in collection && collection.hideIndex === true) {
        globExpression = path.join(
          folder,
          `${subDirStars}/!(_index).{${supportedContentExt.join(',')}}`
        );
      }

      const files = await glob(globExpression, {});
      const retFiles = files.map(function (item) {
        const key = item.replace(folder, '').replace(/^\//, '');
        const label = key.replace(/^\/?(.+)\/[^/]+$/, '$1');

        let sortval: string | null = null;
        if ('sortkey' in collection && collection.sortkey) {
          const data = fssimple.readFileSync(item, 'utf8');
          const content = fm(data) as any;
          if (collection.sortkey in content['attributes']) {
            sortval = content['attributes'][collection.sortkey];
          }
        } else {
          sortval = label;
        }

        return { key, label, sortval };
      });

      return retFiles;
    } else {
      // data folder and everything else
      const globExpression = path.join(
        folder,
        `**/*.{${this.formatProviderResolver.allFormatsExt().join(',')}}`
      );

      const files = await glob(globExpression, {});
      return files.map(function (item) {
        const key = item.replace(folder, '');
        return { key, label: key };
      });
    }
  }

  /**
   * Strip non-document data (internal fields starting with __)
   */
  private _stripNonDocumentData(document: any): void {
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
      this.workspacePath
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
      this.workspacePath
    );
  }

  /**
   * Update a collection item
   */
  async updateCollectionItem(
    collectionKey: string,
    collectionItemKey: string,
    document: any
  ): Promise<any> {
    const config = await this.getConfigurationsData();
    const collection = config.collections.find((x) => x.key === collectionKey);
    if (collection == null) throw new Error('Could not find collection.');
    const filePath = path.join(this.workspacePath, collection.folder, collectionItemKey);
    const directory = path.dirname(filePath);

    if (!fs.existsSync(directory)) fs.mkdirSync(directory); // ensure directory existence

    const documentClone = JSON.parse(JSON.stringify(document));
    this._stripNonDocumentData(documentClone);
    const stringData = await this._smartDump(filePath, [collection.dataformat], documentClone);
    fs.writeFileSync(filePath, stringData);

    return document;
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

        const pathFromItemRoot = path.join(
          collectionItemKey.replace(/\/[^/]+$/, ''),
          targetPath
        );
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
        } catch (e) {
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
  private _findFirstMatchOrDefault(arr: any[] | undefined, key: string): any {
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
   * Set current base URL from Hugo config
   */
  setCurrentBaseUrl(hugoServerConfig: QSiteConfig): void {
    // Reset currentBaseUrl
    this.appState.currentBaseUrl = undefined;

    const hugoConfService = new HugoConfig(
      JSON.parse(JSON.stringify(hugoServerConfig)),
      this.pathHelper
    );
    hugoConfService.configLines().then((lines) => {
      const key = 'baseurl';
      const item = lines.find((element) => {
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
    });
  }

  /**
   * Get Hugo config languages
   */
  async getHugoConfigLanguages(): Promise<HugoLanguage[]> {
    const workspaceDetails = await this.getConfigurationsData();

    return new Promise((resolve, reject) => {
      let serveConfig: any;
      if (workspaceDetails.serve && workspaceDetails.serve.length) {
        serveConfig = this._findFirstMatchOrDefault(workspaceDetails.serve, '');
      } else serveConfig = { config: '' };

      const hugoServerConfig: QSiteConfig = {
        config: serveConfig.config,
        workspacePath: this.workspacePath,
        hugover: workspaceDetails.hugover,
      };

      const hugoConfService = new HugoConfig(
        JSON.parse(JSON.stringify(hugoServerConfig)),
        this.pathHelper
      );
      hugoConfService
        .configMountsAsObject()
        .then((confObj) => {
          const filteredArray = confObj.mounts.filter(function (mount: any) {
            return 'lang' in mount;
          });

          resolve(filteredArray);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  /**
   * Start Hugo development server
   */
  async serve(): Promise<void> {
    const workspaceDetails = await this.getConfigurationsData();

    // Ensure Hugo is installed before trying to serve
    await this.hugoDownloader.ensureAvailable(workspaceDetails.hugover);

    return new Promise((resolve, reject) => {
      let serveConfig: any;
      if (workspaceDetails.serve && workspaceDetails.serve.length) {
        serveConfig = this._findFirstMatchOrDefault(workspaceDetails.serve, '');
      } else serveConfig = { config: '' };

      const hugoServerConfig: HugoServerConfig = {
        config: serveConfig.config,
        workspacePath: this.workspacePath,
        hugover: workspaceDetails.hugover,
      };

      this.setCurrentBaseUrl(hugoServerConfig);

      this.currentHugoServer = new HugoServer(
        JSON.parse(JSON.stringify(hugoServerConfig)),
        this.pathHelper,
        this.appConfig,
        this.windowAdapter,
        this.outputConsole
      );

      this.currentHugoServer
        .serve()
        .then(() => {
          // make screenshot if no screenshots are made already
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

          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Stop the Hugo server if running
   */
  stopHugoServer(): void {
    if (this.currentHugoServer) {
      this.currentHugoServer.stopIfRunning();
      this.currentHugoServer = undefined;
    }
  }

  /**
   * Build the Hugo site
   */
  async build(buildKey?: string, extraConfig: ExtraBuildConfig = {}): Promise<void> {
    const workspaceDetails = await this.getConfigurationsData();
    return new Promise((resolve, reject) => {
      let buildConfig: any;
      if (workspaceDetails.build && workspaceDetails.build.length) {
        buildConfig = this._findFirstMatchOrDefault(workspaceDetails.build, buildKey || '');
      } else buildConfig = { config: '' };

      const destination = path.join(this.pathHelper.getBuildDir(this.workspacePath), 'public');

      const hugoBuilderConfig: HugoBuildConfig = {
        config: buildConfig.config,
        workspacePath: this.workspacePath,
        hugover: workspaceDetails.hugover,
        destination: destination,
      };
      if (extraConfig.overrideBaseURLSwitch) {
        hugoBuilderConfig.baseUrl = extraConfig.overrideBaseURL;
      }

      const hugoBuilder = new HugoBuilder(hugoBuilderConfig, this.pathHelper);

      hugoBuilder.build().then(
        () => resolve(),
        (err) => reject(err)
      );
    });
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
   * Get the current Hugo server instance
   */
  getCurrentHugoServer(): HugoServer | undefined {
    return this.currentHugoServer;
  }
}
