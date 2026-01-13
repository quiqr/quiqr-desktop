import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import service from '../services/service';
import { snackMessageService } from '../services/ui-service';
import { useDialog } from './useDialog';
import type { WebMenuState, WebMenuActionResult } from '@quiqr/types';

/**
 * Hook for managing menu state in standalone mode
 *
 * Fetches menu state from backend and provides action execution.
 * Uses Server-Sent Events (SSE) for real-time menu state updates.
 */
export function useMenuState() {
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const [menuState, setMenuState] = useState<WebMenuState>({ menus: [], version: 0 });
  const [loading, setLoading] = useState(true);

  const fetchMenuState = async () => {
    try {
      const state = await service.api.getMenuState();
      setMenuState(state);
    } catch (error) {
      console.error('Failed to fetch menu state:', error);
    } finally {
      setLoading(false);
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
                // Navigate to ensure we're on site library page, then open dialog
                navigate('/sites/last');
                openDialog('NewSlashImportSiteDialog', {
                  newOrImport: 'new',
                  mountSite: (siteKey: string) => navigate(`/sites/${siteKey}/workspaces/main`),
                  onSuccess: () => {}
                });
                break;
              case 'importSite':
                navigate('/sites/last');
                openDialog('NewSlashImportSiteDialog', {
                  newOrImport: 'import',
                  mountSite: (siteKey: string) => navigate(`/sites/${siteKey}/workspaces/main`),
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

  useEffect(() => {
    // Initial fetch
    fetchMenuState();

    // Connect to SSE for real-time menu updates
    const eventSource = new EventSource('/api/menu/events');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'menu-changed') {
          // Fetch updated menu state when notified
          fetchMenuState();
        }
      } catch (error) {
        console.error('Error parsing menu SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Menu SSE connection error:', error);
      // EventSource will automatically try to reconnect
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return {
    menuState,
    loading,
    executeMenuAction,
    refresh: fetchMenuState,
  };
}

export default useMenuState;
