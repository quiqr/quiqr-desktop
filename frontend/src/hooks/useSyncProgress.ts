import { useState, useCallback, useRef } from 'react';

export interface SyncProgress {
  message: string;
  progress: number;
  complete: boolean;
  error?: string;
  result?: unknown;
}

interface PublishConf {
  type: string;
  [key: string]: unknown;
}

/**
 * Hook for sync operations with progress streaming via SSE
 *
 * Since we need to POST complex data, we use fetch with a readable stream
 * instead of EventSource (which only supports GET).
 */
export function useSyncProgress() {
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Parse SSE data from a text chunk
   */
  const parseSSEData = (chunk: string): SyncProgress[] => {
    const results: SyncProgress[] = [];
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          results.push(data);
        } catch {
          // Ignore parse errors for incomplete chunks
        }
      }
    }

    return results;
  };

  /**
   * Execute a sync operation with progress streaming
   */
  const executeSyncWithProgress = useCallback(async (
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<unknown> => {
    if (isSyncingRef.current) {
      throw new Error('Sync operation already in progress');
    }

    isSyncingRef.current = true;
    setIsSyncing(true);
    setProgress({ message: 'Starting...', progress: 0, complete: false });

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`http://localhost:5150${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result: unknown = null;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = parseSSEData(buffer);

        // Clear processed data from buffer (keep incomplete lines)
        const lastNewline = buffer.lastIndexOf('\n');
        if (lastNewline !== -1) {
          buffer = buffer.slice(lastNewline + 1);
        }

        for (const event of events) {
          setProgress(event);

          if (event.complete) {
            result = event.result;
          }

          if (event.error) {
            throw new Error(event.error);
          }
        }
      }

      return result;
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Publish/push to remote with progress
   */
  const publishSite = useCallback(async (
    siteKey: string,
    publishConf: PublishConf
  ): Promise<unknown> => {
    return executeSyncWithProgress('/api/sync/publish/stream', {
      siteKey,
      publishConf,
    });
  }, [executeSyncWithProgress]);

  /**
   * Merge/pull from remote with progress
   */
  const mergeSite = useCallback(async (
    siteKey: string,
    publishConf: PublishConf
  ): Promise<unknown> => {
    return executeSyncWithProgress('/api/sync/merge/stream', {
      siteKey,
      publishConf,
    });
  }, [executeSyncWithProgress]);

  /**
   * Execute a generic sync action with progress
   */
  const dispatchAction = useCallback(async (
    siteKey: string,
    publishConf: PublishConf,
    action: string,
    actionParameters?: unknown
  ): Promise<unknown> => {
    return executeSyncWithProgress('/api/sync/action/stream', {
      siteKey,
      publishConf,
      action,
      actionParameters,
    });
  }, [executeSyncWithProgress]);

  /**
   * Cancel the current sync operation
   */
  const cancelSync = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isSyncingRef.current = false;
    setIsSyncing(false);
    setProgress(null);
  }, []);

  /**
   * Clear progress state
   */
  const clearProgress = useCallback(() => {
    setProgress(null);
  }, []);

  return {
    progress,
    isSyncing,
    publishSite,
    mergeSite,
    dispatchAction,
    cancelSync,
    clearProgress,
  };
}
