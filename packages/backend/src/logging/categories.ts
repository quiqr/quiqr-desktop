/**
 * Category constants for structured logging
 */

// Global log categories
export const GLOBAL_CATEGORIES = {
  ELECTRON_INIT: 'electron-init',
  STANDALONE_INIT: 'standalone-init',
  LLM_CONNECTION: 'llm-connection',
  CONFIG: 'config',
  BACKEND_SERVER: 'backend-server',
  RESOURCE_DOWNLOAD: 'resource-download',
} as const;

// Site log categories
export const SITE_CATEGORIES = {
  SYNC: 'sync',
  CONTENT: 'content',
  BUILDACTION: 'buildaction',
  MODEL: 'model',
  IMPORT: 'import',
  WORKSPACE: 'workspace',
} as const;

export type GlobalCategory = typeof GLOBAL_CATEGORIES[keyof typeof GLOBAL_CATEGORIES];
export type SiteCategory = typeof SITE_CATEGORIES[keyof typeof SITE_CATEGORIES];
export type LogCategory = GlobalCategory | SiteCategory | string; // Allow extensibility

/**
 * Check if a category is a valid global category
 */
export function isGlobalCategory(category: string): boolean {
  return Object.values(GLOBAL_CATEGORIES).includes(category as GlobalCategory);
}

/**
 * Check if a category is a valid site category
 */
export function isSiteCategory(category: string): boolean {
  return Object.values(SITE_CATEGORIES).includes(category as SiteCategory);
}
