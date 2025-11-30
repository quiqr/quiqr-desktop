import React from "react";
import { Switch, Route } from "react-router-dom";
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

type AppState = {
  splashDialogOpen: boolean;
  showSplashAtStartup: boolean;
  applicationRole: string;
  libraryView: string;
  theme: Theme;
  menuIsLocked: boolean;
  forceShowMenu: boolean;
  skipMenuTransition: boolean;
  quiqrDomain: string;
  newSiteDialogOpen?: boolean;
  importSiteDialogOpen?: boolean;
};

class App extends React.Component<null, AppState> {
  _ismounted?: boolean;
  history?: { push: (path: string, state?: unknown) => void };

  constructor(props: null) {
    super(props);

    const theme = getThemeByName('light');

    this.state = {
      splashDialogOpen: false,
      showSplashAtStartup: false,
      applicationRole: defaultApplicationRole,
      libraryView: "cards",
      theme: theme,
      menuIsLocked: true,
      forceShowMenu: false,
      skipMenuTransition: false,
      quiqrDomain: "",
    };
  }

  setThemeStyleFromPrefs() {
    service.api.readConfKey("prefs").then((value: UserPreferences) => {
      if (value.interfaceStyle) {
        const themeMode = value.interfaceStyle === "quiqr10-dark" ? "dark" : "light";
        this.setState({
          theme: getThemeByName(themeMode),
        });
      }
    });
  }

  componentDidMount() {
    this._ismounted = true;

    this.setThemeStyleFromPrefs();

    service.api.readConfPrefKey("libraryView").then((view) => {
      if (typeof view === "string") {
        this.setState({ libraryView: view });
      }
    });

    service.api.readConfPrefKey("showSplashAtStartup").then((show) => {
      if (typeof show == "undefined") {
        show = true;
      }

      const showBool = show === true || show === "true";
      this.setState({
        splashDialogOpen: showBool,
        showSplashAtStartup: showBool,
      });
    });

    this.setApplicationRole();
  }

  setApplicationRole() {
    service.api.readConfPrefKey("applicationRole").then((role) => {
      if (!role) role = defaultApplicationRole;

      if (typeof role === "string") {
        this.setState({ applicationRole: role });
      }
    });
  }

  toggleMenuIsLocked() {
    const menuIsLocked = !this.state.menuIsLocked;
    this.setState({ menuIsLocked, forceShowMenu: true, skipMenuTransition: true });
    window.dispatchEvent(new Event("resize"));
  }

  toggleForceShowMenu() {
    const forceShowMenu = !this.state.forceShowMenu;
    this.setState({ forceShowMenu });
  }

  handleLibraryDialogCloseClick() {
    this.setState({
      newSiteDialogOpen: false,
      importSiteDialogOpen: false,
    });
  }

  handleLibraryDialogClick(openDialog: string) {
    if (openDialog === "newSiteDialog") {
      this.setState({ newSiteDialogOpen: true });
    } else if (openDialog === "importSiteDialog") {
      this.setState({ importSiteDialogOpen: true });
    }
  }

  handleLibraryViewChange(view: string) {
    service.api.saveConfPrefKey("libraryView", view);
    this.setState({ libraryView: view });
  }

  renderWelcomeScreen() {
    return (
      <SplashDialog
        open={this.state.splashDialogOpen}
        showSplashAtStartup={this.state.showSplashAtStartup}
        onClose={() => {
          this.setState({ splashDialogOpen: false });
        }}
        onChangeSplashCheck={(show) => {
          service.api.saveConfPrefKey("showSplashAtStartup", show);
        }}
      />
    );
  }

  renderSiteLibraryRouted(importSiteURL?: string) {
    return (
      <SiteLibraryRouted
        handleLibraryDialogCloseClick={() => this.handleLibraryDialogCloseClick()}
        activeLibraryView={this.state.libraryView}
        key={"selectSite"}
        newSite={this.state.newSiteDialogOpen}
        importSite={this.state.importSiteDialogOpen || !!importSiteURL}
        importSiteURL={importSiteURL}
      />
    );
  }

  // Render toolbar based on current route
  renderToolbarRight() {
    return (
      <Switch>
        <Route
          path='/prefs'
          render={({ history }) => {
            const sp = new URLSearchParams(history.location.search);
            let backurl = "/sites/last";
            if (sp.has("siteKey")) {
              const siteKey = sp.get("siteKey");
              backurl = `/sites/${siteKey}/workspaces/source`;
            }
            const leftButtons = [
              <ToolbarButton
                key={"back"}
                action={() => {
                  history.push(backurl);
                }}
                title='Back'
                icon={ArrowBackIcon}
              />,
            ];

            const rightButtons = [
              <ToolbarButton
                key={"toolbarbutton-library"}
                to="/sites/last"
                title='Site Library'
                icon={AppsIcon}
              />,
              <ToolbarButton
                key='buttonPrefs'
                active={true}
                to="/prefs"
                title='Preferences'
                icon={SettingsApplicationsIcon}
              />,
            ];

            return <TopToolbarRight itemsLeft={leftButtons} itemsCenter={[]} itemsRight={rightButtons} />;
          }}
        />
        <Route
          path='/'
          render={() => (
            <SiteLibraryToolbarRight
              handleChange={(v) => this.handleLibraryViewChange(v)}
              handleLibraryDialogClick={(v) => this.handleLibraryDialogClick(v)}
              activeLibraryView={this.state.libraryView}
            />
          )}
        />
      </Switch>
    );
  }

  // Render sidebar based on current route
  renderSidebar() {
    return (
      <Switch>
        <Route
          path='/prefs'
          render={() => (
            <PrefsSidebar
              menus={[]}
              hideItems={!this.state.forceShowMenu && !this.state.menuIsLocked}
              menuIsLocked={this.state.menuIsLocked}
              onToggleItemVisibility={() => {
                this.toggleForceShowMenu();
              }}
              onLockMenuClicked={() => {
                this.toggleMenuIsLocked();
              }}
            />
          )}
        />
        <Route
          path='/create-new'
          render={() => null}
        />
        <Route
          path='/welcome'
          render={() => null}
        />
        <Route
          path='/'
          render={() => <SiteLibrarySidebar />}
        />
      </Switch>
    );
  }

  // Render content based on current route
  renderContent() {
    return (
      <Switch>
        <Route
          path='/prefs'
          render={() => <PrefsRouted />}
        />
        <Route
          path='/sites/import-site-url/:url'
          render={({ match }) => this.renderSiteLibraryRouted(decodeURIComponent(match.params.url))}
        />
        <Route
          path='/'
          render={() => this.renderSiteLibraryRouted()}
        />
      </Switch>
    );
  }

  // Main layout with toolbar, sidebar, and content
  renderMainLayout(history: { push: (path: string, state?: unknown) => void }) {
    this.history = history;
    const welcomeScreen = this.renderWelcomeScreen();

    // Handle ?console query param redirect
    const sp = new URLSearchParams(window.location.search);
    if (sp.has("console")) {
      history.push("/console");
      return null;
    }

    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={this.state.theme}>
          <CssBaseline />
          <React.Fragment>
            {welcomeScreen}
            <MainLayout
              toolbarRight={this.renderToolbarRight()}
              sidebar={this.renderSidebar()}
              menuIsLocked={this.state.menuIsLocked}
              forceShowMenu={this.state.forceShowMenu}
              skipMenuTransition={this.state.skipMenuTransition}
              onContentClick={() => {
                if (this.state.forceShowMenu) this.toggleForceShowMenu();
              }}
            >
              {this.renderContent()}
            </MainLayout>
          </React.Fragment>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  }

  render() {
    const welcomeScreen = this.renderWelcomeScreen();

    // Reset skipMenuTransition if it was set
    if (this.state.skipMenuTransition) {
      this.setState({ skipMenuTransition: false });
    }

    return (
      <Switch>
        {/* Console - standalone layout */}
        <Route
          path='/console'
          render={({ history }) => {
            this.history = history;
            return (
              <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                  <CssBaseline />
                  <Box
                    key='main-content'
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
            );
          }}
        />

        {/* Workspace - standalone layout */}
        <Route
          path='/sites/:site/workspaces/:workspace'
          render={({ match, history }) => {
            this.history = history;
            return (
              <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                  <CssBaseline />
                  {welcomeScreen}
                  <Workspace
                    applicationRole={this.state.applicationRole}
                    siteKey={decodeURIComponent(match.params.site)}
                    workspaceKey={decodeURIComponent(match.params.workspace)}
                  />
                </ThemeProvider>
              </StyledEngineProvider>
            );
          }}
        />

        {/* Refresh route - empty */}
        <Route
          path='/refresh'
          exact
          render={({ history }) => {
            this.history = history;
            return (
              <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                  <div />
                </ThemeProvider>
              </StyledEngineProvider>
            );
          }}
        />

        {/* All other routes use MainLayout */}
        <Route
          path='/'
          render={({ history }) => this.renderMainLayout(history)}
        />
      </Switch>
    );
  }
}

export default App;
