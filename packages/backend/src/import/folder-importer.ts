/**
 * Folder Importer
 *
 * Imports Hugo sites from local directories.
 */

import fs from 'fs-extra';
import del from 'del';
import path from 'path';
import type { PathHelper } from '../utils/path-helper.js';
import type { FormatProviderResolver } from '../utils/format-provider-resolver.js';
import { pathIsDirectory, filenameFromPath } from '../utils/file-dir-utils.js';
import type { LibraryService } from '../services/library/library-service.js';
import { WorkspaceConfigProvider } from '../services/workspace/workspace-config-provider.js';
import { InitialWorkspaceConfigBuilder } from '../services/workspace/initial-workspace-config-builder.js';
import type { WorkspaceConfig } from '../services/workspace/workspace-config-validator.js';

/**
 * Site inspection inventory - detailed info about a folder's contents
 */
export interface SiteInventory {
  dirExist: boolean;
  dirName: string;
  hugoConfigExists: boolean;
  hugoConfigParsed: any | null;
  hugoThemesDirExists: boolean;
  hugoContentDirExists: boolean;
  hugoDataDirExists: boolean;
  hugoStaticDirExists: boolean;
  quiqrModelDirExists: boolean;
  quiqrFormsDirExists: boolean;
  quiqrDirExists: boolean;
  quiqrModelParsed: WorkspaceConfig | null;
}

/**
 * FolderImporter - Imports Hugo sites from local directories
 */
export class FolderImporter {
  private pathHelper: PathHelper;
  private formatProviderResolver: FormatProviderResolver;
  private libraryService: LibraryService;
  private workspaceConfigProvider: WorkspaceConfigProvider;

  constructor(
    pathHelper: PathHelper,
    formatProviderResolver: FormatProviderResolver,
    libraryService: LibraryService,
    workspaceConfigProvider: WorkspaceConfigProvider
  ) {
    this.pathHelper = pathHelper;
    this.formatProviderResolver = formatProviderResolver;
    this.libraryService = libraryService;
    this.workspaceConfigProvider = workspaceConfigProvider;
  }

  /**
   * Inspect a site directory to determine what type of site it is
   * and what components are present
   */
  async siteDirectoryInspect(folder: string): Promise<SiteInventory> {
    const inventory: SiteInventory = {
      dirExist: pathIsDirectory(folder),
      dirName: filenameFromPath(folder),
      hugoConfigExists: false,
      hugoConfigParsed: null,
      hugoThemesDirExists: pathIsDirectory(path.join(folder, 'themes')),
      hugoContentDirExists: pathIsDirectory(path.join(folder, 'content')),
      hugoDataDirExists: pathIsDirectory(path.join(folder, 'data')),
      hugoStaticDirExists: pathIsDirectory(path.join(folder, 'static')),
      quiqrModelDirExists: pathIsDirectory(path.join(folder, 'quiqr', 'model')),
      quiqrFormsDirExists: pathIsDirectory(path.join(folder, 'quiqr', 'forms')),
      quiqrDirExists: pathIsDirectory(path.join(folder, 'quiqr')),
      quiqrModelParsed: null,
    };

    // Check if Quiqr model exists and parse it
    const quiqrModelPath = this.workspaceConfigProvider.getQuiqrModelBasePath(folder);
    if (quiqrModelPath) {
      inventory.quiqrModelParsed = await this.workspaceConfigProvider.readOrCreateMinimalModelConfig(
        folder,
        'source'
      );
    }

    // Check if Hugo config exists and parse it
    const hugoConfigFilePath = this.pathHelper.hugoConfigFilePath(folder);
    if (hugoConfigFilePath) {
      const strData = fs.readFileSync(hugoConfigFilePath, { encoding: 'utf-8' });
      const formatProvider = this.formatProviderResolver.resolveForFilePath(hugoConfigFilePath);
      if (formatProvider) {
        inventory.hugoConfigParsed = formatProvider.parse(strData);
        inventory.hugoConfigExists = true;
      }
    }

    return inventory;
  }

  /**
   * Create a new site from a local directory
   *
   * @param directory - Path to the directory containing the site
   * @param siteName - Name for the new site
   * @param generateQuiqrModel - Whether to generate Quiqr model files
   * @param hugoVersion - Hugo version to use
   * @returns The site key of the newly created site
   */
  async newSiteFromLocalDirectory(
    directory: string,
    siteName: string,
    generateQuiqrModel: boolean,
    hugoVersion?: string
  ): Promise<string> {
    const siteKey = await this.libraryService.createSiteKeyFromName(siteName);

    // Copy directory to temp location
    const tempCopyDir = path.join(this.pathHelper.getTempDir(), 'siteFromDir');
    del.sync([tempCopyDir], { force: true });
    await fs.copy(directory, tempCopyDir);

    // Generate Quiqr model if requested
    if (generateQuiqrModel && hugoVersion) {
      const configBuilder = new InitialWorkspaceConfigBuilder(
        tempCopyDir,
        this.formatProviderResolver,
        this.pathHelper
      );
      configBuilder.buildAll(hugoVersion);
    }

    // Create the site from the temp directory
    await this.libraryService.createNewSiteWithTempDirAndKey(siteKey, tempCopyDir);

    return siteKey;
  }
}
