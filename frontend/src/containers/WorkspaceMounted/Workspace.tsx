import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router';
import AppsIcon from '@mui/icons-material/Apps';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import BuildIcon from '@mui/icons-material/Build';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SyncIcon from '@mui/icons-material/Sync';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import Dashboard from './Dashboard';
import TopToolbarLeft from '../TopToolbarLeft';
import { TopToolbarRight, ToolbarButton } from '../TopToolbarRight';
import Collection from './Collection';
import CollectionItem from './Collection/CollectionItem';
import Single from './Single';
import WorkspaceSidebar from './WorkspaceSidebar';
import { SiteConfSidebar, SiteConfRouted } from './SiteConf';
import { SyncSidebar, SyncRouted } from './Sync';
import service from '../../services/service';
import Box from '@mui/material/Box';
import { SiteConfig } from '../../../types';
import { useHugoDownload } from '../../hooks/useHugoDownload';
import ProgressDialog from '../../components/ProgressDialog';

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

const SingleRoute = ({ siteKey, workspaceKey, refreshed }: { siteKey: string; workspaceKey: string; refreshed: boolean }) => {
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
  const navigate = useNavigate();
  const location = useLocation();

  const [site, setSite] = useState<SiteConfig | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [menuIsLocked, setMenuIsLocked] = useState(true);
  const [forceShowMenu, setForceShowMenu] = useState(false);
  const [skipMenuTransition, setSkipMenuTransition] = useState(false);
  const [hugoReady, setHugoReady] = useState(false);

  const { progress: hugoProgress, downloadHugo } = useHugoDownload();

  const refresh = useCallback(() => {
    if (siteKey && workspaceKey) {
      service.getSiteAndWorkspaceData(siteKey, workspaceKey)
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

  useEffect(() => {
    if (!site) {
      refresh();
    }
  }, [site, refresh]);

  // Check Hugo version when workspace is loaded
  useEffect(() => {
    if (workspace?.hugover) {
      const checkAndDownloadHugo = async () => {
        try {
          const result = await service.api.checkHugoVersion(workspace.hugover!);
          if (result.installed) {
            setHugoReady(true);
          } else {
            // Hugo not installed, trigger download
            await downloadHugo(workspace.hugover!);
            setHugoReady(true);
          }
        } catch (err) {
          console.error('Failed to check/download Hugo:', err);
          // Continue anyway - user can still browse content
          setHugoReady(true);
        }
      };
      checkAndDownloadHugo();
    } else {
      // No hugover specified, assume ready
      setHugoReady(true);
    }
  }, [workspace?.hugover, downloadHugo]);

  // Reset skipMenuTransition after it's used
  useEffect(() => {
    if (skipMenuTransition) {
      setSkipMenuTransition(false);
    }
  }, [skipMenuTransition]);

  const toggleMenuIsLocked = () => {
    setMenuIsLocked(!menuIsLocked);
    setForceShowMenu(true);
    setSkipMenuTransition(true);
    window.dispatchEvent(new Event('resize'));
  };

  const toggleForceShowMenu = () => {
    setForceShowMenu(!forceShowMenu);
  };

  const openPreviewInBrowser = () => {
    service.api.getCurrentBaseUrl().then((path) => {
      if (typeof path === 'string') {
        window.require('electron').shell.openExternal('http://localhost:13131' + path);
      }
    });
  };

  const showPreviewSiteButton = () => {
    if (workspace?.serve?.[0]?.hugoHidePreviewSite) {
      return null;
    }
    return (
      <ToolbarButton
        key="buttonPreview"
        action={openPreviewInBrowser}
        title="Preview Site"
        icon={OpenInBrowserIcon}
      />
    );
  };

  const toolbarItemsLeft = (activeButton: string) => [
    <ToolbarButton
      key="buttonContent"
      active={activeButton === "content"}
      to={`/sites/${siteKey}/workspaces/${workspaceKey}`}
      title="Content"
      icon={LibraryBooksIcon}
    />,
    <ToolbarButton
      key="buttonSync"
      active={activeButton === "sync"}
      to={`/sites/${siteKey}/workspaces/${workspaceKey}/sync/`}
      title="Sync"
      icon={SyncIcon}
    />,
    applicationRole === 'siteDeveloper' ? (
      <ToolbarButton
        key="buttonSiteConf"
        active={activeButton === "tools"}
        to={`/sites/${siteKey}/workspaces/${workspaceKey}/siteconf/general`}
        title="Tools"
        icon={BuildIcon}
      />
    ) : null,
  ];

  const toolbarItemsRight = () => [
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

  const siteName = site?.name || "";

  // Determine active section based on path
  const path = location.pathname;
  const isSiteConf = path.includes('/siteconf');
  const isSync = path.includes('/sync');
  const activeButton = isSiteConf ? "tools" : isSync ? "sync" : "content";

  const renderToolbarLeft = () => (
    <TopToolbarLeft
      title={siteName}
      siteKey={siteKey}
      workspaceKey={workspaceKey}
    />
  );

  const renderToolbarRight = () => (
    <TopToolbarRight
      key={`toolbar-right-${activeButton}`}
      itemsLeft={toolbarItemsLeft(activeButton)}
      itemsCenter={!isSiteConf ? [showPreviewSiteButton()] : []}
      itemsRight={toolbarItemsRight()}
    />
  );

  const renderSidebar = () => {
    if (isSync) {
      return (
        <SyncSidebar
          menus={[]}
          site={site as SiteConfig & { publish: Array<{ key: string; config?: { type?: string; [key: string]: unknown } }> }}
          workspace={workspace}
          siteKey={siteKey}
          workspaceKey={workspaceKey}
          hideItems={!forceShowMenu && !menuIsLocked}
          menuIsLocked={menuIsLocked}
          onToggleItemVisibility={toggleForceShowMenu}
          onLockMenuClicked={toggleMenuIsLocked}
        />
      );
    }
    if (isSiteConf) {
      return (
        <SiteConfSidebar
          menus={[]}
          siteKey={siteKey}
          workspaceKey={workspaceKey}
          hideItems={!forceShowMenu && !menuIsLocked}
          menuIsLocked={menuIsLocked}
          onToggleItemVisibility={toggleForceShowMenu}
          onLockMenuClicked={toggleMenuIsLocked}
        />
      );
    }
    return (
      <WorkspaceSidebar
        key={location.pathname}
        applicationRole={applicationRole}
        siteKey={siteKey}
        workspaceKey={workspaceKey}
        hideItems={!forceShowMenu && !menuIsLocked}
        menuIsLocked={menuIsLocked}
        onToggleItemVisibility={toggleForceShowMenu}
        onLockMenuClicked={toggleMenuIsLocked}
      />
    );
  };

  const renderContent = () => (
    <Routes>
      <Route path="/" element={<Dashboard siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="home/:refresh" element={<Dashboard siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="sync/*" element={<SyncRouted site={site} workspace={workspace} siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="siteconf/*" element={<SiteConfRouted siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="collections/:collection" element={<CollectionRoute siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="collections/:collection/:item/:refresh" element={<CollectionItemRoute siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="collections/:collection/:item" element={<CollectionItemRoute siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route path="singles/:single/:refresh" element={<SingleRoute siteKey={siteKey} workspaceKey={workspaceKey} refreshed={true} />} />
      <Route path="singles/:single" element={<SingleRoute siteKey={siteKey} workspaceKey={workspaceKey} refreshed={false} />} />
    </Routes>
  );

  return (
    <Box sx={{ marginRight: 0 }}>
      {/* Top Toolbar */}
      <Box
        sx={{
          borderTop: (theme) => `solid 1px ${theme.palette.toolbar.border}`,
          borderBottom: (theme) => `solid 1px ${theme.palette.toolbar.border}`,
          top: 0,
          position: 'absolute',
          display: 'flex',
          width: '100%',
          backgroundColor: (theme) => theme.palette.toolbar.background,
        }}
      >
        {/* Toolbar Left */}
        <Box
          sx={{
            flex: '0 0 280px',
            borderRight: (theme) => `solid 1px ${theme.palette.toolbar.border}`,
            overflowY: 'hidden',
            overflowX: 'hidden',
            height: '50px',
          }}
        >
          {renderToolbarLeft()}
        </Box>

        {/* Toolbar Right */}
        <Box sx={{ flex: 'auto', height: '50px', overflow: 'hidden' }}>
          {renderToolbarRight()}
        </Box>
      </Box>

      {/* Main Container */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          height: 'calc(100vh - 52px)',
          marginTop: '52px',
          overflowX: 'hidden',
        }}
      >
        {/* Sidebar/Menu */}
        <Box
          className="hideScrollbar"
          sx={{
            flex: '0 0 280px',
            overflowY: 'auto',
            overflowX: 'hidden',
            userSelect: 'none',
            background: (theme) => theme.palette.sidebar.background,
            ...(menuIsLocked
              ? {}
              : {
                  position: 'absolute',
                  zIndex: 2,
                  height: '100%',
                  width: '280px',
                  transform: forceShowMenu ? 'translateX(0px)' : 'translateX(-214px)',
                  transition: skipMenuTransition ? 'none' : 'all ease-in-out 0.3s',
                }),
          }}
        >
          {renderSidebar()}
        </Box>

        {/* Content */}
        <Box
          key="main-content"
          onClick={() => {
            if (forceShowMenu) toggleForceShowMenu();
          }}
          sx={{
            flex: 'auto',
            userSelect: 'none',
            overflow: 'auto',
            overflowX: 'hidden',
            ...(menuIsLocked
              ? {}
              : {
                  display: 'block',
                  paddingLeft: '66px',
                  transform: forceShowMenu ? 'translateX(214px)' : 'translateX(0px)',
                  transition: skipMenuTransition ? 'none' : 'all ease-in-out 0.3s',
                }),
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
        </Box>
      </Box>

      {/* Hugo Download Progress Dialog */}
      {hugoProgress && (
        <ProgressDialog conf={hugoProgress} />
      )}
    </Box>
  );
};

export default Workspace;
