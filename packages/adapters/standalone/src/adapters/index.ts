/**
 * Web Adapters Factory
 *
 * Creates platform adapters for standalone (web) mode.
 * Combines real implementations (menu, window) with dev no-ops for other adapters.
 */

import { createDevAdapters } from '@quiqr/backend';
import type { PlatformAdapters, AppContainer } from '@quiqr/backend';
import { WebMenuAdapter } from './menu-adapter.js';
import { WebWindowAdapter } from './window-adapter.js';
import { WebShellAdapter } from './shell-adapter.js';
import { WebAppInfoAdapter } from './app-info-adapter.js';

/**
 * Create web adapters for standalone mode
 */
export function createWebAdapters(container: AppContainer, rootPath: string): PlatformAdapters {
  // Get base dev adapters
  const devAdapters = createDevAdapters();

  // Create web-specific adapters
  const menuAdapter = new WebMenuAdapter();
  menuAdapter.setContainer(container);

  const windowAdapter = new WebWindowAdapter();
  const shellAdapter = new WebShellAdapter();
  const appInfoAdapter = new WebAppInfoAdapter(rootPath);

  // Return combined adapters
  return {
    ...devAdapters,
    menu: menuAdapter,
    window: windowAdapter,
    shell: shellAdapter,
    appInfo: appInfoAdapter,
  };
}

// Re-export types for convenience
export type { MenuState, MenuDefinition, MenuItemDefinition } from './menu-adapter.js';
