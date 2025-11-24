/**
 * Quiqr Backend Package
 *
 * Platform-agnostic backend for Quiqr Desktop CMS.
 * Uses dependency injection and adapter pattern for platform abstraction.
 *
 * @packageDocumentation
 */

// Adapters
export * from './adapters/index.js';

// Configuration
export * from './config/index.js';

// Utilities
export * from './utils/index.js';

// Re-export common types from @quiqr/types for convenience
export type {
  AppConfig as AppConfigType,
  UserPreferences,
  SiteConfig,
  Workspace,
  WorkspaceDetails,
} from '@quiqr/types';
