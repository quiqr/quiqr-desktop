/**
 * Eleventy Server
 *
 * Manages the Eleventy development server process.
 */

import { spawn, ChildProcess } from 'child_process';
import fs from 'fs-extra';
import type { PathHelper } from '../../utils/path-helper.js';
import type { AppConfig } from '../../config/app-config.js';
import type { WindowAdapter, OutputConsole } from '../../adapters/types.js';
import type { SSGDevServer } from '../types.js';

/**
 * Eleventy server configuration
 */
export interface EleventyServerConfig {
  workspacePath: string;
  version: string;
  config?: string;
  port?: number;
}

/**
 * EleventyServer - Manages Eleventy development server
 */
export class EleventyServer implements SSGDevServer {
  private config: EleventyServerConfig;
  private pathHelper: PathHelper;
  private appConfig: AppConfig;
  private windowAdapter: WindowAdapter;
  private outputConsole: OutputConsole;
  private currentServerProcess?: ChildProcess;

  constructor(
    config: EleventyServerConfig,
    pathHelper: PathHelper,
    appConfig: AppConfig,
    windowAdapter: WindowAdapter,
    outputConsole: OutputConsole
  ) {
    this.config = config;
    this.pathHelper = pathHelper;
    this.appConfig = appConfig;
    this.windowAdapter = windowAdapter;
    this.outputConsole = outputConsole;
  }

  /**
   * Emit lines from a stream
   */
  private emitLines(stream: NodeJS.ReadableStream): void {
    let backlog = '';
    stream.on('data', (data) => {
      backlog += data;
      let n = backlog.indexOf('\n');
      // got a \n? emit one or more 'line' events
      while (~n) {
        stream.emit('line', backlog.substring(0, n));
        backlog = backlog.substring(n + 1);
        n = backlog.indexOf('\n');
      }
    });
    stream.on('end', () => {
      if (backlog) {
        stream.emit('line', backlog);
      }
    });
  }

  /**
   * Stop the server if it's running
   * Implementation of SSGDevServer.stopIfRunning()
   */
  stopIfRunning(): void {
    if (this.currentServerProcess) {
      this.outputConsole.appendLine('Stopping Eleventy Server...');
      this.outputConsole.appendLine('');

      this.currentServerProcess.kill();
      this.currentServerProcess = undefined;
    }
  }

  /**
   * Get the current server process
   * Implementation of SSGDevServer.getCurrentProcess()
   */
  getCurrentProcess(): ChildProcess | undefined {
    return this.currentServerProcess;
  }

  /**
   * Start the Eleventy development server
   * Implementation of SSGDevServer.serve()
   */
  async serve(): Promise<void> {
    this.stopIfRunning();

    const eleventyBin = this.pathHelper.getSSGBinForVer('eleventy', this.config.version);

    if (!fs.existsSync(eleventyBin)) {
      throw new Error(`Eleventy binary not found for version ${this.config.version}`);
    }

    this.outputConsole.appendLine('======================================');
    this.outputConsole.appendLine('Starting Eleventy Server');
    this.outputConsole.appendLine('======================================');
    this.outputConsole.appendLine('');
    this.outputConsole.appendLine(`Workspace: ${this.config.workspacePath}`);
    this.outputConsole.appendLine(`Eleventy: ${this.config.version}`);
    this.outputConsole.appendLine('');

    const args: string[] = ['--serve', '--watch'];

    // Add config file if specified
    if (this.config.config) {
      args.push('--config', this.config.config);
    }

    // Add port if specified
    if (this.config.port) {
      args.push('--port', this.config.port.toString());
    }

    this.outputConsole.appendLine(`Command: ${eleventyBin} ${args.join(' ')}`);
    this.outputConsole.appendLine('');

    this.currentServerProcess = spawn(eleventyBin, args, {
      cwd: this.config.workspacePath,
      env: {
        ...process.env,
        NODE_ENV: 'development',
      },
    });

    // Handle stdout
    if (this.currentServerProcess.stdout) {
      this.emitLines(this.currentServerProcess.stdout);
      this.currentServerProcess.stdout.on('line', (line: string) => {
        this.outputConsole.appendLine(line);
      });
    }

    // Handle stderr
    if (this.currentServerProcess.stderr) {
      this.emitLines(this.currentServerProcess.stderr);
      this.currentServerProcess.stderr.on('line', (line: string) => {
        this.outputConsole.appendLine(line);
      });
    }

    // Handle process exit
    this.currentServerProcess.on('exit', (code) => {
      this.outputConsole.appendLine('');
      this.outputConsole.appendLine(`Eleventy Server exited with code ${code}`);
      this.currentServerProcess = undefined;
    });

    // Handle errors
    this.currentServerProcess.on('error', (error) => {
      this.outputConsole.appendLine('');
      this.outputConsole.appendLine(`Eleventy Server error: ${error.message}`);
      this.currentServerProcess = undefined;
    });
  }
}
