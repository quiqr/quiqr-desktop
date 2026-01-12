import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import service from '../services/service';
import type { WebMenuState, WebMenuActionResult } from '@quiqr/types';

/**
 * Hook for managing menu state in standalone mode
 *
 * Fetches menu state from backend and provides action execution.
 * Polls every 5 seconds for menu state updates.
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
          break;

        case 'openExternal':
          if (result.url) {
            window.open(result.url, '_blank', 'noopener,noreferrer');
          }
          break;

        case 'info':
          // TODO: Show info message (could use snackbar)
          console.log('[Menu] Info:', result.message);
          break;

        case 'error':
          console.error('[Menu] Error:', result.message);
          break;

        case 'success':
          if (result.refresh) {
            // Refresh menu state after successful action
            await fetchMenuState();
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

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchMenuState, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    menuState,
    loading,
    executeMenuAction,
    refresh: fetchMenuState,
  };
}

export default useMenuState;
