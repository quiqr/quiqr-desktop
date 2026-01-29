/**
 * Eleventy Server
 *
 * Manages the Eleventy development server process.
 */

import { spawn, ChildProcess } from 'child_process';
import fs from 'fs-extra';
import type { PathHelper } from '../../utils/path-helper.js';
import type { AppConfig } from '../../config/app-config.js';
import type { AppContainer } from '../../config/container.js';
import type { WindowAdapter, OutputConsole } from '../../adapters/types.js';
import type { SSGDevServer } from '../types.js';
import { SITE_CATEGORIES } from '../../logging/index.js';

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
  private container: AppContainer;
  private siteKey: string;
  private workspaceKey: string;
  private currentServerProcess?: ChildProcess;

  constructor(
    config: EleventyServerConfig,
    pathHelper: PathHelper,
    appConfig: AppConfig,
    windowAdapter: WindowAdapter,
    outputConsole: OutputConsole,
    container: AppContainer,
    siteKey: string,
    workspaceKey: string
  ) {
    this.config = config;
    this.pathHelper = pathHelper;
    this.appConfig = appConfig;
    this.windowAdapter = windowAdapter;
    this.outputConsole = outputConsole;
    this.container = container;
    this.siteKey = siteKey;
    this.workspaceKey = workspaceKey;
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
      
      // Log server stop
      this.container.logger.infoSite(
        this.siteKey,
        this.workspaceKey,
        SITE_CATEGORIES.BUILDACTION,
        'Eleventy Server stopping',
        { workspacePath: this.config.workspacePath }
      );

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
    
    // Log server start
    this.container.logger.infoSite(
      this.siteKey,
      this.workspaceKey,
      SITE_CATEGORIES.BUILDACTION,
      'Eleventy Server started',
      { 
        port: this.config.port,
        workspacePath: this.config.workspacePath,
        version: this.config.version,
        command: `${eleventyBin} ${args.join(' ')}`
      }
    );

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
        
        // Also log to structured logs
        // Determine log level based on content
        if (line.includes('ERROR') || line.includes('FATAL') || line.includes('Error')) {
          this.container.logger.errorSite(
            this.siteKey,
            this.workspaceKey,
            SITE_CATEGORIES.BUILDACTION,
            'Eleventy output',
            { message: line }
          );
        } else if (line.includes('WARN') || line.includes('Warning')) {
          this.container.logger.warningSite(
            this.siteKey,
            this.workspaceKey,
            SITE_CATEGORIES.BUILDACTION,
            'Eleventy output',
            { message: line }
          );
        } else {
          // Regular info messages
          this.container.logger.infoSite(
            this.siteKey,
            this.workspaceKey,
            SITE_CATEGORIES.BUILDACTION,
            'Eleventy output',
            { message: line }
          );
        }
      });
    }

    // Handle stderr
    if (this.currentServerProcess.stderr) {
      this.emitLines(this.currentServerProcess.stderr);
      this.currentServerProcess.stderr.on('line', (line: string) => {
        this.outputConsole.appendLine(line);
        
        // Log stderr as errors
        this.container.logger.errorSite(
          this.siteKey,
          this.workspaceKey,
          SITE_CATEGORIES.BUILDACTION,
          'Eleventy error output',
          { message: line }
        );
      });
    }

    // Handle process exit
    this.currentServerProcess.on('exit', (code) => {
      this.outputConsole.appendLine('');
      this.outputConsole.appendLine(`Eleventy Server exited with code ${code}`);
      
      // Log exit
      this.container.logger.infoSite(
        this.siteKey,
        this.workspaceKey,
        SITE_CATEGORIES.BUILDACTION,
        'Eleventy Server exited',
        { exitCode: code }
      );
      
      this.currentServerProcess = undefined;
    });

    // Handle errors
    this.currentServerProcess.on('error', (error) => {
      this.outputConsole.appendLine('');
      this.outputConsole.appendLine(`Eleventy Server error: ${error.message}`);
      
      // Log error
      this.container.logger.errorSite(
        this.siteKey,
        this.workspaceKey,
        SITE_CATEGORIES.BUILDACTION,
        'Eleventy Server error',
        { error: error.message, stack: error.stack }
      );
      
      this.currentServerProcess = undefined;
    });
  }
}
