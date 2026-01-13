import { useState } from 'react';
import { useNavigate } from 'react-router';
import service from '../services/service';
import { snackMessageService } from '../services/ui-service';
import { useDialog } from './useDialog';
import type { WebMenuState, WebMenuActionResult } from '@quiqr/types';

// Fetch once at module level
let cachedMenuState: WebMenuState | undefined;

const menuStatePromise = service.api
  .getMenuState()
  .catch((error): WebMenuState => {
    console.error('Failed to fetch menu state:', error);
    return { menus: [], version: 0 };
  })
  .then((state) => {
    cachedMenuState = state;
    return state;
  });

/**
 * Hook for managing menu state in standalone mode
 *
 * Fetches menu state from backend and provides action execution.
 */
export function useMenuState() {
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const [menuState, setMenuState] = useState<WebMenuState | undefined>(cachedMenuState);

  // If not cached yet, wait for the promise (only happens on first render)
  if (!menuState && !cachedMenuState) {
    menuStatePromise.then(setMenuState);
  }

  const fetchMenuState = async () => {
    try {
      const state = await service.api.getMenuState();
      cachedMenuState = state;
      setMenuState(state);
    } catch (error) {
      console.error('Failed to fetch menu state:', error);
    }
  };

  const executeMenuAction = async (action: string, data?: unknown) => {
    try {
      const result: WebMenuActionResult = await service.api.executeMenuAction({ action, data });

      // Handle different result types
      switch (result.type) {
        case 'navigate':
          if (result.path) {
            navigate(result.path);
          }
          break;

        case 'openExternal':
          if (result.url) {
            window.open(result.url, '_blank', 'noopener,noreferrer');
          }
          break;

        case 'openDialog':
          if (result.dialog) {
            // Open dialog using the dialog system
            switch (result.dialog) {
              case 'newSite':
                openDialog('NewSlashImportSiteDialog', {
                  newOrImport: 'new',
                  mountSite: (siteKey: string) => {
                    // Clear cache to ensure new site is in configurations
                    service.clearCache();
                    navigate(`/sites/${siteKey}/workspaces/main`);
                  },
                  onSuccess: () => {}
                });
                break;
              case 'importSite':
                openDialog('NewSlashImportSiteDialog', {
                  newOrImport: 'import',
                  mountSite: (siteKey: string) => {
                    // Clear cache to ensure new site is in configurations
                    service.clearCache();
                    navigate(`/sites/${siteKey}/workspaces/main`);
                  },
                  onSuccess: () => {}
                });
                break;
              case 'welcome':
                openDialog('SplashDialog', {
                  showSplashAtStartup: false,
                  onChangeSplashCheck: (checked: boolean) => {
                    service.api.saveConfPrefKey("showSplashAtStartup", checked);
                  }
                });
                break;
            }
          }
          break;

        case 'info':
          if (result.message) {
            // Use dialog for multi-line messages (like version info)
            if (result.message.includes('\n')) {
              // Extract title from first line (e.g., "Quiqr Desktop")
              const lines = result.message.split('\n');
              const title = lines[0] || 'Information';
              const message = lines.slice(1).join('\n').trim();
              openDialog('InfoDialog', { title, message });
            } else {
              snackMessageService.addSnackMessage(
                result.message,
                { severity: 'info', autoHideDuration: 4000 }
              );
            }
          }
          break;

        case 'error':
          if (result.message) {
            snackMessageService.addSnackMessage(
              result.message,
              { severity: 'error', autoHideDuration: 6000 }
            );
          }
          break;

        case 'success':
          if (result.refresh) {
            // Refresh menu state after successful action
            await fetchMenuState();
          }
          if (result.message) {
            snackMessageService.addSnackMessage(
              result.message,
              { severity: 'success', autoHideDuration: 3000 }
            );
          }
          break;

        case 'reload':
          // Reload the page to refresh workspace view
          if (result.message) {
            snackMessageService.addSnackMessage(
              result.message,
              { severity: 'success', autoHideDuration: 2000 }
            );
          }
          // Delay reload slightly to show the message
          setTimeout(() => {
            window.location.reload();
          }, 500);
          break;
      }
    } catch (error) {
      console.error('Failed to execute menu action:', error);
    }
  };

  return {
    menuState: menuState || { menus: [], version: 0 },
    loading: menuState === undefined,
    executeMenuAction,
    refresh: fetchMenuState,
  };
}

export default useMenuState;