/**
 * Eleventy Downloader Service
 *
 * Manages Eleventy npm package installation (not traditional binary downloads).
 * Uses npm to install @11ty/eleventy to version-specific directories.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import type { PathHelper, EnvironmentInfo } from '../../utils/path-helper.js';
import type { OutputConsole } from '../../adapters/types.js';
import type { SSGBinaryManager } from '../types.js';

const execFileAsync = promisify(execFile);

// ============================================================================
// Types
// ============================================================================

export interface DownloadProgress {
  percent: number;
  message: string;
  complete: boolean;
  error?: string;
}

export interface EleventyDownloaderDependencies {
  pathHelper: PathHelper;
  outputConsole: OutputConsole;
  environmentInfo: EnvironmentInfo;
}

/**
 * Eleventy Downloader - Manages npm package installation for Eleventy
 */
export class EleventyDownloader implements SSGBinaryManager {
  private pathHelper: PathHelper;
  private outputConsole: OutputConsole;
  private environmentInfo: EnvironmentInfo;
  private cancelRequested: boolean = false;

  constructor(dependencies: EleventyDownloaderDependencies) {
    this.pathHelper = dependencies.pathHelper;
    this.outputConsole = dependencies.outputConsole;
    this.environmentInfo = dependencies.environmentInfo;
  }

  /**
   * Check if a specific Eleventy version is installed
   */
  isVersionInstalled(version: string): boolean {
    const installDir = this.pathHelper.getSSGBinDirForVer('eleventy', version);
    const eleventyBin = path.join(installDir, 'node_modules', '.bin', 'eleventy');

    // On Windows, check for .cmd file
    if (this.environmentInfo.platform === 'windows') {
      return fs.existsSync(eleventyBin + '.cmd') || fs.existsSync(eleventyBin);
    }

    return fs.existsSync(eleventyBin);
  }

  /**
   * Get the path to an installed Eleventy version
   */
  getVersionPath(version: string): string | null {
    if (!this.isVersionInstalled(version)) {
      return null;
    }

    const installDir = this.pathHelper.getSSGBinDirForVer('eleventy', version);
    const eleventyBin = path.join(installDir, 'node_modules', '.bin', 'eleventy');

    // On Windows, use .cmd wrapper
    if (this.environmentInfo.platform === 'windows') {
      return fs.existsSync(eleventyBin + '.cmd') ? eleventyBin + '.cmd' : eleventyBin;
    }

    return eleventyBin;
  }

  /**
   * List all installed Eleventy versions
   */
  listInstalledVersions(): string[] {
    const binRoot = this.pathHelper.getSSGBinRoot('eleventy');

    if (!fs.existsSync(binRoot)) {
      return [];
    }

    const versions: string[] = [];
    const entries = fs.readdirSync(binRoot, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const versionDir = path.join(binRoot, entry.name);
        const eleventyBin = path.join(versionDir, 'node_modules', '.bin', 'eleventy');

        if (fs.existsSync(eleventyBin) || fs.existsSync(eleventyBin + '.cmd')) {
          versions.push(entry.name);
        }
      }
    }

    return versions;
  }

  /**
   * Download and install a specific Eleventy version using npm
   * Implementation of SSGBinaryManager.download()
   */
  async *download(version: string, skipExistCheck?: boolean): AsyncGenerator<DownloadProgress> {
    // Check if already installed unless skipping
    if (!skipExistCheck && this.isVersionInstalled(version)) {
      yield {
        percent: 100,
        message: 'Already installed',
        complete: true,
      };
      return;
    }

    yield* this.downloadVersion(version);
  }

  /**
   * Download and install a specific Eleventy version using npm
   * Returns an async generator for streaming progress updates
   */
  async *downloadVersion(version: string): AsyncGenerator<DownloadProgress> {
    const installDir = this.pathHelper.getSSGBinDirForVer('eleventy', version);

    try {
      // Step 1: Prepare directory
      yield {
        percent: 10,
        message: 'Preparing installation directory...',
        complete: false,
      };

      await fs.ensureDir(installDir);

      // Step 2: Create package.json
      yield {
        percent: 20,
        message: 'Creating package.json...',
        complete: false,
      };

      const packageJson = {
        name: 'quiqr-eleventy',
        version: '1.0.0',
        private: true,
        description: 'Eleventy installation for Quiqr',
      };

      await fs.writeFile(
        path.join(installDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Step 3: Install Eleventy via npm
      yield {
        percent: 30,
        message: `Installing @11ty/eleventy@${version}...`,
        complete: false,
      };

      this.outputConsole.appendLine(`Installing Eleventy ${version} to ${installDir}`);

      // Use npm to install Eleventy
      // Note: We use --no-save to avoid modifying package.json
      const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

      await execFileAsync(
        npmCommand,
        ['install', `@11ty/eleventy@${version}`, '--no-save', '--loglevel=error'],
        {
          cwd: installDir,
          timeout: 300000, // 5 minute timeout
        }
      );

      yield {
        percent: 90,
        message: 'Verifying installation...',
        complete: false,
      };

      // Verify installation
      const eleventyBin = path.join(installDir, 'node_modules', '.bin', 'eleventy');
      const installed = fs.existsSync(eleventyBin) || fs.existsSync(eleventyBin + '.cmd');

      if (!installed) {
        throw new Error('Eleventy binary not found after installation');
      }

      yield {
        percent: 100,
        message: 'Installation complete!',
        complete: true,
      };

      this.outputConsole.appendLine(`Eleventy ${version} installed successfully`);
    } catch (error) {
      this.outputConsole.appendLine(`Eleventy installation error: ${error instanceof Error ? error.message : String(error)}`);

      // Clean up on failure
      try {
        await fs.remove(installDir);
      } catch (cleanupError) {
        this.outputConsole.appendLine(`Failed to clean up installation directory: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`);
      }

      yield {
        percent: 0,
        message: 'Installation failed',
        complete: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Cancel current download
   * Implementation of SSGBinaryManager.cancel()
   */
  async cancel(): Promise<void> {
    this.cancelRequested = true;
    this.outputConsole.appendLine('Eleventy download cancellation requested');
  }

  /**
   * Ensure a specific Eleventy version is available (download if not installed)
   * Implementation of SSGBinaryManager.ensureAvailable()
   */
  async ensureAvailable(version: string): Promise<void> {
    if (this.isVersionInstalled(version)) {
      return;
    }

    this.outputConsole.appendLine(`Eleventy ${version} not found, installing...`);

    // Run download generator to completion
    for await (const progress of this.download(version, true)) {
      this.outputConsole.appendLine(`Eleventy install: ${progress.message} (${progress.percent}%)`);

      if (progress.error) {
        throw new Error(`Failed to install Eleventy ${version}: ${progress.error}`);
      }

      if (progress.complete) {
        break;
      }
    }
  }

  /**
   * Remove a specific Eleventy version
   */
  async removeVersion(version: string): Promise<void> {
    const installDir = this.pathHelper.getSSGBinDirForVer('eleventy', version);

    if (fs.existsSync(installDir)) {
      await fs.remove(installDir);
      this.outputConsole.appendLine(`Removed Eleventy ${version}`);
    }
  }
}
