import { useLocation } from 'react-router';

/**
 * Context for determining active states that depend on current route params
 */
export interface ToolbarActiveStateContext {
  siteKey?: string;
  workspaceKey?: string;
}

/**
 * Active states for all toolbar buttons (left and right side)
 */
export interface ToolbarActiveStates {
  // Left side workspace buttons
  isContentActive: boolean;
  isSyncActive: boolean;
  isToolsActive: boolean;
  isSiteLogsActive: boolean;
  
  // Right side global buttons
  isSiteLibraryActive: boolean;
  isApplicationLogsActive: boolean;
  isPreferencesActive: boolean;
}

/**
 * Shared hook to determine which toolbar buttons should show as active (grey)
 * based on the current route. This centralizes the active state logic for ALL
 * toolbar buttons (both left-side workspace buttons and right-side global buttons).
 * 
 * Active state rules by route:
 * - /sites/{site}/workspaces/{workspace}            → Content: grey, all others: blue
 * - /sites/{site}/workspaces/{workspace}/singles/*     → Content: grey, all others: blue
 * - /sites/{site}/workspaces/{workspace}/collections/* → Content: grey, all others: blue
 * - /sites/{site}/workspaces/{workspace}/sync/*        → Sync: grey, all others: blue
 * - /sites/{site}/workspaces/{workspace}/siteconf/*    → Tools: grey, all others: blue
 * - /sites/{site}/workspaces/{workspace}/logs          → Site Log: grey, all others: blue
 * - /sites (library view)                               → Site Library: grey, all others: blue
 * - /logs/application                                   → Application Log: grey, all others: blue
 * - /prefs/*                                            → Preferences: grey, all others: blue
 * 
 * @param context - Optional context with siteKey/workspaceKey for site-specific routes
 * @returns Object with boolean flags for each toolbar button's active state
 * 
 * @example
 * ```tsx
 * // For workspace-specific routes
 * const states = useToolbarActiveStates({ siteKey: 'my-site', workspaceKey: 'main' });
 * if (states.isContentActive) { ... }
 * 
 * // For global routes
 * const { isPreferencesActive } = useToolbarActiveStates();
 * ```
 */
export function useToolbarActiveStates(context?: ToolbarActiveStateContext): ToolbarActiveStates {
  const location = useLocation();
  const pathname = location.pathname;

  // Build workspace base path if context provided
  const workspaceBasePath = context?.siteKey && context?.workspaceKey
    ? `/sites/${context.siteKey}/workspaces/${context.workspaceKey}`
    : null;

  // LEFT SIDE WORKSPACE BUTTONS
  // Content: Active for base workspace path, singles/*, or collections/* routes
  const isContentActive = workspaceBasePath
    ? pathname === workspaceBasePath ||
      pathname.startsWith(`${workspaceBasePath}/singles`) ||
      pathname.startsWith(`${workspaceBasePath}/collections`)
    : false;

  // Sync: Active for sync/* routes
  const isSyncActive = workspaceBasePath
    ? pathname.startsWith(`${workspaceBasePath}/sync`)
    : false;

  // Tools: Active for siteconf/* routes
  const isToolsActive = workspaceBasePath
    ? pathname.startsWith(`${workspaceBasePath}/siteconf`)
    : false;

  // Site Logs: Active for exact logs route
  const isSiteLogsActive = workspaceBasePath
    ? pathname === `${workspaceBasePath}/logs`
    : false;

  // RIGHT SIDE GLOBAL BUTTONS
  // Application Logs: Active for exact /logs/application route
  const isApplicationLogsActive = pathname === '/logs/application';

  // Preferences: Active for any /prefs* route
  const isPreferencesActive = pathname.startsWith('/prefs');

  // Site Library: Active ONLY for the site library view itself
  // This means: /sites (library) or /sites/last (redirect to library)
  // NOT active for workspace content routes
  const isSiteLibraryActive = 
    (pathname === '/sites' || pathname === '/sites/last') &&
    !isApplicationLogsActive &&
    !isPreferencesActive;

  return {
    // Left side
    isContentActive,
    isSyncActive,
    isToolsActive,
    isSiteLogsActive,
    
    // Right side
    isSiteLibraryActive,
    isApplicationLogsActive,
    isPreferencesActive,
  };
}
