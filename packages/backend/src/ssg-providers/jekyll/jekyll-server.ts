/**
 * Jekyll Server
 *
 * Manages the Jekyll development server process.
 */

import { spawn, ChildProcess } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import type { PathHelper } from '../../utils/path-helper.js';
import type { AppConfig } from '../../config/app-config.js';
import type { WindowAdapter, OutputConsole } from '../../adapters/types.js';
import type { SSGDevServer } from '../types.js';

/**
 * Jekyll server configuration
 */
export interface JekyllServerConfig {
  workspacePath: string;
  version: string;
  config?: string;
  port?: number;
}

/**
 * JekyllServer - Manages Jekyll development server
 */
export class JekyllServer implements SSGDevServer {
  private config: JekyllServerConfig;
  private pathHelper: PathHelper;
  private appConfig: AppConfig;
  private windowAdapter: WindowAdapter;
  private outputConsole: OutputConsole;
  private currentServerProcess?: ChildProcess;

  constructor(
    config: JekyllServerConfig,
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
      this.outputConsole.appendLine('Stopping Jekyll Server...');
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
   * Get the Jekyll wrapper script path
   */
  private getJekyllCommand(): string {
    const installDir = this.pathHelper.getSSGBinDirForVer('jekyll', this.config.version);
    const platform = process.platform;

    if (platform === 'win32') {
      return path.join(installDir, 'jekyll.cmd');
    } else {
      return path.join(installDir, 'jekyll.sh');
    }
  }

  /**
   * Start the Jekyll development server
   * Implementation of SSGDevServer.serve()
   */
  async serve(): Promise<void> {
    this.stopIfRunning();

    const jekyllCommand = this.getJekyllCommand();

    if (!fs.existsSync(jekyllCommand)) {
      throw new Error(`Jekyll not found for version ${this.config.version}. Command: ${jekyllCommand}`);
    }

    this.outputConsole.appendLine('======================================');
    this.outputConsole.appendLine('Starting Jekyll Server');
    this.outputConsole.appendLine('======================================');
    this.outputConsole.appendLine('');
    this.outputConsole.appendLine(`Workspace: ${this.config.workspacePath}`);
    this.outputConsole.appendLine(`Jekyll: ${this.config.version}`);
    this.outputConsole.appendLine('');

    const args: string[] = ['serve'];

    // Add port (default to 13131 for consistency with other SSGs)
    const port = this.config.port || 13131;
    args.push('--port', port.toString());

    // Add live reload
    args.push('--livereload');

    // Incremental builds for faster rebuilds
    args.push('--incremental');

    // Add config file if specified (convert to absolute path)
    if (this.config.config) {
      const configPath = path.isAbsolute(this.config.config)
        ? this.config.config
        : path.join(this.config.workspacePath, this.config.config);
      args.push('--config', configPath);
    }

    this.outputConsole.appendLine(`Command: ${jekyllCommand} ${args.join(' ')}`);
    this.outputConsole.appendLine('');

    // Spawn Jekyll server
    this.currentServerProcess = spawn(jekyllCommand, args, {
      cwd: this.config.workspacePath,
      env: {
        ...process.env,
        JEKYLL_ENV: 'development',
      },
      shell: true, // Use shell to properly execute the wrapper script
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
      this.outputConsole.appendLine(`Jekyll Server exited with code ${code}`);
      this.currentServerProcess = undefined;
    });

    // Handle errors
    this.currentServerProcess.on('error', (error) => {
      this.outputConsole.appendLine('');
      this.outputConsole.appendLine(`Jekyll Server error: ${error.message}`);
      this.currentServerProcess = undefined;
    });
  }
}
