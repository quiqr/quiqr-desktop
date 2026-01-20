/**
 * Jekyll Downloader Service
 *
 * Manages Jekyll gem installation using Bundler.
 * Uses Bundler to install Jekyll to version-specific directories for isolation.
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

export interface JekyllDownloaderDependencies {
  pathHelper: PathHelper;
  outputConsole: OutputConsole;
  environmentInfo: EnvironmentInfo;
}

/**
 * JekyllDownloader - Manages gem installation for Jekyll using Bundler
 */
export class JekyllDownloader implements SSGBinaryManager {
  private pathHelper: PathHelper;
  private outputConsole: OutputConsole;
  private environmentInfo: EnvironmentInfo;
  private cancelRequested: boolean = false;

  constructor(dependencies: JekyllDownloaderDependencies) {
    this.pathHelper = dependencies.pathHelper;
    this.outputConsole = dependencies.outputConsole;
    this.environmentInfo = dependencies.environmentInfo;
  }

  /**
   * Check if Ruby is installed on the system
   */
  private async checkRubyInstalled(): Promise<boolean> {
    try {
      await execFileAsync('ruby', ['--version'], { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if Bundler is installed
   */
  private async checkBundlerInstalled(): Promise<boolean> {
    try {
      await execFileAsync('bundle', ['--version'], { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the bundle command (either from PATH or user gem directory)
   */
  private async getBundleCommand(): Promise<string> {
    // First, try the standard 'bundle' command
    try {
      await execFileAsync('bundle', ['--version'], { timeout: 5000 });
      return 'bundle';
    } catch {
      // Bundle not in PATH, try to find it in user gem directory
      try {
        // Get gem environment to find user gem paths
        const { stdout } = await execFileAsync('gem', ['environment', 'gempath'], { timeout: 5000 });
        const gemPaths = stdout.trim().split(':');

        // Check common bundle locations
        for (const gemPath of gemPaths) {
          const bundlePath = path.join(gemPath, 'bin', 'bundle');
          if (fs.existsSync(bundlePath)) {
            return bundlePath;
          }
        }
      } catch {
        // Ignore errors
      }

      // Last resort: try common user gem locations
      const homeDir = process.env.HOME || process.env.USERPROFILE || '';
      const commonPaths = [
        path.join(homeDir, '.gem', 'ruby', '3.3.0', 'bin', 'bundle'),
        path.join(homeDir, '.gem', 'ruby', '3.2.0', 'bin', 'bundle'),
        path.join(homeDir, '.gem', 'ruby', '3.1.0', 'bin', 'bundle'),
        path.join(homeDir, '.gem', 'ruby', '3.0.0', 'bin', 'bundle'),
        path.join(homeDir, '.local', 'share', 'gem', 'ruby', '3.3.0', 'bin', 'bundle'),
        path.join(homeDir, '.local', 'share', 'gem', 'ruby', '3.2.0', 'bin', 'bundle'),
        path.join(homeDir, '.local', 'share', 'gem', 'ruby', '3.1.0', 'bin', 'bundle'),
        path.join(homeDir, '.local', 'share', 'gem', 'ruby', '3.0.0', 'bin', 'bundle'),
      ];

      for (const bundlePath of commonPaths) {
        if (fs.existsSync(bundlePath)) {
          return bundlePath;
        }
      }

      throw new Error('Bundle command not found');
    }
  }

  /**
   * Check if a specific Jekyll version is installed with all required gems
   */
  isVersionInstalled(version: string): boolean {
    const installDir = this.pathHelper.getSSGBinDirForVer('jekyll', version);
    const gemfileLock = path.join(installDir, 'Gemfile.lock');
    const gemfile = path.join(installDir, 'Gemfile');

    // Check if Gemfile.lock exists (indicates successful bundle install)
    if (!fs.existsSync(gemfileLock)) {
      return false;
    }

    // Verify the Gemfile contains required gems (minima, jekyll-feed, jekyll-seo-tag)
    // This ensures old installations get updated when we add new gems
    if (fs.existsSync(gemfile)) {
      try {
        const gemfileContent = fs.readFileSync(gemfile, 'utf-8');
        const hasMinima = gemfileContent.includes("gem 'minima'");
        const hasFeed = gemfileContent.includes("gem 'jekyll-feed'");
        const hasSeoTag = gemfileContent.includes("gem 'jekyll-seo-tag'");

        // If any required gem is missing, consider it not installed (will trigger reinstall)
        if (!hasMinima || !hasFeed || !hasSeoTag) {
          return false;
        }
      } catch {
        return false;
      }
    }

    return true;
  }

  /**
   * Get the path to an installed Jekyll version
   * Returns the bundle exec command that should be used
   */
  getVersionPath(version: string): string | null {
    if (!this.isVersionInstalled(version)) {
      return null;
    }

    const installDir = this.pathHelper.getSSGBinDirForVer('jekyll', version);

    // Return path to the wrapper script
    const wrapperScript = path.join(installDir, this.environmentInfo.platform === 'windows' ? 'jekyll.cmd' : 'jekyll.sh');

    if (fs.existsSync(wrapperScript)) {
      return wrapperScript;
    }

    return installDir;
  }

  /**
   * List all installed Jekyll versions
   */
  listInstalledVersions(): string[] {
    const binRoot = this.pathHelper.getSSGBinRoot('jekyll');

    if (!fs.existsSync(binRoot)) {
      return [];
    }

    const versions: string[] = [];
    const entries = fs.readdirSync(binRoot, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const versionDir = path.join(binRoot, entry.name);
        const gemfileLock = path.join(versionDir, 'Gemfile.lock');

        if (fs.existsSync(gemfileLock)) {
          versions.push(entry.name);
        }
      }
    }

    return versions;
  }

  /**
   * Download and install a specific Jekyll version using Bundler
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
   * Download and install a specific Jekyll version using Bundler
   * Returns an async generator for streaming progress updates
   */
  async *downloadVersion(version: string): AsyncGenerator<DownloadProgress> {
    const installDir = this.pathHelper.getSSGBinDirForVer('jekyll', version);

    try {
      // Step 1: Check Ruby installation
      yield {
        percent: 5,
        message: 'Checking Ruby installation...',
        complete: false,
      };

      const hasRuby = await this.checkRubyInstalled();
      if (!hasRuby) {
        throw new Error('Ruby is not installed. Please install Ruby (https://www.ruby-lang.org/) to use Jekyll.');
      }

      // Step 2: Check Bundler installation
      yield {
        percent: 10,
        message: 'Checking Bundler installation...',
        complete: false,
      };

      const hasBundler = await this.checkBundlerInstalled();
      if (!hasBundler) {
        yield {
          percent: 15,
          message: 'Installing Bundler locally...',
          complete: false,
        };

        try {
          // Install bundler to user directory (no sudo required)
          await execFileAsync('gem', ['install', 'bundler', '--user-install', '--no-document'], {
            timeout: 120000, // 2 minutes
          });
        } catch {
          // If that fails, provide a helpful error message
          throw new Error(
            'Bundler is not installed and automatic installation failed. ' +
            'Please install Bundler manually by running: gem install bundler --user-install'
          );
        }
      }

      // Step 3: Prepare directory
      yield {
        percent: 20,
        message: 'Preparing installation directory...',
        complete: false,
      };

      await fs.ensureDir(installDir);

      // Step 4: Create Gemfile
      yield {
        percent: 30,
        message: 'Creating Gemfile...',
        complete: false,
      };

      const gemfileContent = `source 'https://rubygems.org'

gem 'jekyll', '${version}'
gem 'webrick', '~> 1.8'  # Required for Ruby 3.0+

# Common Jekyll themes and plugins
gem 'minima', '~> 2.5'
gem 'jekyll-feed', '~> 0.12'
gem 'jekyll-seo-tag', '~> 2.8'
`;

      await fs.writeFile(path.join(installDir, 'Gemfile'), gemfileContent);

      // Step 5: Install Jekyll via Bundler
      yield {
        percent: 40,
        message: `Installing Jekyll ${version} with Bundler...`,
        complete: false,
      };

      this.outputConsole.appendLine(`Installing Jekyll ${version} to ${installDir}`);

      // Get bundle command (may be in user gem directory)
      const bundleCommand = await this.getBundleCommand();
      this.outputConsole.appendLine(`Using bundle at: ${bundleCommand}`);

      // Configure bundle to install gems in vendor/bundle (modern bundler syntax)
      await execFileAsync(
        bundleCommand,
        ['config', 'set', '--local', 'path', 'vendor/bundle'],
        {
          cwd: installDir,
          timeout: 30000,
        }
      );

      // Run bundle install
      await execFileAsync(
        bundleCommand,
        ['install'],
        {
          cwd: installDir,
          timeout: 600000, // 10 minute timeout (gem installs can be slow)
        }
      );

      // Step 6: Create wrapper script
      yield {
        percent: 80,
        message: 'Creating wrapper script...',
        complete: false,
      };

      await this.createWrapperScript(installDir, bundleCommand);

      // Step 7: Verify installation
      yield {
        percent: 90,
        message: 'Verifying installation...',
        complete: false,
      };

      const gemfileLock = path.join(installDir, 'Gemfile.lock');
      const installed = fs.existsSync(gemfileLock);

      if (!installed) {
        throw new Error('Jekyll installation verification failed - Gemfile.lock not found');
      }

      yield {
        percent: 100,
        message: 'Installation complete!',
        complete: true,
      };

      this.outputConsole.appendLine(`Jekyll ${version} installed successfully`);
    } catch (error) {
      this.outputConsole.appendLine(`Jekyll installation error: ${error instanceof Error ? error.message : String(error)}`);

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
   * Create a wrapper script to run Jekyll with bundle exec
   */
  private async createWrapperScript(installDir: string, bundleCommand: string): Promise<void> {
    const gemfilePath = path.join(installDir, 'Gemfile');

    if (this.environmentInfo.platform === 'windows') {
      // Windows batch script
      const batchScript = `@echo off
set BUNDLE_GEMFILE=${gemfilePath}
"${bundleCommand}" exec jekyll %*
`;
      await fs.writeFile(path.join(installDir, 'jekyll.cmd'), batchScript);
    } else {
      // Unix shell script
      // Set BUNDLE_GEMFILE to point to the installation directory's Gemfile
      // This allows Jekyll to run from the workspace directory while using the correct gems
      const shellScript = `#!/bin/bash
export BUNDLE_GEMFILE="${gemfilePath}"
"${bundleCommand}" exec jekyll "$@"
`;
      const scriptPath = path.join(installDir, 'jekyll.sh');
      await fs.writeFile(scriptPath, shellScript);
      await fs.chmod(scriptPath, '755'); // Make executable
    }
  }

  /**
   * Cancel current download
   * Implementation of SSGBinaryManager.cancel()
   */
  async cancel(): Promise<void> {
    this.cancelRequested = true;
    this.outputConsole.appendLine('Jekyll download cancellation requested');
  }

  /**
   * Ensure a specific Jekyll version is available (download if not installed)
   * Implementation of SSGBinaryManager.ensureAvailable()
   */
  async ensureAvailable(version: string): Promise<void> {
    if (this.isVersionInstalled(version)) {
      return;
    }

    this.outputConsole.appendLine(`Jekyll ${version} not found, installing...`);

    // Run download generator to completion
    for await (const progress of this.download(version, true)) {
      this.outputConsole.appendLine(`Jekyll install: ${progress.message} (${progress.percent}%)`);

      if (progress.error) {
        throw new Error(`Failed to install Jekyll ${version}: ${progress.error}`);
      }

      if (progress.complete) {
        break;
      }
    }
  }

  /**
   * Remove a specific Jekyll version
   */
  async removeVersion(version: string): Promise<void> {
    const installDir = this.pathHelper.getSSGBinDirForVer('jekyll', version);

    if (fs.existsSync(installDir)) {
      await fs.remove(installDir);
      this.outputConsole.appendLine(`Removed Jekyll ${version}`);
    }
  }
}
