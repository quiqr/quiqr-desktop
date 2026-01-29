/**
 * LogCleaner - Enforces retention policy by deleting old log files
 */

import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export class LogCleaner {
  /**
   * Clean old log files based on retention policy
   * @param retentionDays - Number of days to keep logs (0 = never delete)
   */
  async cleanOldLogs(retentionDays: number): Promise<void> {
    if (retentionDays === 0) {
      // Never delete logs
      return;
    }

    const cutoffDate = this.getCutoffDate(retentionDays);

    // Clean global application logs
    await this.cleanDirectory(
      path.join(os.homedir(), 'Quiqr', 'logs'),
      cutoffDate,
      /^application-(\d{4}-\d{2}-\d{2})\.jsonl$/
    );

    // Clean site logs (recursively scan all sites and workspaces)
    await this.cleanSiteLogs(
      path.join(os.homedir(), 'Quiqr', 'sites'),
      cutoffDate
    );
  }

  /**
   * Get cutoff date (files older than this should be deleted)
   */
  private getCutoffDate(retentionDays: number): Date {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    cutoff.setHours(0, 0, 0, 0); // Start of day
    return cutoff;
  }

  /**
   * Clean log files in a directory matching a pattern
   */
  private async cleanDirectory(
    dirPath: string,
    cutoffDate: Date,
    pattern: RegExp
  ): Promise<void> {
    try {
      if (!await fs.pathExists(dirPath)) {
        return;
      }

      const files = await fs.readdir(dirPath);

      for (const file of files) {
        const match = pattern.exec(file);
        if (!match) {
          continue;
        }

        const dateStr = match[1]; // Extract date from filename
        const fileDate = this.parseDate(dateStr);

        if (fileDate && fileDate < cutoffDate) {
          const filePath = path.join(dirPath, file);
          try {
            await fs.remove(filePath);
            console.log(`Deleted old log file: ${filePath}`);
          } catch (error) {
            console.error(`Failed to delete log file ${filePath}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to clean directory ${dirPath}:`, error);
    }
  }

  /**
   * Clean site logs recursively
   */
  private async cleanSiteLogs(sitesDir: string, cutoffDate: Date): Promise<void> {
    try {
      if (!await fs.pathExists(sitesDir)) {
        return;
      }

      const siteKeys = await fs.readdir(sitesDir);

      for (const siteKey of siteKeys) {
        const siteDir = path.join(sitesDir, siteKey);
        const stat = await fs.stat(siteDir);

        if (!stat.isDirectory()) {
          continue;
        }

        // Pattern: {workspaceKey}-YYYY-MM-DD.jsonl
        const pattern = /^(.+)-(\d{4}-\d{2}-\d{2})\.jsonl$/;
        await this.cleanDirectory(siteDir, cutoffDate, pattern);
      }
    } catch (error) {
      console.error(`Failed to clean site logs in ${sitesDir}:`, error);
    }
  }

  /**
   * Parse date string (YYYY-MM-DD) to Date object
   */
  private parseDate(dateStr: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (!match) {
      return null;
    }

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
    const day = parseInt(match[3], 10);

    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    return date;
  }

  /**
   * Schedule periodic cleanup (runs daily)
   */
  scheduleCleanup(retentionDays: number): NodeJS.Timeout {
    // Run cleanup immediately
    this.cleanOldLogs(retentionDays).catch(error => {
      console.error('Failed to run scheduled log cleanup:', error);
    });

    // Schedule daily cleanup (every 24 hours)
    return setInterval(() => {
      this.cleanOldLogs(retentionDays).catch(error => {
        console.error('Failed to run scheduled log cleanup:', error);
      });
    }, 24 * 60 * 60 * 1000);
  }
}
