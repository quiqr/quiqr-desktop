/**
 * LogWriter - Handles writing log entries to JSONL files with daily rotation
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import type { LogEntry } from './types.js';

export class LogWriter {
  private writeQueue: Array<{ entry: LogEntry; filePath: string }> = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  private isWriting = false;
  private currentDate: string = '';

  constructor() {
    this.currentDate = this.getTodayDate();
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  private getTodayDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get the log file path for global application logs
   */
  getApplicationLogPath(date?: string): string {
    const logDate = date || this.getTodayDate();
    const logsDir = path.join(os.homedir(), 'Quiqr', 'logs');
    return path.join(logsDir, `application-${logDate}.jsonl`);
  }

  /**
   * Get the log file path for site-specific logs
   */
  getSiteLogPath(siteKey: string, workspaceKey: string, date?: string): string {
    const logDate = date || this.getTodayDate();
    const sitesDir = path.join(os.homedir(), 'Quiqr', 'sites');
    return path.join(sitesDir, siteKey, `${workspaceKey}-${logDate}.jsonl`);
  }

  /**
   * Write a log entry asynchronously
   */
  async write(entry: LogEntry): Promise<void> {
    const filePath = entry.type === 'global'
      ? this.getApplicationLogPath()
      : this.getSiteLogPath(entry.siteKey, entry.workspaceKey);

    // Add to queue
    this.writeQueue.push({ entry, filePath });

    // Schedule flush
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }

    this.flushTimeout = setTimeout(() => {
      this.flush().catch(err => {
        console.error('Failed to flush log queue:', err);
      });
    }, 100); // Batch writes every 100ms
  }

  /**
   * Flush the write queue to disk
   */
  private async flush(): Promise<void> {
    if (this.isWriting || this.writeQueue.length === 0) {
      return;
    }

    this.isWriting = true;

    try {
      // Check if date has changed (daily rotation)
      const today = this.getTodayDate();
      if (today !== this.currentDate) {
        this.currentDate = today;
      }

      // Group entries by file path
      const entriesByFile = new Map<string, LogEntry[]>();
      for (const { entry, filePath } of this.writeQueue) {
        if (!entriesByFile.has(filePath)) {
          entriesByFile.set(filePath, []);
        }
        entriesByFile.get(filePath)!.push(entry);
      }

      // Write to each file
      for (const [filePath, entries] of entriesByFile) {
        await this.writeToFile(filePath, entries);
      }

      // Clear the queue
      this.writeQueue = [];
    } finally {
      this.isWriting = false;
    }
  }

  /**
   * Write entries to a specific file
   */
  private async writeToFile(filePath: string, entries: LogEntry[]): Promise<void> {
    try {
      // Ensure directory exists
      await fs.ensureDir(path.dirname(filePath));

      // Convert entries to JSONL format
      const lines = entries.map(entry => JSON.stringify(entry)).join('\n') + '\n';

      // Append to file
      await fs.appendFile(filePath, lines, 'utf8');
    } catch (error) {
      console.error(`Failed to write to log file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Force flush any pending writes (e.g., on shutdown)
   */
  async forceFlush(): Promise<void> {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
    await this.flush();
  }
}
