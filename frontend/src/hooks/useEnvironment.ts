import { use } from 'react';
import service from '../services/service';
import type { EnvironmentInfo } from '@quiqr/types';

// Fetch once at module level and cache the promise
const environmentInfoPromise: Promise<EnvironmentInfo> = service.api
  .getEnvironmentInfo()
  .catch((error) => {
    console.error('Failed to fetch environment info:', error);
    return {
      platform: 'linux' as const,
      isPackaged: false,
    };
  });

/**
 * Hook for getting environment information (platform, isPackaged status)
 *
 * This hook determines whether the app is running in packaged (Electron) mode
 * or standalone (browser) mode. Useful for conditional rendering of UI elements.
 */
export function useEnvironment() {
  const environmentInfo = use(environmentInfoPromise);

  return {
    environmentInfo,
    loading: false, // Already resolved by the time we get here
    /** True if running in packaged Electron app */
    isPackaged: environmentInfo.isPackaged,
    /** True if running in standalone browser mode */
    isStandalone: !environmentInfo.isPackaged,
    platform: environmentInfo.platform,
  };
}

export default useEnvironment;
