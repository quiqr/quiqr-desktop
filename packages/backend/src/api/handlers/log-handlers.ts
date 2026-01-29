/**
 * Logging API Handlers
 *
 * Handles retrieval and filtering of structured log files
 */

import fs from 'fs-extra';
import path from 'path';
import readline from 'readline';
import type { AppContainer } from '../../config/container.js';
import type { LogEntry, LogLevel, LogQueryOptions, LogQueryResult, LogDatesQuery, LogDatesResult } from '../../logging/types.js';

/**
 * Parse a JSONL log file and return filtered entries
 */
async function readLogFile(
  filePath: string,
  options: LogQueryOptions
): Promise<LogEntry[]> {
  if (!await fs.pathExists(filePath)) {
    return [];
  }

  const entries: LogEntry[] = [];
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) {
      continue;
    }

    try {
      const entry = JSON.parse(line) as LogEntry;

      // Apply filters
      if (options.level && entry.level !== options.level) {
        continue;
      }

      if (options.category && entry.category !== options.category) {
        continue;
      }

      if (options.search) {
        const searchLower = options.search.toLowerCase();
        const messageMatch = entry.message.toLowerCase().includes(searchLower);
        const errorCodeMatch = entry.errorCode?.toLowerCase().includes(searchLower);
        if (!messageMatch && !errorCodeMatch) {
          continue;
        }
      }

      entries.push(entry);
    } catch (error) {
      // Skip invalid JSON lines
      console.error(`Failed to parse log line: ${line}`, error);
    }
  }

  return entries;
}

/**
 * Get available log dates for a directory
 */
async function getLogDatesFromDirectory(
  dirPath: string,
  pattern: RegExp
): Promise<string[]> {
  if (!await fs.pathExists(dirPath)) {
    return [];
  }

  const files = await fs.readdir(dirPath);
  const dates: string[] = [];

  for (const file of files) {
    const match = pattern.exec(file);
    if (match) {
      const date = match[1];
      if (date && !dates.includes(date)) {
        dates.push(date);
      }
    }
  }

  // Sort dates in descending order (newest first)
  return dates.sort().reverse();
}

/**
 * Get application logs
 */
export function createGetApplicationLogsHandler(container: AppContainer) {
  return async (options: LogQueryOptions): Promise<LogQueryResult> => {
    const { date, limit = 100, offset = 0 } = options;
    const writer = container.logger.getWriter();
    const logPath = writer.getApplicationLogPath(date);

    const entries = await readLogFile(logPath, options);
    const total = entries.length;
    const paginatedEntries = entries.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      entries: paginatedEntries,
      total,
      hasMore,
    };
  };
}

/**
 * Get site logs
 */
export function createGetSiteLogsHandler(container: AppContainer) {
  return async ({
    siteKey,
    workspaceKey,
    ...options
  }: LogQueryOptions & { siteKey: string; workspaceKey: string }): Promise<LogQueryResult> => {
    const { date, limit = 100, offset = 0 } = options;
    const writer = container.logger.getWriter();
    const logPath = writer.getSiteLogPath(siteKey, workspaceKey, date);

    const entries = await readLogFile(logPath, options);
    const total = entries.length;
    const paginatedEntries = entries.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      entries: paginatedEntries,
      total,
      hasMore,
    };
  };
}

/**
 * Get available log dates
 */
export function createGetLogDatesHandler(container: AppContainer) {
  return async ({
    type,
    siteKey,
    workspaceKey,
  }: LogDatesQuery): Promise<LogDatesResult> => {
    const writer = container.logger.getWriter();

    if (type === 'application') {
      const logDir = path.dirname(writer.getApplicationLogPath());
      const dates = await getLogDatesFromDirectory(
        logDir,
        /^application-(\d{4}-\d{2}-\d{2})\.jsonl$/
      );
      return { dates };
    } else {
      // Site logs
      if (!siteKey || !workspaceKey) {
        throw new Error('siteKey and workspaceKey are required for site logs');
      }

      const logPath = writer.getSiteLogPath(siteKey, workspaceKey);
      const logDir = path.dirname(logPath);
      const dates = await getLogDatesFromDirectory(
        logDir,
        new RegExp(`^${workspaceKey}-(\\d{4}-\\d{2}-\\d{2})\\.jsonl$`)
      );
      return { dates };
    }
  };
}

/**
 * Create all logging-related handlers
 */
export function createLogHandlers(container: AppContainer) {
  return {
    getApplicationLogs: createGetApplicationLogsHandler(container),
    getSiteLogs: createGetSiteLogsHandler(container),
    getLogDates: createGetLogDatesHandler(container),
  };
}
