/**
 * Configuration Module
 *
 * Exports configuration management, runtime state, and dependency injection container.
 *
 * The unified configuration system provides:
 * - Hierarchical config: Instance → Users → Sites
 * - Layered resolution: App Defaults < Instance Defaults < User Prefs < Instance Forced
 * - Environment variable overrides (QUIQR_* prefix)
 * - Automatic migration from legacy config
 */

// Legacy config (for backward compatibility during transition)
export * from './app-config.js';
export * from './app-state.js';
export * from './container.js';

// Unified configuration system
export * from './config-store.js';
export * from './env-override-layer.js';
export * from './config-resolver.js';
export * from './unified-config-service.js';
export * from './config-migrator.js';
