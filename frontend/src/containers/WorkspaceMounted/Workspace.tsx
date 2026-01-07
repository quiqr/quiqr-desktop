import { useEffect, useState, useCallback, ReactNode } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router';
import AppsIcon from '@mui/icons-material/Apps';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import BuildIcon from '@mui/icons-material/Build';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SyncIcon from '@mui/icons-material/Sync';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import Dashboard from './Dashboard';
import { ToolbarButton } from '../TopToolbarRight';
import Collection from './Collection';
import CollectionItem from './Collection/CollectionItem';
import Single from './Single';
import WorkspaceSidebar from './WorkspaceSidebar';
import { SiteConfSidebar, SiteConfRouted } from './SiteConf';
import { SyncSidebar, SyncRouted } from './Sync';
import service from '../../services/service';
import { AppLayout } from '../../layouts/AppLayout';
import { SiteConfig } from '../../../types';
import { useSSGDownload } from '../../hooks/useSSGDownload';
import { useModelCacheEvents } from '../../hooks/useModelCacheEvents';
import ProgressDialog from '../../components/ProgressDialog';
import { openExternal } from '../../utils/platform';

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

interface ToolbarItemsResult {
  leftItems: ReactNode[];
  centerItems: ReactNode[];
  rightItems: ReactNode[];
}

// Hook to generate toolbar items for workspace
export const useWorkspaceToolbarItems = ({
  siteKey,
  workspaceKey,
  applicationRole,
  activeSection,
  showPreviewButton,
  previewButtonDisabled,
  onPreviewClick,
}: {
  siteKey: string;
  workspaceKey: string;
  applicationRole?: string;
  activeSection: 'content' | 'sync' | 'tools';
  showPreviewButton: boolean;
  previewButtonDisabled: boolean;
  onPreviewClick: () => void;
}): ToolbarItemsResult => {
  const navigate = useNavigate();

  const leftItems: ReactNode[] = [
    <ToolbarButton
      key="buttonContent"
      active={activeSection === 'content'}
      to={`/sites/${siteKey}/workspaces/${workspaceKey}`}
      title="Content"
      icon={LibraryBooksIcon}
    />,
    <ToolbarButton
      key="buttonSync"
      active={activeSection === 'sync'}
      to={`/sites/${siteKey}/workspaces/${workspaceKey}/sync/`}
      title="Sync"
      icon={SyncIcon}
    />,
  ];

  if (applicationRole === 'siteDeveloper') {
    leftItems.push(
      <ToolbarButton
        key="buttonSiteConf"
        active={activeSection === 'tools'}
        to={`/sites/${siteKey}/workspaces/${workspaceKey}/siteconf/general`}
        title="Tools"
        icon={BuildIcon}
      />
    );
  }

  const centerItems: ReactNode[] = [];
  if (showPreviewButton) {
    centerItems.push(
      <ToolbarButton
        key="buttonPreview"
        action={onPreviewClick}
        title="Preview Site"
        icon={OpenInBrowserIcon}
        disabled={previewButtonDisabled}
      />
    );
  }

  const rightItems: ReactNode[] = [
    <ToolbarButton
      key="buttonLog"
      action={() => service.api.showLogWindow()}
      title="Log"
      icon={DeveloperModeIcon}
    />,
    <ToolbarButton
      key="buttonLibrary"
      action={() => {
        service.api.openSiteLibrary().then(() => {
          navigate('/sites/last');
        });
      }}
      title="Site Library"
      icon={AppsIcon}
    />,
    <ToolbarButton
      key="buttonPrefs"
      to={`/prefs/?siteKey=${siteKey}`}
      title="Preferences"
      icon={SettingsApplicationsIcon}
    />,
  ];

  return { leftItems, centerItems, rightItems };
};

// Wrapper components for routes that need useParams
const CollectionRoute = ({ siteKey, workspaceKey }: { siteKey: string; workspaceKey: string }) => {
  const { collection } = useParams();
  const location = useLocation();
  return (
    <Collection
      key={location.pathname}
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      collectionKey={decodeURIComponent(collection || '')}
    />
  );
};

const CollectionItemRoute = ({
  siteKey,
  workspaceKey,
  modelRefreshKey,
}: {
  siteKey: string;
  workspaceKey: string;
  modelRefreshKey: number;
}) => {
  const { collection, item } = useParams();
  const location = useLocation();
  return (
    <CollectionItem
      key={location.pathname}
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      collectionKey={decodeURIComponent(collection || '')}
      collectionItemKey={decodeURIComponent(item || '')}
      modelRefreshKey={modelRefreshKey}
    />
  );
};

const SingleRoute = ({
  siteKey,
  workspaceKey,
  refreshed,
  modelRefreshKey,
}: {
  siteKey: string;
  workspaceKey: string;
  refreshed: boolean;
  modelRefreshKey: number;
}) => {
  const { single } = useParams();
  const location = useLocation();
  return (
    <Single
      key={location.pathname}
      siteKey={siteKey}
      refreshed={refreshed}
      workspaceKey={workspaceKey}
      singleKey={decodeURIComponent(single || '')}
      modelRefreshKey={modelRefreshKey}
    />
  );
};

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

  const renderSidebar = () => {
    if (isSync) {
      return (
        <SyncSidebar
          site={
            site as SiteConfig & {
              publish: Array<{ key: string; config?: { type?: string; [key: string]: unknown } }>;
            }
          }
          siteKey={siteKey}
          workspaceKey={workspaceKey}
        />
      );
    }
    if (isSiteConf) {
      return <SiteConfSidebar siteKey={siteKey} workspaceKey={workspaceKey} />;
    }
    return (
      <WorkspaceSidebar
        key={location.pathname}
        applicationRole={applicationRole}
        siteKey={siteKey}
        workspaceKey={workspaceKey}
        modelRefreshKey={modelRefreshKey}
      />
    );
  };

  const renderContent = () => (
    <Routes>
      <Route
        path="/"
        element={<Dashboard siteKey={siteKey} workspaceKey={workspaceKey} hugoReady={ssgReady} />}
      />
      <Route
        path="home/:refresh"
        element={<Dashboard siteKey={siteKey} workspaceKey={workspaceKey} hugoReady={ssgReady} />}
      />
      <Route
        path="sync/*"
        element={<SyncRouted site={site} workspace={workspace} siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />}
      />
      <Route path="siteconf/*" element={<SiteConfRouted siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />} />
      <Route path="collections/:collection" element={<CollectionRoute siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route
        path="collections/:collection/:item/:refresh"
        element={<CollectionItemRoute siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />}
      />
      <Route
        path="collections/:collection/:item"
        element={<CollectionItemRoute siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />}
      />
      <Route
        path="singles/:single/:refresh"
        element={<SingleRoute siteKey={siteKey} workspaceKey={workspaceKey} refreshed={true} modelRefreshKey={modelRefreshKey} />}
      />
      <Route
        path="singles/:single"
        element={<SingleRoute siteKey={siteKey} workspaceKey={workspaceKey} refreshed={false} modelRefreshKey={modelRefreshKey} />}
      />
    </Routes>
  );

  return (
    <>
      <AppLayout
        title={siteName}
        siteKey={siteKey}
        workspaceKey={workspaceKey}
        sidebar={renderSidebar()}
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
        {ssgReady && renderContent()}
      </AppLayout>

      {hugoProgress && <ProgressDialog conf={hugoProgress} onClose={cancelDownload} />}
    </>
  );
};

export default Workspace;
