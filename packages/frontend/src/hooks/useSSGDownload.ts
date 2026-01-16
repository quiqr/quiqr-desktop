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

export interface SSGDownloadState {
  progress: ProgressConfig | null;
  isDownloading: boolean;
  ssgReady: boolean;
  downloadFailed: boolean;
  downloadSSG: (ssgType: string, version: string) => Promise<boolean>;
  cancelDownload: () => void;
  setSSGReady: (ready: boolean) => void;
  resetDownloadState: () => void;
}

/**
 * Hook for downloading SSG binaries with progress streaming via SSE
 *
 * Returns:
 * - progress: Current download progress for ProgressDialog
 * - isDownloading: Whether a download is currently in progress
 * - ssgReady: Whether the SSG is downloaded and ready to use
 * - downloadFailed: Whether the last download attempt failed or was cancelled
 * - downloadSSG: Function to start a download (returns true on success)
 * - cancelDownload: Function to cancel current download
 * - setSSGReady: Function to manually set SSG ready state (e.g., when already installed)
 * - resetDownloadState: Function to reset failed state for retry
 */
export function useSSGDownload(): SSGDownloadState {
  const [progress, setProgress] = useState<ProgressConfig | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [ssgReady, setSSGReady] = useState(false);
  const [downloadFailed, setDownloadFailed] = useState(false);

  // Use refs to track state and EventSource to avoid stale closure issues
  const isDownloadingRef = useRef(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const downloadSSG = useCallback((ssgType: string, version: string): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log('[useSSGDownload] downloadSSG called with type:', ssgType, 'version:', version);

      if (isDownloadingRef.current) {
        console.log('[useSSGDownload] Download already in progress');
        resolve(false);
        return;
      }

      // Reset failed state when starting new download
      setDownloadFailed(false);
      isDownloadingRef.current = true;
      setIsDownloading(true);

      const ssgName = ssgType.charAt(0).toUpperCase() + ssgType.slice(1);
      setProgress({
        title: `Installing ${ssgName}`,
        message: 'Starting...',
        percent: 0,
        visible: true,
      });

      const sseUrl = `http://${window.location.hostname}:5150/api/ssg/download/${encodeURIComponent(ssgType)}/${encodeURIComponent(version)}`;
      console.log('[useSSGDownload] Opening SSE connection to:', sseUrl);

      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[useSSGDownload] SSE connection opened');
      };

      eventSource.onmessage = (event) => {
        console.log('[useSSGDownload] SSE message received:', event.data);
        try {
          const data: DownloadProgress = JSON.parse(event.data);
          console.log('[useSSGDownload] Parsed progress:', data);

          setProgress({
            title: `Installing ${ssgName}`,
            message: data.message,
            percent: data.percent,
            visible: !data.complete,
          });

          if (data.complete) {
            console.log('[useSSGDownload] Download complete, closing connection');
            eventSource.close();
            eventSourceRef.current = null;
            isDownloadingRef.current = false;
            setIsDownloading(false);
            setProgress(null);
            setSSGReady(true);
            setDownloadFailed(false);
            resolve(true);
          }

          if (data.error) {
            console.log('[useSSGDownload] Download error:', data.error);
            eventSource.close();
            eventSourceRef.current = null;
            isDownloadingRef.current = false;
            setIsDownloading(false);
            setProgress(null);
            setDownloadFailed(true);
            resolve(false);
          }
        } catch (parseError) {
          console.error('[useSSGDownload] Error parsing SSE data:', parseError, 'Raw data:', event.data);
        }
      };

      eventSource.onerror = (error) => {
        console.error('[useSSGDownload] SSE connection error:', error);
        console.error('[useSSGDownload] EventSource readyState:', eventSource.readyState);
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
    console.log('[useSSGDownload] cancelDownload called');

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
    ssgReady,
    downloadFailed,
    downloadSSG,
    cancelDownload,
    setSSGReady,
    resetDownloadState,
  };
}
