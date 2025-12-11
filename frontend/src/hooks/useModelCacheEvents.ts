import { useEffect, useRef, useCallback } from 'react';

interface ModelChangeEvent {
  type: 'model-cache-cleared' | 'connected';
  siteKey: string;
  workspaceKey: string;
}

/**
 * Hook to subscribe to model cache change events via SSE
 *
 * When model files change in the workspace's quiqr/model directory,
 * the backend clears its cache and emits an event. This hook
 * listens for those events and calls onCacheCleared when they occur.
 *
 * @param siteKey - The site key to listen for
 * @param workspaceKey - The workspace key to listen for
 * @param onCacheCleared - Callback fired when model cache is cleared
 */
export function useModelCacheEvents(
  siteKey: string,
  workspaceKey: string,
  onCacheCleared: () => void
): void {
  const eventSourceRef = useRef<EventSource | null>(null);
  const onCacheClearedRef = useRef(onCacheCleared);

  // Keep the callback ref up to date
  useEffect(() => {
    onCacheClearedRef.current = onCacheCleared;
  }, [onCacheCleared]);

  useEffect(() => {
    if (!siteKey || !workspaceKey) {
      return;
    }

    const url = `http://localhost:5150/api/workspace/${encodeURIComponent(siteKey)}/${encodeURIComponent(workspaceKey)}/model-events`;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('[useModelCacheEvents] SSE connection opened for', siteKey, workspaceKey);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: ModelChangeEvent = JSON.parse(event.data);

        if (data.type === 'connected') {
          console.log('[useModelCacheEvents] Connected to model events for', siteKey, workspaceKey);
          return;
        }

        if (data.type === 'model-cache-cleared') {
          console.log('[useModelCacheEvents] Model cache cleared, triggering refresh');
          onCacheClearedRef.current();
        }
      } catch (parseError) {
        console.error('[useModelCacheEvents] Error parsing SSE data:', parseError);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[useModelCacheEvents] SSE connection error:', error);
      // EventSource will auto-reconnect by default
    };

    return () => {
      console.log('[useModelCacheEvents] Closing SSE connection');
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [siteKey, workspaceKey]);
}

export default useModelCacheEvents;
