import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route, useParams, useNavigate, useLocation } from "react-router";
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
import { SiteLibrarySidebar, SiteLibraryRouted, useSiteLibraryToolbarItems } from "./containers/SiteLibrary";
import { ToolbarButton } from "./containers/TopToolbarRight";
import { AppLayout } from "./layouts/AppLayout";
import service from "./services/service";
import { getThemeByName } from "./theme";
import { UserPreferences } from "../types";
import { ThemeContext } from "./contexts/ThemeContext";

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
  const [newSiteDialogOpen, setNewSiteDialogOpen] = useState(false);
  const [importSiteDialogOpen, setImportSiteDialogOpen] = useState(false);

  // Function to update theme based on interface style
  const updateTheme = useCallback((interfaceStyle: string) => {
    const themeMode = interfaceStyle === "quiqr10-dark" ? "dark" : "light";
    setTheme(getThemeByName(themeMode));
  }, []);

  useEffect(() => {
    // Set theme from prefs
    service.api.readConfKey("prefs").then((value: UserPreferences) => {
      if (value.interfaceStyle) {
        updateTheme(value.interfaceStyle);
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
      newSite={newSiteDialogOpen}
      importSite={importSiteDialogOpen || !!importSiteURL}
      importSiteURL={importSiteURL}
    />
  );

  // Sidebar content based on route
  const renderSidebar = () => (
    <Routes>
      <Route path="/prefs/*" element={<PrefsSidebar menus={[]} />} />
      <Route path="/create-new" element={null} />
      <Route path="/welcome" element={null} />
      <Route path="*" element={<SiteLibrarySidebar />} />
    </Routes>
  );

  // Main content based on route
  const renderContent = () => (
    <Routes>
      <Route path="/prefs/*" element={<PrefsRouted />} />
      <Route path="/sites/*" element={renderSiteLibraryRouted()} />
      <Route path="*" element={renderSiteLibraryRouted()} />
    </Routes>
  );

  // Prefs toolbar items
  const PrefsToolbarItems = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sp = new URLSearchParams(location.search);
    let backurl = "/sites/last";
    if (sp.has("siteKey")) {
      const siteKey = sp.get("siteKey");
      backurl = `/sites/${siteKey}/workspaces/source`;
    }

    return {
      leftItems: [
        <ToolbarButton
          key="back"
          action={() => navigate(backurl)}
          title="Back"
          icon={ArrowBackIcon}
        />,
      ],
      rightItems: [
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
      ],
    };
  };

  // Site Library layout
  const SiteLibraryLayout = () => {
    const toolbarItems = useSiteLibraryToolbarItems({
      handleLibraryDialogClick,
      activeLibraryView: libraryView,
      handleChange: handleLibraryViewChange,
    });

    return (
      <AppLayout
        title="Site Library"
        sidebar={<SiteLibrarySidebar />}
        toolbar={{
          leftItems: toolbarItems.leftItems,
          centerItems: toolbarItems.centerItems,
          rightItems: toolbarItems.rightItems,
        }}
      >
        {renderSiteLibraryRouted()}
      </AppLayout>
    );
  };

  // Prefs layout
  const PrefsLayout = () => {
    const toolbarItems = PrefsToolbarItems();
    return (
      <AppLayout
        title="Preferences"
        sidebar={<PrefsSidebar menus={[]} />}
        toolbar={{
          leftItems: toolbarItems.leftItems,
          rightItems: toolbarItems.rightItems,
        }}
      >
        <PrefsRouted />
      </AppLayout>
    );
  };

  // Main layout wrapper using new AppLayout
  const MainLayoutWrapper = () => (
    <ConsoleRedirectHandler>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {welcomeScreen}
          <Routes>
            <Route path="/prefs/*" element={<PrefsLayout />} />
            <Route path="/sites/*" element={<SiteLibraryLayout />} />
            <Route path="*" element={<SiteLibraryLayout />} />
          </Routes>
        </ThemeProvider>
      </StyledEngineProvider>
    </ConsoleRedirectHandler>
  );

  return (
    <ThemeContext.Provider value={{ updateTheme }}>
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

        {/* All other routes use AppLayout */}
        <Route path="*" element={<MainLayoutWrapper />} />
      </Routes>
    </ThemeContext.Provider>
  );
};

export default App;
