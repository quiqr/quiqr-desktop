/**
 * Type definitions for structured logging system
 */

export type LogLevel = 'debug' | 'info' | 'warning' | 'error';

export interface BaseLogEntry {
  timestamp: string; // ISO 8601 format: "2026-01-29T10:30:45.123Z"
  level: LogLevel;
  category: string;
  message: string;
  errorCode?: string;
  metadata?: Record<string, unknown>;
}

export interface GlobalLogEntry extends BaseLogEntry {
  type: 'global';
}

export interface SiteLogEntry extends BaseLogEntry {
  type: 'site';
  siteKey: string;
  workspaceKey: string;
}

export type LogEntry = GlobalLogEntry | SiteLogEntry;

export interface LogQueryOptions {
  date?: string; // YYYY-MM-DD format
  level?: LogLevel;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface LogQueryResult {
  entries: LogEntry[];
  total: number;
  hasMore: boolean;
}

export interface LogDatesQuery {
  type: 'application' | 'site';
  siteKey?: string;
  workspaceKey?: string;
}

export interface LogDatesResult {
  dates: string[]; // Array of YYYY-MM-DD dates
}
