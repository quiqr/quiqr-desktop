import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router';
import service from '../../services/service';
import { AppLayout } from '../../layouts/AppLayout';
import { SiteConfig } from '../../../types';
import { useSSGDownload } from '../../hooks/useSSGDownload';
import { useModelCacheEvents } from '../../hooks/useModelCacheEvents';
import ProgressDialog from '../../components/ProgressDialog';
import { openExternal } from '../../utils/platform';
import useWorkspaceToolbarItems from './hooks/useWorkspaceToolbarItems';
import WorkspaceSidebarSelector from './components/WorkspaceSidebarSelector';
import WorkspaceContentRouter from './components/WorkspaceContentRouter';

interface WorkspaceConfig {
  serve?: Array<{
    hugoHidePreviewSite?: boolean;
    [key: string]: unknown;
  }>;
  ssgType?: string;
  ssgVersion?: string;
  hugover?: string; // Deprecated, for backward compatibility
  [key: string]: unknown;
}

interface WorkspaceProps {
  siteKey: string;
  workspaceKey: string;
  applicationRole?: string;
}

const Workspace = ({ siteKey, workspaceKey, applicationRole }: WorkspaceProps) => {
  const location = useLocation();

  const [site, setSite] = useState<SiteConfig | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelRefreshKey, setModelRefreshKey] = useState(0);

  const {
    progress: hugoProgress,
    isDownloading,
    ssgReady,
    downloadSSG,
    cancelDownload,
    setSSGReady,
  } = useSSGDownload();

  const refresh = useCallback(() => {
    if (siteKey && workspaceKey) {
      service
        .getSiteAndWorkspaceData(siteKey, workspaceKey)
        .then((bundle) => {
          setSite(bundle.site as SiteConfig);
          setWorkspace(bundle.workspaceDetails as WorkspaceConfig);
          setError(null);
        })
        .catch((e: unknown) => {
          setSite(null);
          setWorkspace(null);
          setError(String(e));
        });
    }
  }, [siteKey, workspaceKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Callback for model cache events - clear frontend cache then refresh
  const handleModelCacheCleared = useCallback(() => {
    service.clearCache();
    setModelRefreshKey((k) => k + 1);
    refresh();
  }, [refresh]);

  // Subscribe to model cache events - refresh workspace data when model files change
  useModelCacheEvents(siteKey, workspaceKey, handleModelCacheCleared);

  // Check Hugo version when workspace is loaded
  useEffect(() => {
    // Wait for workspace data to load before deciding on SSG status
    if (workspace === null) {
      return;
    }

    // Get SSG type and version (with backward compatibility for old hugover field)
    const ssgType = workspace.ssgType || 'hugo';
    const ssgVersion = workspace.ssgVersion || workspace.hugover;

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
    // Get SSG type and version with backward compatibility
    const ssgType = workspace?.ssgType || 'hugo';
    const ssgVersion = workspace?.ssgVersion || workspace?.hugover;

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
  }, [ssgReady, workspace?.ssgType, workspace?.ssgVersion, workspace?.hugover, downloadSSG]);

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
        <WorkspaceContentRouter
          siteKey={siteKey}
          workspaceKey={workspaceKey}
          site={site}
          workspace={workspace}
          modelRefreshKey={modelRefreshKey}
          ssgReady={ssgReady}
        />
      </AppLayout>

      {hugoProgress && <ProgressDialog conf={hugoProgress} onClose={cancelDownload} />}
    </>
  );
};

export default Workspace;
