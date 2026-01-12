import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import service from '../services/service';
import { snackMessageService } from '../services/ui-service';
import type { WebMenuState, WebMenuActionResult } from '@quiqr/types';

/**
 * Hook for managing menu state in standalone mode
 *
 * Fetches menu state from backend and provides action execution.
 * Uses Server-Sent Events (SSE) for real-time menu state updates.
 */
export function useMenuState() {
  const navigate = useNavigate();
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

        case 'openDialog':
          // TODO: Implement dialog opening logic
          console.log('[Menu] Open dialog:', result.dialog);
          snackMessageService.addSnackMessage(
            `Dialog: ${result.dialog}`,
            { severity: 'info', autoHideDuration: 3000 }
          );
          break;

        case 'openExternal':
          if (result.url) {
            window.open(result.url, '_blank', 'noopener,noreferrer');
          }
          break;

        case 'info':
          if (result.message) {
            snackMessageService.addSnackMessage(
              result.message,
              { severity: 'info', autoHideDuration: 4000 }
            );
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
