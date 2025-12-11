import { useState, useCallback, useRef } from 'react';

export interface ProgressConfig {
  title: string;
  message: string;
  percent: number;
  visible: boolean;
}

interface DownloadProgress {
  percent: number;
  message: string;
  complete: boolean;
  error?: string;
}

export interface HugoDownloadState {
  progress: ProgressConfig | null;
  isDownloading: boolean;
  hugoReady: boolean;
  downloadFailed: boolean;
  downloadHugo: (version: string) => Promise<boolean>;
  cancelDownload: () => void;
  setHugoReady: (ready: boolean) => void;
  resetDownloadState: () => void;
}

/**
 * Hook for downloading Hugo with progress streaming via SSE
 *
 * Returns:
 * - progress: Current download progress for ProgressDialog
 * - isDownloading: Whether a download is currently in progress
 * - hugoReady: Whether Hugo is downloaded and ready to use
 * - downloadFailed: Whether the last download attempt failed or was cancelled
 * - downloadHugo: Function to start a download (returns true on success)
 * - cancelDownload: Function to cancel current download
 * - setHugoReady: Function to manually set hugo ready state (e.g., when already installed)
 * - resetDownloadState: Function to reset failed state for retry
 */
export function useHugoDownload(): HugoDownloadState {
  const [progress, setProgress] = useState<ProgressConfig | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hugoReady, setHugoReady] = useState(false);
  const [downloadFailed, setDownloadFailed] = useState(false);

  // Use refs to track state and EventSource to avoid stale closure issues
  const isDownloadingRef = useRef(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const downloadHugo = useCallback((version: string): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log('[useHugoDownload] downloadHugo called with version:', version);

      if (isDownloadingRef.current) {
        console.log('[useHugoDownload] Download already in progress');
        resolve(false);
        return;
      }

      // Reset failed state when starting new download
      setDownloadFailed(false);
      isDownloadingRef.current = true;
      setIsDownloading(true);
      setProgress({
        title: 'Installing Hugo',
        message: 'Starting...',
        percent: 0,
        visible: true,
      });

      const sseUrl = `http://${window.location.hostname}:5150/api/hugo/download/${encodeURIComponent(version)}`;
      console.log('[useHugoDownload] Opening SSE connection to:', sseUrl);

      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[useHugoDownload] SSE connection opened');
      };

      eventSource.onmessage = (event) => {
        console.log('[useHugoDownload] SSE message received:', event.data);
        try {
          const data: DownloadProgress = JSON.parse(event.data);
          console.log('[useHugoDownload] Parsed progress:', data);

          setProgress({
            title: 'Installing Hugo',
            message: data.message,
            percent: data.percent,
            visible: !data.complete,
          });

          if (data.complete) {
            console.log('[useHugoDownload] Download complete, closing connection');
            eventSource.close();
            eventSourceRef.current = null;
            isDownloadingRef.current = false;
            setIsDownloading(false);
            setProgress(null);
            setHugoReady(true);
            setDownloadFailed(false);
            resolve(true);
          }

          if (data.error) {
            console.log('[useHugoDownload] Download error:', data.error);
            eventSource.close();
            eventSourceRef.current = null;
            isDownloadingRef.current = false;
            setIsDownloading(false);
            setProgress(null);
            setDownloadFailed(true);
            resolve(false);
          }
        } catch (parseError) {
          console.error('[useHugoDownload] Error parsing SSE data:', parseError, 'Raw data:', event.data);
        }
      };

      eventSource.onerror = (error) => {
        console.error('[useHugoDownload] SSE connection error:', error);
        console.error('[useHugoDownload] EventSource readyState:', eventSource.readyState);
        eventSource.close();
        eventSourceRef.current = null;
        isDownloadingRef.current = false;
        setIsDownloading(false);
        setProgress(null);
        setDownloadFailed(true);
        resolve(false);
      };
    });
  }, []);

  const cancelDownload = useCallback(() => {
    console.log('[useHugoDownload] cancelDownload called');

    // Close the EventSource - this triggers the backend's req.on('close') handler
    // which will cancel the download and clean up partial files
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    isDownloadingRef.current = false;
    setProgress(null);
    setIsDownloading(false);
    setDownloadFailed(true);
  }, []);

  const resetDownloadState = useCallback(() => {
    setDownloadFailed(false);
  }, []);

  return {
    progress,
    isDownloading,
    hugoReady,
    downloadFailed,
    downloadHugo,
    cancelDownload,
    setHugoReady,
    resetDownloadState,
  };
}
