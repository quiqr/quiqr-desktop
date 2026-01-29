/**
 * Logger - Main logging singleton with public API
 */

import type { LogLevel, GlobalLogEntry, SiteLogEntry } from './types.js';
import { LogWriter } from './log-writer.js';
import { LogCleaner } from './log-cleaner.js';

export class Logger {
  private writer: LogWriter;
  private cleaner: LogCleaner;
  private logLevel: LogLevel;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.writer = new LogWriter();
    this.cleaner = new LogCleaner();
    this.logLevel = this.getLogLevelFromEnv();
  }

  /**
   * Get log level from QUIQR_LOGLEVEL environment variable
   */
  private getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.QUIQR_LOGLEVEL?.toLowerCase();
    
    switch (envLevel) {
      case 'debug':
        return 'debug';
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info'; // Default log level
    }
  }

  /**
   * Check if a log level should be written based on current log level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warning', 'error'];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  /**
   * Create a timestamp in ISO 8601 format
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Log a global debug message
   */
  debug(category: string, message: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) {
      return;
    }

    const entry: GlobalLogEntry = {
      type: 'global',
      timestamp: this.getTimestamp(),
      level: 'debug',
      category,
      message,
      ...(metadata && { metadata }),
    };

    this.writer.write(entry).catch(err => {
      console.error('Failed to write debug log:', err);
    });
  }

  /**
   * Log a global info message
   */
  info(category: string, message: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) {
      return;
    }

    const entry: GlobalLogEntry = {
      type: 'global',
      timestamp: this.getTimestamp(),
      level: 'info',
      category,
      message,
      ...(metadata && { metadata }),
    };

    this.writer.write(entry).catch(err => {
      console.error('Failed to write info log:', err);
    });
  }

  /**
   * Log a global warning message
   */
  warning(category: string, message: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog('warning')) {
      return;
    }

    const entry: GlobalLogEntry = {
      type: 'global',
      timestamp: this.getTimestamp(),
      level: 'warning',
      category,
      message,
      ...(metadata && { metadata }),
    };

    this.writer.write(entry).catch(err => {
      console.error('Failed to write warning log:', err);
    });
  }

  /**
   * Log a global error message
   */
  error(category: string, message: string, metadata?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) {
      return;
    }

    const entry: GlobalLogEntry = {
      type: 'global',
      timestamp: this.getTimestamp(),
      level: 'error',
      category,
      message,
      ...(metadata && { metadata }),
    };

    this.writer.write(entry).catch(err => {
      console.error('Failed to write error log:', err);
    });
  }

  /**
   * Log a site-specific debug message
   */
  debugSite(
    siteKey: string,
    workspaceKey: string,
    category: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.shouldLog('debug')) {
      return;
    }

    const entry: SiteLogEntry = {
      type: 'site',
      siteKey,
      workspaceKey,
      timestamp: this.getTimestamp(),
      level: 'debug',
      category,
      message,
      ...(metadata && { metadata }),
    };

    this.writer.write(entry).catch(err => {
      console.error('Failed to write site debug log:', err);
    });
  }

  /**
   * Log a site-specific info message
   */
  infoSite(
    siteKey: string,
    workspaceKey: string,
    category: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.shouldLog('info')) {
      return;
    }

    const entry: SiteLogEntry = {
      type: 'site',
      siteKey,
      workspaceKey,
      timestamp: this.getTimestamp(),
      level: 'info',
      category,
      message,
      ...(metadata && { metadata }),
    };

    this.writer.write(entry).catch(err => {
      console.error('Failed to write site info log:', err);
    });
  }

  /**
   * Log a site-specific warning message
   */
  warningSite(
    siteKey: string,
    workspaceKey: string,
    category: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.shouldLog('warning')) {
      return;
    }

    const entry: SiteLogEntry = {
      type: 'site',
      siteKey,
      workspaceKey,
      timestamp: this.getTimestamp(),
      level: 'warning',
      category,
      message,
      ...(metadata && { metadata }),
    };

    this.writer.write(entry).catch(err => {
      console.error('Failed to write site warning log:', err);
    });
  }

  /**
   * Log a site-specific error message
   */
  errorSite(
    siteKey: string,
    workspaceKey: string,
    category: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.shouldLog('error')) {
      return;
    }

    const entry: SiteLogEntry = {
      type: 'site',
      siteKey,
      workspaceKey,
      timestamp: this.getTimestamp(),
      level: 'error',
      category,
      message,
      ...(metadata && { metadata }),
    };

    this.writer.write(entry).catch(err => {
      console.error('Failed to write site error log:', err);
    });
  }

  /**
   * Initialize log cleanup scheduler
   */
  initCleanup(retentionDays: number): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = this.cleaner.scheduleCleanup(retentionDays);
  }

  /**
   * Shutdown the logger (flush pending writes, stop cleanup)
   */
  async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    await this.writer.forceFlush();
  }

  /**
   * Get the LogWriter instance (for API endpoints)
   */
  getWriter(): LogWriter {
    return this.writer;
  }
}

// Export singleton instance
export const logger = new Logger();
