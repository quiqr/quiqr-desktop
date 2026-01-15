import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route, useParams, useNavigate } from "react-router";
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
import { SiteLibraryLayout, SiteLibraryRouted } from "./containers/SiteLibrary";
import service from "./services/service";
import { getThemeByName } from "./theme";
import { UserPreferences } from "../types";
import { ThemeContext } from "./contexts/ThemeContext";
import { DialogProvider } from "./contexts/DialogProvider";
import { useDialog } from "./hooks/useDialog";
import SyncRoutedWithContext from "./containers/WorkspaceMounted/components/SyncRoutedWithContext";
import SiteConfRoutedWithContext from "./containers/WorkspaceMounted/components/SiteConfRoutedWithContext";

const defaultApplicationRole = "contentEditor";

// Wrapper component for Workspace route that needs params
const WorkspaceRoute = ({ applicationRole, theme }: { applicationRole: string; theme: Theme }) => {
  const { site, workspace } = useParams();
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
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

// Inner component that has access to useDialog
const AppContent = ({ theme }: { theme: Theme }) => {
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const [applicationRole, setApplicationRole] = useState(defaultApplicationRole);
  const [libraryView, setLibraryView] = useState("cards");
  const [showSplashAtStartup, setShowSplashAtStartup] = useState(true);

  useEffect(() => {
    // Set library view from prefs
    service.api.readConfPrefKey("libraryView").then((view) => {
      if (typeof view === "string") {
        setLibraryView(view);
      }
    });

    // Open splash dialog at startup if needed
    service.api.readConfPrefKey("showSplashAtStartup").then((show) => {
      if (typeof show === "undefined") {
        show = true;
      }
      const showBool = show === true || show === "true";
      setShowSplashAtStartup(showBool);
      if (showBool) {
        openDialog('SplashDialog', {
          showSplashAtStartup: showBool,
          onChangeSplashCheck: (checked: boolean) => {
            service.api.saveConfPrefKey("showSplashAtStartup", checked);
          }
        });
      }
    });

    // Set application role
    service.api.readConfPrefKey("applicationRole").then((role) => {
      if (!role) role = defaultApplicationRole;
      if (typeof role === "string") {
        setApplicationRole(role);
      }
    });
  }, [openDialog]);

  const handleLibraryViewChange = (view: string) => {
    service.api.saveConfPrefKey("libraryView", view);
    setLibraryView(view);
  };


  // Main layout wrapper
  const MainLayoutWrapper = () => (
    <ConsoleRedirectHandler>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route path="/prefs/*" element={<PrefsLayout />} />
            <Route path="/sites/*" element={
              <SiteLibraryLayout
                libraryView={libraryView}
                onLibraryViewChange={handleLibraryViewChange}
              >
                <SiteLibraryRouted activeLibraryView={libraryView} />
              </SiteLibraryLayout>
            } />
            <Route path="*" element={
              <SiteLibraryLayout
                libraryView={libraryView}
                onLibraryViewChange={handleLibraryViewChange}
              >
                <SiteLibraryRouted activeLibraryView={libraryView} />
              </SiteLibraryLayout>
            } />
          </Routes>
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

      {/* Workspace - nested routes */}
      <Route
        path="/sites/:site/workspaces/:workspace"
        element={<WorkspaceRoute applicationRole={applicationRole} theme={theme} />}
      >
        {/* Workspace child routes - all inherit site/workspace params */}
        <Route index element={<DashboardRoute />} />
        <Route path="home/:refresh" element={<DashboardRoute />} />
        <Route path="collections/:collection" element={<CollectionRoute />} />
        <Route path="collections/:collection/:item" element={<CollectionItemRoute />} />
        <Route path="collections/:collection/:item/nest/*" element={<CollectionItemRoute />} />
        <Route path="collections/:collection/:item/:refresh" element={<CollectionItemRoute />} />
        <Route path="singles/:single" element={<SingleRoute refreshed={false} />} />
        <Route path="singles/:single/nest/*" element={<SingleRoute refreshed={false} />} />
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
  );
};

// Main App component wrapped with providers
const App = () => {
  const [theme, setTheme] = useState<Theme>(getThemeByName('light'));

  const updateTheme = useCallback((interfaceStyle: string) => {
    const themeMode = interfaceStyle === "quiqr10-dark" ? "dark" : "light";
    setTheme(getThemeByName(themeMode));
  }, []);

  // Load theme from preferences on mount
  useEffect(() => {
    service.api.readConfKey("prefs").then((value: UserPreferences) => {
      if (value.interfaceStyle) {
        updateTheme(value.interfaceStyle);
      }
    });
  }, [updateTheme]);

  return (
    <ThemeContext.Provider value={{ updateTheme }}>
      <DialogProvider>
        <AppContent theme={theme} />
      </DialogProvider>
    </ThemeContext.Provider>
  );
};

export default App;
