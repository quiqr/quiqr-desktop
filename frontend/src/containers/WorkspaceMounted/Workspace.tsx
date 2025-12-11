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
import { useHugoDownload } from '../../hooks/useHugoDownload';
import ProgressDialog from '../../components/ProgressDialog';
import { openExternal } from '../../utils/platform';

interface WorkspaceConfig {
  serve?: Array<{
    hugoHidePreviewSite?: boolean;
    [key: string]: unknown;
  }>;
  hugover?: string;
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
  onPreviewClick,
}: {
  siteKey: string;
  workspaceKey: string;
  applicationRole?: string;
  activeSection: 'content' | 'sync' | 'tools';
  showPreviewButton: boolean;
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

const CollectionItemRoute = ({ siteKey, workspaceKey }: { siteKey: string; workspaceKey: string }) => {
  const { collection, item } = useParams();
  const location = useLocation();
  return (
    <CollectionItem
      key={location.pathname}
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      collectionKey={decodeURIComponent(collection || '')}
      collectionItemKey={decodeURIComponent(item || '')}
    />
  );
};

const SingleRoute = ({
  siteKey,
  workspaceKey,
  refreshed,
}: {
  siteKey: string;
  workspaceKey: string;
  refreshed: boolean;
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
    />
  );
};

const Workspace = ({ siteKey, workspaceKey, applicationRole }: WorkspaceProps) => {
  const location = useLocation();

  const [site, setSite] = useState<SiteConfig | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hugoReady, setHugoReady] = useState(false);

  const { progress: hugoProgress, downloadHugo, cancelDownload } = useHugoDownload();

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

  // Check Hugo version when workspace is loaded
  useEffect(() => {
    if (workspace?.hugover) {
      const checkAndDownloadHugo = async () => {
        try {
          const result = await service.api.checkHugoVersion(workspace.hugover!);
          if (result.installed) {
            setHugoReady(true);
          } else {
            await downloadHugo(workspace.hugover!);
            setHugoReady(true);
          }
        } catch (err) {
          console.error('Failed to check/download Hugo:', err);
          setHugoReady(true);
        }
      };
      checkAndDownloadHugo();
    } else {
      setHugoReady(true);
    }
  }, [workspace?.hugover, downloadHugo]);

  const openPreviewInBrowser = async () => {
    const path = await service.api.getCurrentBaseUrl();
    if (typeof path === 'string') {
      await openExternal('http://localhost:13131' + path);
    }
  };

  // Determine active section based on path
  const path = location.pathname;
  const isSiteConf = path.includes('/siteconf');
  const isSync = path.includes('/sync');
  const activeSection = isSiteConf ? 'tools' : isSync ? 'sync' : 'content';

  // Show preview button unless explicitly hidden or in siteconf
  const showPreviewButton = !isSiteConf && !workspace?.serve?.[0]?.hugoHidePreviewSite;

  const toolbarItems = useWorkspaceToolbarItems({
    siteKey,
    workspaceKey,
    applicationRole,
    activeSection: activeSection as 'content' | 'sync' | 'tools',
    showPreviewButton,
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
      />
    );
  };

  const renderContent = () => (
    <Routes>
      <Route path="/" element={<Dashboard siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="home/:refresh" element={<Dashboard siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route
        path="sync/*"
        element={<SyncRouted site={site} workspace={workspace} siteKey={siteKey} workspaceKey={workspaceKey} />}
      />
      <Route path="siteconf/*" element={<SiteConfRouted siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="collections/:collection" element={<CollectionRoute siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route
        path="collections/:collection/:item/:refresh"
        element={<CollectionItemRoute siteKey={siteKey} workspaceKey={workspaceKey} />}
      />
      <Route
        path="collections/:collection/:item"
        element={<CollectionItemRoute siteKey={siteKey} workspaceKey={workspaceKey} />}
      />
      <Route
        path="singles/:single/:refresh"
        element={<SingleRoute siteKey={siteKey} workspaceKey={workspaceKey} refreshed={true} />}
      />
      <Route
        path="singles/:single"
        element={<SingleRoute siteKey={siteKey} workspaceKey={workspaceKey} refreshed={false} />}
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
        {hugoReady && renderContent()}
      </AppLayout>

      {hugoProgress && <ProgressDialog conf={hugoProgress} onClose={cancelDownload} />}
    </>
  );
};

export default Workspace;
