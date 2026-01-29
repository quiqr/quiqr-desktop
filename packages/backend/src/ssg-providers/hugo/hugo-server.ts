/**
 * Hugo Server
 *
 * Manages the Hugo development server process.
 */

import { spawn, ChildProcess } from 'child_process';
import fs from 'fs-extra';
import type { PathHelper } from '../../utils/path-helper.js';
import type { AppConfig } from '../../config/app-config.js';
import type { WindowAdapter, OutputConsole } from '../../adapters/types.js';
import type { AppContainer } from '../../config/container.js';
import { SITE_CATEGORIES } from '../../logging/categories.js';

/**
 * Hugo server configuration
 */
export interface HugoServerConfig {
  workspacePath: string;
  hugover: string;
  config?: string;
}

/**
 * HugoServer - Manages Hugo development server
 */
export class HugoServer {
  private config: HugoServerConfig;
  private pathHelper: PathHelper;
  private appConfig: AppConfig;
  private windowAdapter: WindowAdapter;
  private outputConsole: OutputConsole;
  private container: AppContainer;
  private siteKey: string;
  private workspaceKey: string;
  private currentServerProcess?: ChildProcess;

  constructor(
    config: HugoServerConfig,
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
   */
  stopIfRunning(): void {
    if (this.currentServerProcess) {
      this.outputConsole.appendLine('Stopping Hugo Server...');
      this.outputConsole.appendLine('');

      // Log server shutdown
      this.container.logger.infoSite(
        this.siteKey,
        this.workspaceKey,
        SITE_CATEGORIES.BUILDACTION,
        'Stopping Hugo Server',
        {}
      );

      this.currentServerProcess.kill();
      this.currentServerProcess = undefined;
    }

    try {
      this.outputConsole.appendLine('Sending serverDown.');
      this.windowAdapter.sendToRenderer('serverDown', {});
    } catch (e) {
      console.log('Failed to send serverDown message:', e);
    }
  }

  /**
   * Start the Hugo development server
   */
  async serve(): Promise<void> {
    const { config, workspacePath, hugover } = this.config;

    try {
      this.outputConsole.appendLine('Sending serverDown.');
      this.windowAdapter.sendToRenderer('serverDown', {});
    } catch (e) {
      console.log('Failed to send serverDown message:', e);
    }

    this.stopIfRunning();

    const exec = this.pathHelper.getSSGBinForVer('hugo', hugover);

    if (!fs.existsSync(exec)) {
      const error = 'Could not find hugo executable for version ' + hugover;
      this.container.logger.errorSite(
        this.siteKey,
        this.workspaceKey,
        SITE_CATEGORIES.BUILDACTION,
        'Hugo executable not found',
        { errorCode: 'HUGO_EXEC_NOT_FOUND', hugover, exec }
      );
      throw new Error(error);
    }

    const hugoArgs = ['server', '--bind','0.0.0.0', '--port', '13131', '--disableFastRender'];

    if (this.appConfig.hugoServeDraftMode) {
      this.outputConsole.appendLine('Server Draft Mode Enabled...');
      this.container.logger.infoSite(
        this.siteKey,
        this.workspaceKey,
        SITE_CATEGORIES.BUILDACTION,
        'Hugo server draft mode enabled',
        { draftMode: true }
      );
      hugoArgs.push('--buildDrafts');
    }

    if (config) {
      hugoArgs.push('--config', config);
    }

    try {
      this.currentServerProcess = spawn(exec, hugoArgs, {
        cwd: workspacePath,
      });

      const { stdout, stderr } = this.currentServerProcess;

      if (!stdout || !stderr) {
        throw new Error('Failed to get stdout/stderr from Hugo process');
      }

      this.emitLines(stdout);

      stderr.on('data', (data) => {
        const errorMsg = String(data);
        this.outputConsole.appendLine('Hugo Server Error: ' + errorMsg);
        
        // Log Hugo errors
        this.container.logger.errorSite(
          this.siteKey,
          this.workspaceKey,
          SITE_CATEGORIES.BUILDACTION,
          'Hugo server error',
          { errorCode: 'HUGO_SERVER_ERROR', error: errorMsg }
        );
      });

      this.currentServerProcess.on('close', (code) => {
        this.outputConsole.appendLine('Hugo Server Closed: ' + code);
        
        // Log server close
        this.container.logger.infoSite(
          this.siteKey,
          this.workspaceKey,
          SITE_CATEGORIES.BUILDACTION,
          'Hugo server closed',
          { exitCode: code }
        );
      });

      stdout.setEncoding('utf8');
      stdout.resume();

      let isFirst = true;
      stdout.on('line', (line: string) => {
        if (isFirst) {
          isFirst = false;
          this.outputConsole.appendLine('Starting Hugo Server...');
          this.outputConsole.appendLine('');
          
          // Log server start
          this.container.logger.infoSite(
            this.siteKey,
            this.workspaceKey,
            SITE_CATEGORIES.BUILDACTION,
            'Hugo Server started',
            { port: 13131, workspacePath }
          );
          
          try {
            this.outputConsole.appendLine('Sending serverLive.');
            this.windowAdapter.sendToRenderer('serverLive', {});
          } catch {
            this.outputConsole.appendLine('Failed to send serverLive message.');
          }
          return;
        }
        
        // Write to console
        this.outputConsole.appendLine(line);
        
        // Also log to structured logs
        // Determine log level based on content
        if (line.includes('ERROR') || line.includes('FATAL')) {
          this.container.logger.errorSite(
            this.siteKey,
            this.workspaceKey,
            SITE_CATEGORIES.BUILDACTION,
            'Hugo output',
            { message: line }
          );
        } else if (line.includes('WARN')) {
          this.container.logger.warningSite(
            this.siteKey,
            this.workspaceKey,
            SITE_CATEGORIES.BUILDACTION,
            'Hugo output',
            { message: line }
          );
        } else {
          // Regular info messages
          this.container.logger.infoSite(
            this.siteKey,
            this.workspaceKey,
            SITE_CATEGORIES.BUILDACTION,
            'Hugo output',
            { message: line }
          );
        }
      });
    } catch (e) {
      this.outputConsole.appendLine('Hugo Server failed to start.');
      this.outputConsole.appendLine((e as Error).message);
      
      // Log server start failure
      this.container.logger.errorSite(
        this.siteKey,
        this.workspaceKey,
        SITE_CATEGORIES.BUILDACTION,
        'Hugo server failed to start',
        { errorCode: 'HUGO_START_FAILED', error: (e as Error).message }
      );
      
      try {
        this.outputConsole.appendLine('Sending serverDown.');
        this.windowAdapter.sendToRenderer('serverDown', {});
      } catch {
        this.outputConsole.appendLine('Failed to send serverDown message.');
      }
      throw e;
    }
  }

  /**
   * Get the current server process (if running)
   */
  getCurrentProcess(): ChildProcess | undefined {
    return this.currentServerProcess;
  }
}
