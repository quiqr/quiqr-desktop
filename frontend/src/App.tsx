import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route, useParams, useNavigate, useLocation } from "react-router";
import { ThemeProvider, StyledEngineProvider, Theme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Workspace from "./containers/WorkspaceMounted/Workspace";
import DashboardRoute from "./containers/WorkspaceMounted/components/DashboardRoute";
import CollectionRoute from "./containers/WorkspaceMounted/components/CollectionRoute";
import CollectionItemRoute from "./containers/WorkspaceMounted/components/CollectionItemRoute";
import SingleRoute from "./containers/WorkspaceMounted/components/SingleRoute";
import Console from "./containers/Console";
import { PrefsLayout } from "./containers/Prefs";
import SplashDialog from "./dialogs/SplashDialog";
import { SiteLibraryLayout, SiteLibraryRouted } from "./containers/SiteLibrary";
import service from "./services/service";
import { getThemeByName } from "./theme";
import { UserPreferences } from "../types";
import { ThemeContext } from "./contexts/ThemeContext";
import SyncRoutedWithContext from "./containers/WorkspaceMounted/components/SyncRoutedWithContext";
import SiteConfRoutedWithContext from "./containers/WorkspaceMounted/components/SiteConfRoutedWithContext";

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
  const location = useLocation();
  const navigate = useNavigate();
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

  // Handle openDialog query parameter from menu actions
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openDialog = params.get('openDialog');

    if (openDialog) {
      // Remove the query parameter from URL
      params.delete('openDialog');
      const newSearch = params.toString();
      const newPath = location.pathname + (newSearch ? `?${newSearch}` : '');
      navigate(newPath, { replace: true });

      // Open the appropriate dialog
      switch (openDialog) {
        case 'newSite':
          setNewSiteDialogOpen(true);
          break;
        case 'importSite':
          setImportSiteDialogOpen(true);
          break;
        case 'welcome':
          setSplashDialogOpen(true);
          break;
      }
    }
  }, [location, navigate]);

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


  // Main layout wrapper using new AppLayout
  const MainLayoutWrapper = () => (
    <ConsoleRedirectHandler>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {welcomeScreen}
          <Routes>
            <Route path="/prefs/*" element={<PrefsLayout />} />
            <Route path="/sites/*" element={
              <SiteLibraryLayout
                libraryView={libraryView}
                onLibraryViewChange={handleLibraryViewChange}
                onDialogOpen={handleLibraryDialogClick}
              >
                <SiteLibraryRouted
                  handleLibraryDialogCloseClick={handleLibraryDialogCloseClick}
                  activeLibraryView={libraryView}
                  newSite={newSiteDialogOpen}
                  importSite={importSiteDialogOpen}
                />
              </SiteLibraryLayout>
            } />
            <Route path="*" element={
              <SiteLibraryLayout
                libraryView={libraryView}
                onLibraryViewChange={handleLibraryViewChange}
                onDialogOpen={handleLibraryDialogClick}
              >
                <SiteLibraryRouted
                  handleLibraryDialogCloseClick={handleLibraryDialogCloseClick}
                  activeLibraryView={libraryView}
                  newSite={newSiteDialogOpen}
                  importSite={importSiteDialogOpen}
                />
              </SiteLibraryLayout>
            } />
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

        {/* Workspace - nested routes */}
        <Route
          path="/sites/:site/workspaces/:workspace"
          element={<WorkspaceRoute applicationRole={applicationRole} welcomeScreen={welcomeScreen} theme={theme} />}
        >
          {/* Workspace child routes - all inherit site/workspace params */}
          <Route index element={<DashboardRoute />} />
          <Route path="home/:refresh" element={<DashboardRoute />} />
          <Route path="collections/:collection" element={<CollectionRoute />} />
          <Route path="collections/:collection/:item" element={<CollectionItemRoute />} />
          <Route path="collections/:collection/:item/:refresh" element={<CollectionItemRoute />} />
          <Route path="singles/:single" element={<SingleRoute refreshed={false} />} />
          <Route path="singles/:single/:refresh" element={<SingleRoute refreshed={true} />} />
          <Route path="sync/*" element={<SyncRoutedWithContext />} />
          <Route path="siteconf/*" element={<SiteConfRoutedWithContext />} />
        </Route>

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
