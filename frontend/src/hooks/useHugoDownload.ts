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

/**
 * Hook for downloading Hugo with progress streaming via SSE
 */
export function useHugoDownload() {
  const [progress, setProgress] = useState<ProgressConfig | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  // Use a ref to track download state to avoid stale closure issues
  const isDownloadingRef = useRef(false);

  const downloadHugo = useCallback((version: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (isDownloadingRef.current) {
        reject(new Error('Download already in progress'));
        return;
      }

      isDownloadingRef.current = true;
      setIsDownloading(true);
      setProgress({
        title: 'Installing Hugo',
        message: 'Starting...',
        percent: 0,
        visible: true,
      });

      const eventSource = new EventSource(`http://localhost:5150/api/hugo/download/${encodeURIComponent(version)}`);

      eventSource.onmessage = (event) => {
        try {
          const data: DownloadProgress = JSON.parse(event.data);

          setProgress({
            title: 'Installing Hugo',
            message: data.message,
            percent: data.percent,
            visible: !data.complete,
          });

          if (data.complete) {
            eventSource.close();
            isDownloadingRef.current = false;
            setIsDownloading(false);
            setProgress(null);
            resolve();
          }

          if (data.error) {
            eventSource.close();
            isDownloadingRef.current = false;
            setIsDownloading(false);
            setProgress(null);
            reject(new Error(data.error));
          }
        } catch (parseError) {
          console.error('Error parsing SSE data:', parseError);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
        isDownloadingRef.current = false;
        setIsDownloading(false);
        setProgress(null);
        reject(new Error('Connection to server lost'));
      };
    });
  }, []);

  const cancelDownload = useCallback(() => {
    // Note: This only hides the progress dialog - the backend download continues
    isDownloadingRef.current = false;
    setProgress(null);
    setIsDownloading(false);
  }, []);

  return {
    progress,
    isDownloading,
    downloadHugo,
    cancelDownload,
  };
}
