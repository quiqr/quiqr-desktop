import React, { useEffect, useState, useCallback } from "react";
import { Routes, Route, useParams, useNavigate } from "react-router";
import { ThemeProvider, StyledEngineProvider, Theme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useQuery } from '@tanstack/react-query';
import Workspace from "./containers/WorkspaceMounted/Workspace";
import DashboardRoute from "./containers/WorkspaceMounted/components/DashboardRoute";
import CollectionRoute from "./containers/WorkspaceMounted/components/CollectionRoute";
import CollectionItemRoute from "./containers/WorkspaceMounted/components/CollectionItemRoute";
import SingleRoute from "./containers/WorkspaceMounted/components/SingleRoute";
import ApplicationLogs from "./containers/ApplicationLogs";
import SiteLogs from "./containers/SiteLogs";
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
import ChangePasswordRoute from "./auth/ChangePasswordRoute";
import { prefsQueryOptions } from "./queries/options";

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

interface MainLayoutWrapperProps {
  theme: Theme;
  libraryView: string;
  onLibraryViewChange: (view: string) => void;
}

const MainLayoutWrapper = ({ theme, libraryView, onLibraryViewChange }: MainLayoutWrapperProps) => (
  <ConsoleRedirectHandler>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/prefs/*" element={<PrefsLayout />} />
          <Route path="/sites/*" element={
            <SiteLibraryLayout
              libraryView={libraryView}
              onLibraryViewChange={onLibraryViewChange}
            >
              <SiteLibraryRouted activeLibraryView={libraryView} />
            </SiteLibraryLayout>
          } />
          <Route path="*" element={
            <SiteLibraryLayout
              libraryView={libraryView}
              onLibraryViewChange={onLibraryViewChange}
            >
              <SiteLibraryRouted activeLibraryView={libraryView} />
            </SiteLibraryLayout>
          } />
        </Routes>
      </ThemeProvider>
    </StyledEngineProvider>
  </ConsoleRedirectHandler>
);

// Inner component that has access to useDialog
const AppContent = ({ theme }: { theme: Theme }) => {
  const { openDialog } = useDialog();
  const [, setShowSplashAtStartup] = useState(true);

  // Use React Query for preferences - automatically updates when preferences change
  const { data: prefs } = useQuery(prefsQueryOptions.all());
  const applicationRole = (prefs?.applicationRole as string | undefined) ?? defaultApplicationRole;
  const libraryView = (prefs?.sitesListingView as string | undefined) ?? "cards";

  useEffect(() => {
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
  }, [openDialog]);

  const handleLibraryViewChange = useCallback((view: string) => {
    service.api.setUserPreference("sitesListingView", view);
    // No need to update local state - React Query will handle it
  }, []);

  return (
    <Routes>
      {/* Workspace - nested routes */}
      <Route
        path="/sites/:site/workspaces/:workspace/*"
        element={<WorkspaceRoute applicationRole={applicationRole} theme={theme} />}
      >
        {/* Workspace child routes - all inherit site/workspace params */}
        <Route index element={<DashboardRoute />} />
        <Route path="prefs/*" element={<PrefsLayout />} />
        <Route path="collections/:collection/:item" element={<CollectionItemRoute />} />
        <Route path="collections/:collection/:item/nest/*" element={<CollectionItemRoute />} />
        <Route path="collections/:collection/*" element={<CollectionRoute />} />
        <Route path="singles/:single/*" element={<SingleRoute refreshed={false} />} />
        <Route path="singles/:single/nest/*" element={<SingleRoute refreshed={false} />} />
        <Route path="singles/:single/:refresh" element={<SingleRoute refreshed={true} />} />
        <Route path="logs" element={<SiteLogs />} />
        <Route path="sync/*" element={<SyncRoutedWithContext />} />
        <Route path="siteconf/*" element={<SiteConfRoutedWithContext />} />
        <Route path="*" element={<DashboardRoute />} />
      </Route>

      {/* Application Logs - top-level route with SiteLibrary layout */}
      <Route
        path="/logs/application"
        element={
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <SiteLibraryLayout
                libraryView={libraryView}
                onLibraryViewChange={handleLibraryViewChange}
              >
                <ApplicationLogs />
              </SiteLibraryLayout>
            </ThemeProvider>
          </StyledEngineProvider>
        }
      />

      {/* Change password route (from User menu) */}
      <Route path="/change-password" element={<ChangePasswordRoute />} />

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
      <Route path="*" element={<MainLayoutWrapper theme={theme} libraryView={libraryView} onLibraryViewChange={handleLibraryViewChange} />} />
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
    service.api.getEffectivePreferences().then((value: UserPreferences) => {
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
