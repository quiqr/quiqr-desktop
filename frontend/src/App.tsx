import React, { useEffect, useState } from "react";
import { Routes, Route, useParams, useNavigate, useLocation } from "react-router-dom";
import AppsIcon from "@mui/icons-material/Apps";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import { ThemeProvider, StyledEngineProvider, Theme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Workspace from "./containers/WorkspaceMounted/Workspace";
import Console from "./containers/Console";
import { PrefsSidebar, PrefsRouted } from "./containers/Prefs";
import SplashDialog from "./dialogs/SplashDialog";
import { SiteLibrarySidebar, SiteLibraryRouted, SiteLibraryToolbarRight } from "./containers/SiteLibrary";
import { TopToolbarRight, ToolbarButton } from "./containers/TopToolbarRight";
import { MainLayout } from "./layouts";
import service from "./services/service";
import { getThemeByName } from "./theme";
import { UserPreferences } from "../types";

const defaultApplicationRole = "contentEditor";

// Wrapper component for Workspace route that needs params
const WorkspaceRoute = ({ applicationRole, welcomeScreen, theme }: { applicationRole: string; welcomeScreen: React.ReactNode; theme: Theme }) => {
  const { site, workspace } = useParams();
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {welcomeScreen}
        <Workspace
          applicationRole={applicationRole}
          siteKey={decodeURIComponent(site || '')}
          workspaceKey={decodeURIComponent(workspace || '')}
        />
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

// Prefs toolbar with navigation
const PrefsToolbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sp = new URLSearchParams(location.search);
  let backurl = "/sites/last";
  if (sp.has("siteKey")) {
    const siteKey = sp.get("siteKey");
    backurl = `/sites/${siteKey}/workspaces/source`;
  }

  const leftButtons = [
    <ToolbarButton
      key="back"
      action={() => navigate(backurl)}
      title="Back"
      icon={ArrowBackIcon}
    />,
  ];

  const rightButtons = [
    <ToolbarButton
      key="toolbarbutton-library"
      to="/sites/last"
      title="Site Library"
      icon={AppsIcon}
    />,
    <ToolbarButton
      key="buttonPrefs"
      active={true}
      to="/prefs"
      title="Preferences"
      icon={SettingsApplicationsIcon}
    />,
  ];

  return <TopToolbarRight itemsLeft={leftButtons} itemsCenter={[]} itemsRight={rightButtons} />;
};

// Console redirect handler
const ConsoleRedirectHandler = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.has("console")) {
      navigate("/console");
    }
  }, [navigate]);

  return <>{children}</>;
};

const App = () => {
  const [splashDialogOpen, setSplashDialogOpen] = useState(false);
  const [showSplashAtStartup, setShowSplashAtStartup] = useState(false);
  const [applicationRole, setApplicationRole] = useState(defaultApplicationRole);
  const [libraryView, setLibraryView] = useState("cards");
  const [theme, setTheme] = useState<Theme>(getThemeByName('light'));
  const [menuIsLocked, setMenuIsLocked] = useState(true);
  const [forceShowMenu, setForceShowMenu] = useState(false);
  const [skipMenuTransition, setSkipMenuTransition] = useState(false);
  const [newSiteDialogOpen, setNewSiteDialogOpen] = useState(false);
  const [importSiteDialogOpen, setImportSiteDialogOpen] = useState(false);

  useEffect(() => {
    // Set theme from prefs
    service.api.readConfKey("prefs").then((value: UserPreferences) => {
      if (value.interfaceStyle) {
        const themeMode = value.interfaceStyle === "quiqr10-dark" ? "dark" : "light";
        setTheme(getThemeByName(themeMode));
      }
    });

    // Set library view from prefs
    service.api.readConfPrefKey("libraryView").then((view) => {
      if (typeof view === "string") {
        setLibraryView(view);
      }
    });

    // Set splash screen visibility
    service.api.readConfPrefKey("showSplashAtStartup").then((show) => {
      if (typeof show === "undefined") {
        show = true;
      }
      const showBool = show === true || show === "true";
      setSplashDialogOpen(showBool);
      setShowSplashAtStartup(showBool);
    });

    // Set application role
    service.api.readConfPrefKey("applicationRole").then((role) => {
      if (!role) role = defaultApplicationRole;
      if (typeof role === "string") {
        setApplicationRole(role);
      }
    });
  }, []);

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
    window.dispatchEvent(new Event("resize"));
  };

  const toggleForceShowMenu = () => {
    setForceShowMenu(!forceShowMenu);
  };

  const handleLibraryDialogCloseClick = () => {
    setNewSiteDialogOpen(false);
    setImportSiteDialogOpen(false);
  };

  const handleLibraryDialogClick = (openDialog: string) => {
    if (openDialog === "newSiteDialog") {
      setNewSiteDialogOpen(true);
    } else if (openDialog === "importSiteDialog") {
      setImportSiteDialogOpen(true);
    }
  };

  const handleLibraryViewChange = (view: string) => {
    service.api.saveConfPrefKey("libraryView", view);
    setLibraryView(view);
  };

  const welcomeScreen = (
    <SplashDialog
      open={splashDialogOpen}
      showSplashAtStartup={showSplashAtStartup}
      onClose={() => setSplashDialogOpen(false)}
      onChangeSplashCheck={(show) => {
        service.api.saveConfPrefKey("showSplashAtStartup", show);
      }}
    />
  );

  const renderSiteLibraryRouted = (importSiteURL?: string) => (
    <SiteLibraryRouted
      handleLibraryDialogCloseClick={handleLibraryDialogCloseClick}
      activeLibraryView={libraryView}
      key="selectSite"
      newSite={newSiteDialogOpen}
      importSite={importSiteDialogOpen || !!importSiteURL}
      importSiteURL={importSiteURL}
    />
  );

  // Toolbar right content
  const renderToolbarRight = () => (
    <Routes>
      <Route path="/prefs/*" element={<PrefsToolbar />} />
      <Route
        path="*"
        element={
          <SiteLibraryToolbarRight
            handleChange={handleLibraryViewChange}
            handleLibraryDialogClick={handleLibraryDialogClick}
            activeLibraryView={libraryView}
          />
        }
      />
    </Routes>
  );

  // Sidebar content
  const renderSidebar = () => (
    <Routes>
      <Route
        path="/prefs/*"
        element={
          <PrefsSidebar
            menus={[]}
            hideItems={!forceShowMenu && !menuIsLocked}
            menuIsLocked={menuIsLocked}
            onToggleItemVisibility={toggleForceShowMenu}
            onLockMenuClicked={toggleMenuIsLocked}
          />
        }
      />
      <Route path="/create-new" element={null} />
      <Route path="/welcome" element={null} />
      <Route path="*" element={<SiteLibrarySidebar />} />
    </Routes>
  );

  // Main content
  const renderContent = () => (
    <Routes>
      <Route path="/prefs/*" element={<PrefsRouted />} />
      <Route path="/sites/*" element={renderSiteLibraryRouted()} />
      <Route path="*" element={renderSiteLibraryRouted()} />
    </Routes>
  );

  // Main layout wrapper
  const MainLayoutWrapper = () => (
    <ConsoleRedirectHandler>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {welcomeScreen}
          <MainLayout
            toolbarRight={renderToolbarRight()}
            sidebar={renderSidebar()}
            menuIsLocked={menuIsLocked}
            forceShowMenu={forceShowMenu}
            skipMenuTransition={skipMenuTransition}
            onContentClick={() => {
              if (forceShowMenu) toggleForceShowMenu();
            }}
          >
            {renderContent()}
          </MainLayout>
        </ThemeProvider>
      </StyledEngineProvider>
    </ConsoleRedirectHandler>
  );

  return (
    <Routes>
      {/* Console - standalone layout */}
      <Route
        path="/console"
        element={
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Box
                key="main-content"
                sx={{
                  flex: 'auto',
                  userSelect: 'none',
                  overflow: 'auto',
                  overflowX: 'hidden',
                }}
              >
                <Console />
              </Box>
            </ThemeProvider>
          </StyledEngineProvider>
        }
      />

      {/* Workspace - standalone layout */}
      <Route
        path="/sites/:site/workspaces/:workspace/*"
        element={<WorkspaceRoute applicationRole={applicationRole} welcomeScreen={welcomeScreen} theme={theme} />}
      />

      {/* Refresh route - empty */}
      <Route
        path="/refresh"
        element={
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <div />
            </ThemeProvider>
          </StyledEngineProvider>
        }
      />

      {/* All other routes use MainLayout */}
      <Route path="*" element={<MainLayoutWrapper />} />
    </Routes>
  );
};

export default App;
