/**
 * Embgit - Embedded Git Client
 *
 * Wrapper around the embedded git binary for git operations.
 * The embedded git binary is a custom Go-based git client included with Quiqr.
 */

import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import type { PathHelper, EnvironmentInfo } from '../utils/path-helper.js';
import type { OutputConsole, AppInfoAdapter } from '../adapters/types.js';

const execFileAsync = promisify(execFile);

/**
 * User configuration for git operations
 */
export interface EmbgitUserConfig {
  email: string;
  name: string;
  machine: string;
  privateKey: string | null;
}

/**
 * Repository information returned by repo_show commands
 */
export interface RepoInfo {
  [key: string]: any;
}

/**
 * Embgit class - Manages git operations using the embedded git binary
 */
export class Embgit {
  private userconf: EmbgitUserConfig;
  private pathHelper: PathHelper;
  private outputConsole: OutputConsole;
  private appInfo: AppInfoAdapter;
  private rootPath: string;
  private environmentInfo: EnvironmentInfo;

  constructor(
    pathHelper: PathHelper,
    outputConsole: OutputConsole,
    appInfo: AppInfoAdapter,
    rootPath: string,
    environmentInfo: EnvironmentInfo
  ) {
    this.pathHelper = pathHelper;
    this.outputConsole = outputConsole;
    this.appInfo = appInfo;
    this.rootPath = rootPath;
    this.environmentInfo = environmentInfo;

    this.userconf = {
      email: 'anonymous@quiqr.org',
      name: 'anonymous',
      machine: 'unknown-machine',
      privateKey: null,
    };
  }

  /**
   * Set user configuration for git operations
   */
  setUserConf(email: string, name: string): void {
    this.userconf.email = email;
    this.userconf.name = name;
  }

  /**
   * Set the path to the private key file
   */
  setPrivateKeyPath(keyPath: string): void {
    this.userconf.privateKey = keyPath;
  }

  /**
   * Create a temporary private key file from key contents
   */
  async createTemporaryPrivateKey(keyContents: string): Promise<string> {
    const tmpkeypathPrivate = path.join(this.pathHelper.getTempDir(), 'ghkey');
    await fs.writeFile(tmpkeypathPrivate, keyContents, 'utf-8');
    await fs.chmod(tmpkeypathPrivate, 0o600);
    return tmpkeypathPrivate;
  }

  /**
   * Get the path to the embedded git binary
   */
  getGitBin(): string {
    // Check for custom EMBGIT_PATH (for development)
    if (process.env.EMBGIT_PATH) {
      return process.env.EMBGIT_PATH;
    }

    let platform: string;
    let executable: string;

    switch (process.platform) {
      case 'linux':
        platform = 'linux';
        executable = 'embgit';
        break;
      case 'win32':
        platform = 'win';
        executable = 'embgit.exe';
        break;
      case 'darwin':
        platform = 'mac';
        executable = 'embgit';
        break;
      default:
        throw new Error('Platform not supported for embgit');
    }

    if (this.appInfo.isPackaged()) {
      return path.join(this.pathHelper.getApplicationResourcesDir(this.environmentInfo), 'bin', executable);
    } else {
      return path.join(this.rootPath, 'resources', platform, executable);
    }
  }

  /**
   * Execute embgit command
   */
  private async executeEmbgit(args: string[], logMessage?: string, cwd?: string): Promise<string> {
    const gitBinary = this.getGitBin();

    if (logMessage) {
      this.outputConsole.appendLine(logMessage);
    }

    try {
      const { stdout } = await execFileAsync(gitBinary, args, {
        windowsHide: true,
        timeout: 300000, // 5 minutes
        maxBuffer: 1024 * 1024 * 10, // 10MB
        cwd,
      });
      return stdout;
    } catch (error) {
      let errorMessage = "Unknown error";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (typeof error === "object" && error !== null) {
        if ("stderr" in error && (typeof error.stderr === "string" || Buffer.isBuffer(error.stderr))) {
          errorMessage = error.stderr.toString();
        } else if ("stdout" in error && (typeof error.stdout === "string" || Buffer.isBuffer(error.stdout))) {
          errorMessage = error.stdout.toString();
        }
      }

      this.outputConsole.appendLine(`Embgit error: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Reset hard - discard all local changes
   */
  async reset_hard(destination_path: string): Promise<boolean> {
    try {
      await this.executeEmbgit(
        ['reset_hard', destination_path],
        `Resetting hard: ${destination_path}`
      );
      this.outputConsole.appendLine('Reset success ...');
      return true;
    } catch (error) {
      this.outputConsole.appendLine(`Reset hard failed: ${destination_path}`);
      throw error;
    }
  }

  /**
   * Show repository information for a Quiqr site
   */
  async repo_show_quiqrsite(url: string): Promise<RepoInfo> {
    try {
      const output = await this.executeEmbgit(
        ['repo_show_quiqrsite', url],
        `Checking Quiqr site repo: ${url}`
      );
      return JSON.parse(output);
    } catch (error) {
      this.outputConsole.appendLine(`repo_show_quiqrsite failed: ${url}`);
      throw error;
    }
  }

  /**
   * Show repository information for a Hugo theme
   */
  async repo_show_hugotheme(url: string): Promise<RepoInfo> {
    try {
      const output = await this.executeEmbgit(
        ['repo_show_hugotheme', url],
        `Checking Hugo theme repo: ${url}`
      );
      return JSON.parse(output);
    } catch (error) {
      this.outputConsole.appendLine(`repo_show_hugotheme failed: ${url}`);
      throw error;
    }
  }

  /**
   * Pull changes from remote repository
   */
  async pull(destination_path: string): Promise<boolean> {
    if (!this.userconf.privateKey) {
      throw new Error('Private key not set for git pull');
    }

    try {
      await this.executeEmbgit(
        ['pull', '-s', '-i', this.userconf.privateKey, destination_path],
        `Pulling from remote: ${destination_path}`
      );
      return true;
    } catch (error) {
      this.outputConsole.appendLine(`Git pull failed: ${destination_path}`);
      throw error;
    }
  }

  /**
   * Clone a repository from a public URL
   */
  async cloneFromPublicUrl(url: string, destination_path: string): Promise<boolean> {
    try {
      await this.executeEmbgit(
        ['clone', '-s', url, destination_path],
        `Cloning from public URL: ${url} to ${destination_path}`
      );
      this.outputConsole.appendLine('Clone success ...');
      return true;
    } catch (error) {
      this.outputConsole.appendLine(`Clone error: ${url}`);
      throw error;
    }
  }

  /**
   * Clone a private repository using a private key
   */
  async clonePrivateWithKey(
    url: string,
    destination_path: string,
    privateKey: string
  ): Promise<boolean> {
    const privateKeyPath = await this.createTemporaryPrivateKey(privateKey);

    try {
      await this.executeEmbgit(
        ['clone', '-s', '-i', privateKeyPath, url, destination_path],
        `Cloning private repo: ${url} to ${destination_path}`
      );
      this.outputConsole.appendLine('Clone success ...');
      return true;
    } catch (error) {
      this.outputConsole.appendLine(`Clone error: ${url}`);
      throw error;
    }
  }

  /**
   * Clone a repository using the configured private key
   */
  async cloneWithKey(url: string, destination_path: string): Promise<boolean> {
    if (!this.userconf.privateKey) {
      throw new Error('Private key not set for git clone');
    }

    try {
      await this.executeEmbgit(
        ['clone', '-s', '-i', this.userconf.privateKey, url, destination_path],
        `Cloning with key: ${url} to ${destination_path}`
      );
      this.outputConsole.appendLine('Clone success ...');
      return true;
    } catch (error) {
      this.outputConsole.appendLine(`Clone error: ${url}`);
      throw error;
    }
  }

  /**
   * Add all files to git staging area
   */
  async addAll(destination_path: string): Promise<boolean> {
    try {
      await this.executeEmbgit(
        ['add_all', destination_path],
        `Adding all files: ${destination_path}`
      );
      this.outputConsole.appendLine('Git add all success ...');
      return true;
    } catch (error) {
      this.outputConsole.appendLine(`Git add all failed: ${destination_path}`);
      throw error;
    }
  }

  /**
   * Commit changes
   */
  async commit(
    destination_path: string,
    message: string,
    authorName?: string,
    authorEmail?: string
  ): Promise<boolean> {
    const name = authorName || this.userconf.name;
    const email = authorEmail || this.userconf.email;

    try {
      await this.executeEmbgit(
        ['commit', '-a', '-n', name, '-e', email, '-m', message, destination_path],
        `Committing changes: ${destination_path}`
      );
      this.outputConsole.appendLine('Git commit success ...');
      return true;
    } catch (error) {
      this.outputConsole.appendLine(`Git commit failed: ${destination_path}`);
      throw error;
    }
  }

  /**
   * Push changes to remote repository
   */
  async push(destination_path: string, privateKeyPath?: string): Promise<boolean> {
    const keyPath = privateKeyPath || this.userconf.privateKey;
    if (!keyPath) {
      throw new Error('Private key not set for git push');
    }

    try {
      await this.executeEmbgit(
        ['push', '-s', '-i', keyPath, destination_path],
        `Pushing to remote: ${destination_path}`
      );
      this.outputConsole.appendLine('Git push success ...');
      return true;
    } catch (error) {
      this.outputConsole.appendLine(`Git push failed: ${destination_path}`);
      throw error;
    }
  }

  /**
   * Get remote commit history
   */
  async logRemote(url: string, privateKeyPath?: string): Promise<any[]> {
    const keyPath = privateKeyPath || this.userconf.privateKey;
    if (!keyPath) {
      throw new Error('Private key not set for git log remote');
    }

    try {
      const output = await this.executeEmbgit(
        ['log_remote', '-s', '-i', keyPath, url],
        `Getting remote commits: ${url}`
      );
      return JSON.parse(output);
    } catch (error) {
      this.outputConsole.appendLine(`Git log remote failed: ${url}`);
      throw error;
    }
  }

  /**
   * Get local commit history
   */
  async logLocal(destination_path: string): Promise<any[]> {
    try {
      const output = await this.executeEmbgit(
        ['log_local', destination_path],
        `Getting local commits: ${destination_path}`
      );
      return JSON.parse(output);
    } catch (error) {
      this.outputConsole.appendLine(`Git log local failed: ${destination_path}`);
      throw error;
    }
  }

  /**
   * Checkout a specific ref/commit
   */
  async checkout(ref: string, destination_path: string): Promise<boolean> {
    try {
      await this.executeEmbgit(
        ['checkout', '-r', ref, destination_path],
        `Checking out ref ${ref}: ${destination_path}`
      );
      this.outputConsole.appendLine('Git checkout success ...');
      return true;
    } catch (error) {
      this.outputConsole.appendLine(`Git checkout failed: ${destination_path}`);
      throw error;
    }
  }

  /**
   * Generate SSH key pair (ECDSA)
   */
  async generateKeyPair(): Promise<{ privateKey: string; publicKey: string }> {
    const tempDir = this.pathHelper.getTempDir();

    try {
      await this.executeEmbgit(['keygen_ecdsa'], `Generating SSH key pair`, tempDir);

      const privateKey = await fs.readFile(path.join(tempDir, 'id_ecdsa_quiqr'), 'utf-8');
      const publicKey = await fs.readFile(path.join(tempDir, 'id_ecdsa_quiqr.pub'), 'utf-8');

      // Clean up key files
      await fs.unlink(path.join(tempDir, 'id_ecdsa_quiqr'));
      await fs.unlink(path.join(tempDir, 'id_ecdsa_quiqr.pub'));

      this.outputConsole.appendLine('SSH key pair generated successfully');
      return { privateKey, publicKey };
    } catch (error) {
      this.outputConsole.appendLine('SSH key generation failed');
      throw error;
    }
  }

  /**
   * Derive public key from private key (ECDSA)
   * Returns the public key in OpenSSH format
   * Supports P-256 (nistp256), P-384 (nistp384), and P-521 (nistp521) curves
   */
  derivePublicKeyFromPrivate(privateKeyPem: string): string {
    try {
      // Create key object from private key PEM
      const privateKey = crypto.createPrivateKey(privateKeyPem);

      // Get the public key
      const publicKey = crypto.createPublicKey(privateKey);

      // Export as JWK to get the raw key data
      const jwk = publicKey.export({ format: 'jwk' }) as crypto.JsonWebKey;

      // Map JWK curve names to SSH curve names
      const curveMap: Record<string, { keyType: string; curve: string }> = {
        'P-256': { keyType: 'ecdsa-sha2-nistp256', curve: 'nistp256' },
        'P-384': { keyType: 'ecdsa-sha2-nistp384', curve: 'nistp384' },
        'P-521': { keyType: 'ecdsa-sha2-nistp521', curve: 'nistp521' },
      };

      const curveInfo = curveMap[jwk.crv!];
      if (!curveInfo) {
        throw new Error(`Unsupported curve: ${jwk.crv}`);
      }

      const { keyType, curve } = curveInfo;

      // Decode the x and y coordinates from base64url
      const x = Buffer.from(jwk.x!, 'base64url');
      const y = Buffer.from(jwk.y!, 'base64url');

      // Create uncompressed point (0x04 || x || y)
      const point = Buffer.concat([Buffer.from([0x04]), x, y]);

      // Build the SSH key blob
      // Format: [length][key-type][length][curve][length][point]
      const keyTypeLen = Buffer.alloc(4);
      keyTypeLen.writeUInt32BE(keyType.length);

      const curveLen = Buffer.alloc(4);
      curveLen.writeUInt32BE(curve.length);

      const pointLen = Buffer.alloc(4);
      pointLen.writeUInt32BE(point.length);

      const blob = Buffer.concat([
        keyTypeLen,
        Buffer.from(keyType),
        curveLen,
        Buffer.from(curve),
        pointLen,
        point,
      ]);

      return `${keyType} ${blob.toString('base64')}`;
    } catch (error) {
      this.outputConsole.appendLine(`Failed to derive public key: ${error}`);
      throw error;
    }
  }
}
