/**
 * Pogozipper - ZIP-based Import/Export for Quiqr Sites
 *
 * Handles import and export of:
 * - Complete sites (.pogosite)
 * - Themes only (.pogotheme)
 * - Content only (.pogocontent)
 */

import fs from 'fs-extra';
import fssimple from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import type { PathHelper } from '../utils/path-helper.js';
import type { LibraryService } from '../services/library/library-service.js';
import type { DialogAdapter, WindowAdapter } from '../adapters/types.js';
import { recurForceRemove, fileRegexRemove } from '../utils/file-dir-utils.js';

// File extensions for Quiqr ZIP packages
const PogoSiteExtension = 'pogosite';
const PogoThemeExtension = 'pogotheme';
const PogoContentExtension = 'pogocontent';

/**
 * Options for exporting a site
 */
export interface ExportSiteOptions {
  siteKey: string;
  sitePath: string;
  newSiteKey?: string; // Optional: rename the site during export
}

/**
 * Options for importing a site
 */
export interface ImportSiteOptions {
  filePath?: string; // If not provided, will show file picker
  autoConfirm?: boolean; // Skip confirmation dialog
}

/**
 * Options for exporting/importing themes and content
 */
export interface ExportImportThemeContentOptions {
  siteKey: string;
  sitePath: string;
  filePath?: string; // For import: path to ZIP file
}

/**
 * Pogozipper - Handles ZIP-based import/export of Quiqr sites
 */
export class Pogozipper {
  private pathHelper: PathHelper;
  private libraryService: LibraryService;
  private dialogAdapter: DialogAdapter;
  private windowAdapter: WindowAdapter;

  constructor(
    pathHelper: PathHelper,
    libraryService: LibraryService,
    dialogAdapter: DialogAdapter,
    windowAdapter: WindowAdapter
  ) {
    this.pathHelper = pathHelper;
    this.libraryService = libraryService;
    this.dialogAdapter = dialogAdapter;
    this.windowAdapter = windowAdapter;
  }

  /**
   * Export a complete site to a .pogosite ZIP file
   */
  async exportSite(options: ExportSiteOptions): Promise<void> {
    const { siteKey, sitePath, newSiteKey = siteKey } = options;

    // Show directory picker for export destination
    const dirs = await this.dialogAdapter.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (!dirs || dirs.length !== 1) {
      return;
    }

    const exportDir = dirs[0];
    const tmpPath = path.join(this.pathHelper.getRoot(), 'sites', siteKey, 'exportTmp');

    try {
      // Clean up temp directory
      await recurForceRemove(tmpPath);

      // Copy site to temp directory
      fs.copySync(sitePath, tmpPath);
      console.log('Copied site to temp dir');

      // Remove files that shouldn't be exported
      await this.cleanupSiteForExport(tmpPath);

      // Read and update site config
      const configJsonPath = this.pathHelper.getSiteMountConfigPath(siteKey);
      const confText = fssimple.readFileSync(configJsonPath, { encoding: 'utf8' });
      const config = JSON.parse(confText);
      config.key = newSiteKey;
      config.name = newSiteKey;
      const newConfigJson = JSON.stringify(config);

      // Create ZIP file
      const zip = new AdmZip();
      zip.addFile('sitekey', Buffer.from(newSiteKey, 'utf8'));
      zip.addFile(
        `config.${newSiteKey}.json`,
        Buffer.from(newConfigJson, 'utf8')
      );
      zip.addLocalFolder(tmpPath);

      // Write ZIP to export directory
      const exportFilePath = path.join(exportDir, `${newSiteKey}.${PogoSiteExtension}`);
      zip.writeZip(exportFilePath);

      // Show success message
      await this.dialogAdapter.showMessageBox({
        type: 'info',
        buttons: ['Close'],
        title: 'Finished site export',
        message: `Site exported to:\n${exportFilePath}`,
      });
    } finally {
      // Clean up temp directory
      await recurForceRemove(tmpPath);
    }
  }

  /**
   * Import a site from a .pogosite ZIP file
   */
  async importSite(options: ImportSiteOptions = {}): Promise<void> {
    let { filePath, autoConfirm = false } = options;

    // Show file picker if no path provided
    if (!filePath) {
      const files = await this.dialogAdapter.showOpenDialog({
        filters: [{ name: 'Quiqr Sites', extensions: [PogoSiteExtension] }],
        properties: ['openFile'],
      });

      if (!files || files.length !== 1) {
        return;
      }
      filePath = files[0];
    } else if (!autoConfirm) {
      // Show confirmation dialog
      const filename = path.basename(filePath);
      const response = await this.dialogAdapter.showMessageBox({
        buttons: ['Yes', 'Cancel'],
        message: `You're about to import the site ${filename}. Do you want to continue?`,
      });
      if (response === 1) {
        return;
      }
    }

    try {
      // Extract and validate ZIP
      const zip = new AdmZip(filePath);
      const zipEntries = zip.getEntries();

      // Find sitekey
      let siteKey = '';
      zipEntries.forEach((entry: AdmZip.IZipEntry) => {
        if (entry.entryName === 'sitekey') {
          siteKey = zip.readAsText('sitekey');
          console.log('Found sitekey:', siteKey);
        }
      });

      if (!siteKey) {
        await this.dialogAdapter.showMessageBox({
          type: 'warning',
          buttons: ['Close'],
          title: 'Failed task',
          message: 'Failed to import site. Invalid site file: no sitekey found.',
        });
        return;
      }

      this.windowAdapter.appendToOutputConsole(`Found a site with key ${siteKey}`);

      // Read and validate config
      const confFileName = `config.${siteKey}.json`;
      const confText = zip.readAsText(confFileName);
      if (!confText) {
        await this.dialogAdapter.showMessageBox({
          type: 'warning',
          buttons: ['Close'],
          title: 'Failed task',
          message: `Failed to import site. Invalid site file: unreadable ${confFileName}.`,
        });
        return;
      }

      // Create site directories
      const todayDate = new Date().toISOString().replace(/:/g, '-').slice(0, -5);
      const pathSite = path.join(this.pathHelper.getRoot(), 'sites', siteKey);
      const pathSiteSources = path.join(pathSite, 'sources');
      const pathSource = path.join(pathSiteSources, `${siteKey}-${todayDate}`);

      await fs.ensureDir(pathSite);
      await fs.ensureDir(pathSiteSources);
      await fs.ensureDir(pathSource);

      // Update config with new source path
      const newConf = JSON.parse(confText);
      newConf.source.path = pathSource;

      // Write site config
      const newConfigJsonPath = this.pathHelper.getSiteMountConfigPath(siteKey);
      fssimple.writeFileSync(newConfigJsonPath, JSON.stringify(newConf), {
        encoding: 'utf8',
      });

      this.windowAdapter.appendToOutputConsole('Wrote new site configuration');

      // Extract ZIP to source directory
      zip.extractAllTo(pathSource, true);

      // Remove the config file from extracted content (it's in site config dir)
      await fs.removeSync(path.join(pathSource, confFileName));

      // Show success message
      await this.dialogAdapter.showMessageBox({
        type: 'info',
        buttons: ['Close'],
        title: 'Finished task',
        message: 'Site has been imported.',
      });

      // Redirect to site library
      await this.windowAdapter.openSiteLibrary();
    } catch (error) {
      console.error('Error importing site:', error);
      await this.dialogAdapter.showMessageBox({
        type: 'error',
        buttons: ['Close'],
        title: 'Import Failed',
        message: `Failed to import site: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Export a theme to a .pogotheme ZIP file
   */
  async exportTheme(options: ExportImportThemeContentOptions): Promise<void> {
    const { siteKey, sitePath } = options;

    // Show directory picker
    const dirs = await this.dialogAdapter.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (!dirs || dirs.length !== 1) {
      return;
    }

    const exportDir = dirs[0];
    const tmpPath = path.join(this.pathHelper.getRoot(), 'sites', siteKey, 'exportTmp');

    try {
      // Clean up temp directory
      await recurForceRemove(tmpPath);

      // Copy site to temp directory
      fs.copySync(sitePath, tmpPath);
      console.log('Copied site to temp dir');

      // Remove everything except themes
      await this.cleanupThemeForExport(tmpPath);

      // Create ZIP file
      const zip = new AdmZip();
      zip.addFile('sitekey', Buffer.from(siteKey, 'utf8'));
      zip.addLocalFolder(tmpPath);

      // Write ZIP
      const exportFilePath = path.join(exportDir, `${siteKey}.${PogoThemeExtension}`);
      zip.writeZip(exportFilePath);

      // Show success message
      await this.dialogAdapter.showMessageBox({
        type: 'info',
        buttons: ['Close'],
        title: 'Finished task',
        message: `Finished theme export:\n${exportFilePath}`,
      });
    } finally {
      // Clean up temp directory
      await recurForceRemove(tmpPath);
    }
  }

  /**
   * Import a theme from a .pogotheme ZIP file
   */
  async importTheme(options: ExportImportThemeContentOptions): Promise<void> {
    const { siteKey, sitePath } = options;
    let { filePath } = options;

    // Show file picker if no path provided
    if (!filePath) {
      const files = await this.dialogAdapter.showOpenDialog({
        filters: [{ name: 'Quiqr Themes', extensions: [PogoThemeExtension] }],
        properties: ['openFile'],
      });

      if (!files || files.length !== 1) {
        return;
      }
      filePath = files[0];
    } else {
      // Show confirmation dialog
      const filename = path.basename(filePath);
      const response = await this.dialogAdapter.showMessageBox({
        buttons: ['Yes', 'Cancel'],
        message: `You're about to import the theme ${filename} into ${siteKey}. Do you want to continue?`,
      });
      if (response === 1) {
        return;
      }
    }

    try {
      // Extract and validate ZIP
      const zip = new AdmZip(filePath);
      const zipEntries = zip.getEntries();

      // Find sitekey
      let zipSiteKey = '';
      zipEntries.forEach((entry: AdmZip.IZipEntry) => {
        if (entry.entryName === 'sitekey') {
          zipSiteKey = zip.readAsText('sitekey');
          console.log('Found sitekey:', zipSiteKey);
        }
      });

      if (!zipSiteKey) {
        await this.dialogAdapter.showMessageBox({
          type: 'warning',
          buttons: ['Close'],
          title: 'Failed task',
          message: 'Failed to import theme. Invalid theme file: no sitekey found.',
        });
        return;
      }

      // Warn if sitekey doesn't match
      if (zipSiteKey !== siteKey) {
        const response = await this.dialogAdapter.showMessageBox({
          buttons: ['Yes', 'Cancel'],
          message: 'The sitekey of the theme file does not match. Do you want to continue?',
        });
        if (response === 1) {
          return;
        }
      }

      this.windowAdapter.appendToOutputConsole(`Found a theme with key ${zipSiteKey}`);

      // Remove existing themes directory
      await recurForceRemove(path.join(sitePath, 'themes'));

      // Extract theme
      zip.extractAllTo(sitePath, true);

      // Show success message
      await this.dialogAdapter.showMessageBox({
        type: 'info',
        buttons: ['Close'],
        title: 'Finished task',
        message: 'Theme has been imported.',
      });
    } catch (error) {
      console.error('Error importing theme:', error);
      await this.dialogAdapter.showMessageBox({
        type: 'error',
        buttons: ['Close'],
        title: 'Import Failed',
        message: `Failed to import theme: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Export content to a .pogocontent ZIP file
   */
  async exportContent(options: ExportImportThemeContentOptions): Promise<void> {
    const { siteKey, sitePath } = options;

    // Show directory picker
    const dirs = await this.dialogAdapter.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (!dirs || dirs.length !== 1) {
      return;
    }

    const exportDir = dirs[0];
    const tmpPath = path.join(this.pathHelper.getRoot(), 'sites', siteKey, 'exportTmp');

    try {
      // Clean up temp directory
      await recurForceRemove(tmpPath);

      // Copy site to temp directory
      fs.copySync(sitePath, tmpPath);
      console.log('Copied site to temp dir');

      // Remove everything except content
      await this.cleanupContentForExport(tmpPath);

      // Create ZIP file
      const zip = new AdmZip();
      zip.addFile('sitekey', Buffer.from(siteKey, 'utf8'));
      zip.addLocalFolder(tmpPath);

      // Write ZIP
      const exportFilePath = path.join(exportDir, `${siteKey}.${PogoContentExtension}`);
      zip.writeZip(exportFilePath);

      // Show success message
      await this.dialogAdapter.showMessageBox({
        type: 'info',
        buttons: ['Close'],
        title: 'Finished task',
        message: `Finished content export:\n${exportFilePath}`,
      });
    } finally {
      // Clean up temp directory
      await recurForceRemove(tmpPath);
    }
  }

  /**
   * Import content from a .pogocontent ZIP file
   */
  async importContent(options: ExportImportThemeContentOptions): Promise<void> {
    const { siteKey, sitePath } = options;
    let { filePath } = options;

    // Show file picker if no path provided
    if (!filePath) {
      const files = await this.dialogAdapter.showOpenDialog({
        filters: [{ name: 'Quiqr Content', extensions: [PogoContentExtension] }],
        properties: ['openFile'],
      });

      if (!files || files.length !== 1) {
        return;
      }
      filePath = files[0];
    } else {
      // Show confirmation dialog
      const filename = path.basename(filePath);
      const response = await this.dialogAdapter.showMessageBox({
        buttons: ['Yes', 'Cancel'],
        message: `You're about to import the content ${filename} into ${siteKey}. Do you want to continue?`,
      });
      if (response === 1) {
        return;
      }
    }

    try {
      // Extract and validate ZIP
      const zip = new AdmZip(filePath);
      const zipEntries = zip.getEntries();

      // Find sitekey
      let zipSiteKey = '';
      zipEntries.forEach((entry: AdmZip.IZipEntry) => {
        if (entry.entryName === 'sitekey') {
          zipSiteKey = zip.readAsText('sitekey');
          console.log('Found sitekey:', zipSiteKey);
        }
      });

      if (!zipSiteKey) {
        await this.dialogAdapter.showMessageBox({
          type: 'warning',
          buttons: ['Close'],
          title: 'Failed task',
          message: 'Failed to import content. Invalid content file: no sitekey found.',
        });
        return;
      }

      // Warn if sitekey doesn't match
      if (zipSiteKey !== siteKey) {
        const response = await this.dialogAdapter.showMessageBox({
          buttons: ['Yes', 'Cancel'],
          message: 'The sitekey of the content file does not match. Do you want to continue?',
        });
        if (response === 1) {
          return;
        }
      }

      this.windowAdapter.appendToOutputConsole(`Found content with key ${zipSiteKey}`);

      // Remove existing content directory
      await recurForceRemove(path.join(sitePath, 'content'));

      // Extract content
      zip.extractAllTo(sitePath, true);

      // Show success message
      await this.dialogAdapter.showMessageBox({
        type: 'info',
        buttons: ['Close'],
        title: 'Finished task',
        message: 'Content has been imported.',
      });
    } catch (error) {
      console.error('Error importing content:', error);
      await this.dialogAdapter.showMessageBox({
        type: 'error',
        buttons: ['Close'],
        title: 'Import Failed',
        message: `Failed to import content: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Clean up site directory for export - remove files that shouldn't be exported
   */
  private async cleanupSiteForExport(tmpPath: string): Promise<void> {
    await recurForceRemove(path.join(tmpPath, '.git'));
    await recurForceRemove(path.join(tmpPath, 'public'));
    await recurForceRemove(path.join(tmpPath, 'resources'));
    await fileRegexRemove(tmpPath, /sitekey$/);
    await fileRegexRemove(tmpPath, /config.*.json/);
    await fileRegexRemove(tmpPath, /.gitignore/);
    await fileRegexRemove(tmpPath, /.gitlab-ci.yml/);
    await fileRegexRemove(tmpPath, /.gitmodules/);
    await fileRegexRemove(tmpPath, /.DS_Store/);
  }

  /**
   * Clean up theme directory for export - keep only themes
   */
  private async cleanupThemeForExport(tmpPath: string): Promise<void> {
    await recurForceRemove(path.join(tmpPath, '.git'));
    await recurForceRemove(path.join(tmpPath, 'public'));
    await recurForceRemove(path.join(tmpPath, 'content'));
    await recurForceRemove(path.join(tmpPath, 'static'));
    await recurForceRemove(path.join(tmpPath, 'archetypes'));
    await recurForceRemove(path.join(tmpPath, 'resources'));
    await recurForceRemove(path.join(tmpPath, 'layouts'));
    await recurForceRemove(path.join(tmpPath, 'data'));
    await fileRegexRemove(tmpPath, /sitekey$/);
    await fileRegexRemove(tmpPath, /config.*.json/);
    await fileRegexRemove(tmpPath, /.gitignore/);
    await fileRegexRemove(tmpPath, /.gitlab-ci.yml/);
    await fileRegexRemove(tmpPath, /.gitmodules/);
    await fileRegexRemove(tmpPath, /.DS_Store/);
  }

  /**
   * Clean up content directory for export - keep only content and data
   */
  private async cleanupContentForExport(tmpPath: string): Promise<void> {
    await recurForceRemove(path.join(tmpPath, '.git'));
    await recurForceRemove(path.join(tmpPath, 'public'));
    await recurForceRemove(path.join(tmpPath, 'themes'));
    await recurForceRemove(path.join(tmpPath, 'archetypes'));
    await recurForceRemove(path.join(tmpPath, 'resources'));
    await recurForceRemove(path.join(tmpPath, 'layouts'));
    await fileRegexRemove(tmpPath, /sitekey$/);
    await fileRegexRemove(tmpPath, /config.*.json/);
    await fileRegexRemove(tmpPath, /config\.toml/);
    await fileRegexRemove(tmpPath, /config\.yaml/);
    await fileRegexRemove(tmpPath, /config\.json/);
    await fileRegexRemove(tmpPath, /.gitignore/);
    await fileRegexRemove(tmpPath, /.gitlab-ci.yml/);
    await fileRegexRemove(tmpPath, /sukoh\.yml/);
    await fileRegexRemove(tmpPath, /.gitmodules/);
    await fileRegexRemove(tmpPath, /.DS_Store/);
  }
}
