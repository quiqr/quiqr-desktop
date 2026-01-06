import { useCallback } from 'react';
import { useSSGDownload, type ProgressConfig } from './useSSGDownload';

export type { ProgressConfig };

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
 * @deprecated Use useSSGDownload instead
 * Hook for downloading Hugo with progress streaming via SSE (backward compatibility wrapper)
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
  // Use the new generic SSG download hook with 'hugo' as the type
  const {
    progress,
    isDownloading,
    ssgReady,
    downloadFailed,
    downloadSSG,
    cancelDownload,
    setSSGReady,
    resetDownloadState,
  } = useSSGDownload();

  // Wrap downloadSSG to accept only version (ssgType is hardcoded to 'hugo')
  const downloadHugo = useCallback(
    (version: string) => downloadSSG('hugo', version),
    [downloadSSG]
  );

  return {
    progress,
    isDownloading,
    hugoReady: ssgReady,
    downloadFailed,
    downloadHugo,
    cancelDownload,
    setHugoReady: setSSGReady,
    resetDownloadState,
  };
}
