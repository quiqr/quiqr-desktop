/**
 * Hugo Downloader Service
 *
 * Downloads and installs Hugo binaries from GitHub releases.
 * Uses async generators for streaming progress updates via SSE.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { globSync } from 'glob';
import type { PathHelper, EnvironmentInfo } from '../../utils/path-helper.js';
import type { OutputConsole } from '../../adapters/types.js';

const execFileAsync = promisify(execFile);

// ============================================================================
// Types
// ============================================================================

export interface HugoEnvironment {
  platform: 'macOS' | 'windows' | 'linux';
  arch: 'x64' | 'x32';
}

export interface DownloadProgress {
  percent: number;
  message: string;
  complete: boolean;
  error?: string;
}

export interface HugoDownloaderDependencies {
  pathHelper: PathHelper;
  outputConsole: OutputConsole;
  environmentInfo: EnvironmentInfo;
}

/**
 * Builds download URLs for official Hugo releases from GitHub
 */
export class OfficialHugoSourceUrlBuilder {
  /**
   * Build the download URL for a specific Hugo version and environment
   */
  build(environment: HugoEnvironment, version: string): string {
    // Strip leading 'v' if present
    version = version.replace(/^v/i, '');
    const versionMain = parseInt(version.split('.')[1], 10);

    // Determine architecture string
    let arch: string;
    switch (environment.arch) {
      case 'x32':
        arch = '32bit';
        break;
      case 'x64':
        // Hugo 0.103+ uses 'amd64' instead of '64bit'
        arch = versionMain >= 103 ? 'amd64' : '64bit';
        break;
      default:
        throw new Error(`Unsupported architecture: ${environment.arch}`);
    }

    // Determine platform string and format
    let platform: string;
    let format: string;

    switch (environment.platform) {
      case 'linux':
        // Hugo 0.103+ uses lowercase platform names
        platform = versionMain >= 103 ? 'linux' : 'Linux';
        format = 'tar.gz';
        break;

      case 'windows':
        platform = versionMain >= 103 ? 'windows' : 'Windows';
        format = 'zip';
        break;

      case 'macOS':
        platform = versionMain >= 103 ? 'darwin' : 'macOS';
        // Hugo 0.102+ uses universal binary for macOS
        if (versionMain >= 102) {
          arch = 'universal';
        }
        format = 'tar.gz';
        break;

      default:
        throw new Error(`Unsupported platform: ${environment.platform}`);
    }

    // Build URL - note: extended_ prefix is part of version string, not URL path
    const cleanVersion = version.replace('extended_', '');
    return `https://github.com/gohugoio/hugo/releases/download/v${cleanVersion}/hugo_${version}_${platform}-${arch}.${format}`;
  }
}

/**
 * Unpacks downloaded Hugo archives using 7za
 */
export class OfficialHugoUnpacker {
  constructor(private pathHelper: PathHelper) {}

  /**
   * Unpack a Hugo archive for Linux/macOS (tar.gz format)
   * Two-step extraction: tar.gz -> tar -> hugo binary
   */
  private async unpackLinux(packagePath: string): Promise<void> {
    packagePath = path.normalize(packagePath);
    const output = path.dirname(packagePath);
    const sevenZaBin = this.pathHelper.get7zaBin();

    // Step 1: Extract tar.gz to tar
    await execFileAsync(sevenZaBin, ['e', packagePath, '-o' + output, '*', '-r', '-y']);

    // Step 2: Find the tar file
    const globExpression = packagePath.replace('download.partial', 'download');
    const matches = globSync(globExpression);

    if (matches.length !== 1) {
      throw new Error(`Expecting one "tar" file, found ${matches.length}.`);
    }

    const tarFile = matches[0];

    // Step 3: Extract hugo binary from tar
    await execFileAsync(sevenZaBin, ['e', tarFile, '-o' + output, 'hugo*', '-r', '-y']);

    // Step 4: Set execute permission
    const hugoBinary = packagePath.replace('download.partial', 'hugo');
    await fs.chmod(hugoBinary, 0o722);
  }

  /**
   * Unpack a Hugo archive for Windows (zip format)
   * Direct extraction of exe files
   */
  private async unpackWindows(packagePath: string): Promise<void> {
    packagePath = path.normalize(packagePath);
    const output = path.dirname(packagePath);
    const sevenZaBin = this.pathHelper.get7zaBin();

    await execFileAsync(sevenZaBin, ['e', packagePath, '-o' + output, '*.exe', '-r', '-y']);
  }

  /**
   * Unpack a Hugo archive based on platform
   */
  async unpack(packagePath: string, environment: HugoEnvironment): Promise<void> {
    switch (environment.platform) {
      case 'linux':
      case 'macOS':
        return this.unpackLinux(packagePath);
      case 'windows':
        return this.unpackWindows(packagePath);
      default:
        throw new Error(`Unsupported platform: ${environment.platform}`);
    }
  }
}

/**
 * Main Hugo downloader service
 * Downloads Hugo binaries and streams progress via async generator
 */
export class HugoDownloader {
  private isRunning = false;
  private pathHelper: PathHelper;
  private outputConsole: OutputConsole;
  private environmentInfo: EnvironmentInfo;
  private urlBuilder: OfficialHugoSourceUrlBuilder;
  private unpacker: OfficialHugoUnpacker;
  private abortController: AbortController | null = null;
  private currentDownloadPath: string | null = null;

  constructor(dependencies: HugoDownloaderDependencies) {
    this.pathHelper = dependencies.pathHelper;
    this.outputConsole = dependencies.outputConsole;
    this.environmentInfo = dependencies.environmentInfo;
    this.urlBuilder = new OfficialHugoSourceUrlBuilder();
    this.unpacker = new OfficialHugoUnpacker(this.pathHelper);
  }

  /**
   * Check if a specific Hugo version is installed
   */
  isVersionInstalled(version: string): boolean {
    const bin = this.pathHelper.getSSGBinForVer('hugo', version);
    return fs.existsSync(bin);
  }

  /**
   * Get the Hugo environment for downloads
   */
  private getHugoEnvironment(): HugoEnvironment {
    return {
      platform: this.environmentInfo.platform,
      arch: process.arch === 'x64' ? 'x64' : 'x32',
    };
  }

  /**
   * Download file from URL to destination
   * Supports cancellation via AbortController
   */
  private async downloadToFile(url: string, dest: string, signal?: AbortSignal): Promise<void> {
    const dir = path.dirname(dest);
    await fs.ensureDir(dir);

    const response = await fetch(url, { method: 'GET', signal });

    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Convert web ReadableStream to Node.js stream
    const fileStream = fs.createWriteStream(dest);
    const reader = response.body.getReader();

    try {
      while (true) {
        // Check if cancelled before each read
        if (signal?.aborted) {
          throw new Error('Download cancelled');
        }
        const { done, value } = await reader.read();
        if (done) break;
        fileStream.write(Buffer.from(value));
      }
    } finally {
      fileStream.end();
    }

    // Wait for file to finish writing
    await new Promise<void>((resolve, reject) => {
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });
  }

  /**
   * Download Hugo version with progress updates via async generator
   */
  async *download(version: string, skipExistCheck = false): AsyncGenerator<DownloadProgress> {
    // Guard against concurrent downloads
    if (this.isRunning) {
      yield { percent: 0, message: 'Download already in progress', complete: false, error: 'Download already in progress' };
      return;
    }

    // Check if already installed
    if (!skipExistCheck && this.isVersionInstalled(version)) {
      yield { percent: 100, message: 'Hugo already installed', complete: true };
      return;
    }

    this.isRunning = true;
    this.abortController = new AbortController();

    try {
      const environment = this.getHugoEnvironment();
      const url = this.urlBuilder.build(environment, version);
      const tempDest = path.join(this.pathHelper.getSSGBinDirForVer('hugo', version), 'download.partial');
      this.currentDownloadPath = tempDest;

      // Clean up any existing partial download
      if (fs.existsSync(tempDest)) {
        await fs.unlink(tempDest);
      }

      // Check if cancelled
      if (this.abortController.signal.aborted) {
        yield { percent: 0, message: 'Download cancelled', complete: false, error: 'Download cancelled' };
        return;
      }

      // Progress: Starting
      yield { percent: 0, message: 'Starting Hugo installation...', complete: false };
      this.outputConsole.appendLine(`Hugo installation started. Downloading package from ${url}...`);

      // Progress: Preparing
      yield { percent: 20, message: 'Preparing download...', complete: false };

      // Check if cancelled
      if (this.abortController.signal.aborted) {
        yield { percent: 0, message: 'Download cancelled', complete: false, error: 'Download cancelled' };
        return;
      }

      // Progress: Downloading
      yield { percent: 30, message: 'Downloading Hugo...', complete: false };
      await this.downloadToFile(url, tempDest, this.abortController.signal);

      // Check if cancelled
      if (this.abortController.signal.aborted) {
        yield { percent: 0, message: 'Download cancelled', complete: false, error: 'Download cancelled' };
        return;
      }

      // Progress: Unpacking
      yield { percent: 70, message: 'Unpacking Hugo...', complete: false };
      this.outputConsole.appendLine('Unpacking...');
      await this.unpacker.unpack(tempDest, environment);

      // Clean up temp file
      if (fs.existsSync(tempDest)) {
        await fs.unlink(tempDest);
      }

      // Progress: Complete
      yield { percent: 100, message: 'Hugo installation completed', complete: true };
      this.outputConsole.appendLine('Hugo installation completed.');

    } catch (error) {
      // Clean up partial download on error
      await this.cleanupPartialDownload();

      const errorMessage = error instanceof Error ? error.message : String(error);
      // Don't log cancellation as an error
      if (errorMessage !== 'Download cancelled' && !errorMessage.includes('aborted')) {
        this.outputConsole.appendLine(`Hugo installation failed: ${errorMessage}`);
      }
      yield { percent: 0, message: `Installation failed: ${errorMessage}`, complete: false, error: errorMessage };
    } finally {
      this.isRunning = false;
      this.abortController = null;
      this.currentDownloadPath = null;
    }
  }

  /**
   * Cancel the current download and clean up partial files
   */
  async cancel(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
    }

    await this.cleanupPartialDownload();

    this.isRunning = false;
    this.abortController = null;
    this.currentDownloadPath = null;

    this.outputConsole.appendLine('Hugo download cancelled.');
  }

  /**
   * Clean up any partial download files
   */
  private async cleanupPartialDownload(): Promise<void> {
    if (this.currentDownloadPath && fs.existsSync(this.currentDownloadPath)) {
      try {
        await fs.unlink(this.currentDownloadPath);
        this.outputConsole.appendLine('Cleaned up partial download file.');
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Ensure Hugo version is available - download if not installed
   * This is a convenience method that consumes the generator
   */
  async ensureAvailable(version: string): Promise<void> {
    for await (const progress of this.download(version)) {
      if (progress.error) {
        throw new Error(progress.error);
      }
    }
  }
}
