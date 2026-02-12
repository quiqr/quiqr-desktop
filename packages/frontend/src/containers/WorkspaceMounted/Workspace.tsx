import { useEffect, useState, useCallback } from 'react';
import { useLocation, Outlet } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import service from '../../services/service';
import { useSiteAndWorkspaceData } from '../../queries/hooks';
import { AppLayout } from '../../layouts/AppLayout';
import type { SiteConfig, WorkspaceDetails } from '@quiqr/types';
import { useSSGDownload } from '../../hooks/useSSGDownload';
import { useModelCacheEvents } from '../../hooks/useModelCacheEvents';
import ProgressDialog from '../../components/ProgressDialog';
import { openExternal } from '../../utils/platform';
import useWorkspaceToolbarItems from './hooks/useWorkspaceToolbarItems';
import WorkspaceSidebarSelector from './components/WorkspaceSidebarSelector';

interface WorkspaceProps {
  siteKey: string;
  workspaceKey: string;
  applicationRole?: string;
}

// Context type passed to child routes via Outlet
export interface WorkspaceOutletContext {
  siteKey: string;
  workspaceKey: string;
  site: SiteConfig | undefined;
  workspace: WorkspaceDetails | undefined;
  modelRefreshKey: number;
  ssgReady: boolean;
}

const Workspace = ({ siteKey, workspaceKey, applicationRole }: WorkspaceProps) => {
  const location = useLocation();
  const queryClient = useQueryClient();

  // Replace manual state management with TanStack Query
  const { data, isError, error: queryError } = useSiteAndWorkspaceData(siteKey, workspaceKey);

  const site = data?.site;
  const workspace = data?.workspaceDetails;
  const error = isError ? String(queryError) : null;

  const [modelRefreshKey, setModelRefreshKey] = useState(0);

  const {
    progress: hugoProgress,
    isDownloading,
    ssgReady,
    downloadSSG,
    cancelDownload,
    setSSGReady,
  } = useSSGDownload();

  // Callback for model cache events - invalidate queries instead of manual refresh
  const handleModelCacheCleared = useCallback(() => {
    queryClient.invalidateQueries();
    setModelRefreshKey((k) => k + 1);
  }, [queryClient]);

  // Subscribe to model cache events - refresh workspace data when model files change
  useModelCacheEvents(siteKey, workspaceKey, handleModelCacheCleared);

  // Check Hugo version when workspace is loaded
  useEffect(() => {
    // Wait for workspace data to load before deciding on SSG status
    if (!workspace) {
      return;
    }

    // Get SSG type and version (hugover is preprocessed to ssgVersion by Zod schema)
    const ssgType = workspace.ssgType;
    const ssgVersion = workspace.ssgVersion;

    if (ssgVersion) {
      const checkAndDownloadSSG = async () => {
        try {
          const result = await service.api.checkSSGVersion(ssgType, ssgVersion);
          if (result.installed) {
            setSSGReady(true);
          } else {
            const success = await downloadSSG(ssgType, ssgVersion);
            // ssgReady is set by the hook on success
            if (!success) {
              console.error(`${ssgType} download failed or was cancelled`);
            }
          }
        } catch (err) {
          console.error(`Failed to check/download ${ssgType}:`, err);
          // Still allow UI to render even if SSG check fails
          setSSGReady(true);
        }
      };
      checkAndDownloadSSG();
    } else {
      // No SSG version specified, mark as ready
      setSSGReady(true);
    }
  }, [workspace, downloadSSG, setSSGReady]);

  /**
   * Open preview in browser, ensuring SSG is downloaded first.
   * If SSG is not ready (download failed/cancelled), trigger a new download.
   */
  const openPreviewInBrowser = useCallback(async () => {
    // Get SSG type and version (hugover is preprocessed to ssgVersion by Zod schema)
    const ssgType = workspace?.ssgType || 'hugo';
    const ssgVersion = workspace?.ssgVersion;

    // If SSG is not ready, try to download it first
    if (!ssgReady && ssgVersion) {
      console.log('[Workspace] SSG not ready, triggering download before preview');
      const success = await downloadSSG(ssgType, ssgVersion);
      if (!success) {
        console.log('[Workspace] SSG download failed, cannot open preview');
        return;
      }
    }

    const path = await service.api.getCurrentBaseUrl();
    if (typeof path === 'string') {
      await openExternal('http://localhost:13131' + path);
    }
  }, [ssgReady, workspace?.ssgType, workspace?.ssgVersion, downloadSSG]);

  // Determine active section based on path
  const path = location.pathname;
  const isSiteConf = path.includes('/siteconf');
  const isSync = path.includes('/sync');
  const activeSection = isSiteConf ? 'tools' : isSync ? 'sync' : 'content';

  // Show preview button unless explicitly hidden or in siteconf
  const showPreviewButton = !isSiteConf && !workspace?.serve?.[0]?.hugoHidePreviewSite;

  // Disable preview button while downloading
  const previewButtonDisabled = isDownloading;

  const toolbarItems = useWorkspaceToolbarItems({
    siteKey,
    workspaceKey,
    applicationRole,
    activeSection: activeSection as 'content' | 'sync' | 'tools',
    showPreviewButton,
    previewButtonDisabled,
    onPreviewClick: openPreviewInBrowser,
  });

  const siteName = site?.name || '';

  return (
    <>
      <AppLayout
        title={siteName}
        siteKey={siteKey}
        workspaceKey={workspaceKey}
        showSwitcher={true}
        sidebar={
          <WorkspaceSidebarSelector
            siteKey={siteKey}
            workspaceKey={workspaceKey}
            applicationRole={applicationRole}
            modelRefreshKey={modelRefreshKey}
            activeSection={activeSection as 'content' | 'sync' | 'tools'}
            site={site}
            locationKey={location.pathname}
          />
        }
        toolbar={{
          leftItems: toolbarItems.leftItems,
          centerItems: toolbarItems.centerItems,
          rightItems: toolbarItems.rightItems,
        }}
      >
        {error && (
          <p
            style={{
              color: '#EC407A',
              padding: '10px',
              margin: '16px',
              fontSize: '14px',
              border: 'solid 1px #EC407A',
              borderRadius: 3,
            }}
          >
            {error}
          </p>
        )}
        {/* Outlet renders the nested child routes with context */}
        {ssgReady ? (
          <Outlet
            context={{
              siteKey,
              workspaceKey,
              site,
              workspace,
              modelRefreshKey,
              ssgReady,
            }}
          />
        ) : null}
      </AppLayout>

      {hugoProgress && <ProgressDialog conf={hugoProgress} onClose={cancelDownload} />}
    </>
  );
};

export default Workspace;
