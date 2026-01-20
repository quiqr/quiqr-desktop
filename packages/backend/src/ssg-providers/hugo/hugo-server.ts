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
  private currentServerProcess?: ChildProcess;

  constructor(
    config: HugoServerConfig,
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
   */
  stopIfRunning(): void {
    if (this.currentServerProcess) {
      this.outputConsole.appendLine('Stopping Hugo Server...');
      this.outputConsole.appendLine('');

      this.currentServerProcess.kill();
      this.currentServerProcess = undefined;
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
      throw new Error('Could not find hugo executable for version ' + hugover);
    }

    const hugoArgs = ['server', '--bind','0.0.0.0', '--port', '13131', '--disableFastRender'];

    if (this.appConfig.hugoServeDraftMode) {
      this.outputConsole.appendLine('Server Draft Mode Enabled...');
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
        this.outputConsole.appendLine('Hugo Server Error: ' + data);
      });

      this.currentServerProcess.on('close', (code) => {
        this.outputConsole.appendLine('Hugo Server Closed: ' + code);
      });

      stdout.setEncoding('utf8');
      stdout.resume();

      let isFirst = true;
      stdout.on('line', (line: string) => {
        if (isFirst) {
          isFirst = false;
          this.outputConsole.appendLine('Starting Hugo Server...');
          this.outputConsole.appendLine('');
          try {
            this.outputConsole.appendLine('Sending serverLive.');
            this.windowAdapter.sendToRenderer('serverLive', {});
          } catch {
            this.outputConsole.appendLine('Failed to send serverLive message.');
          }
          return;
        }
        this.outputConsole.appendLine(line);
      });
    } catch (e) {
      this.outputConsole.appendLine('Hugo Server failed to start.');
      this.outputConsole.appendLine((e as Error).message);
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
