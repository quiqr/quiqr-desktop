import React from "react";
import { Switch, Route } from "react-router-dom";
import AppsIcon from "@mui/icons-material/Apps";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import { createTheme, ThemeProvider, StyledEngineProvider, Theme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { blue } from "@mui/material/colors";
import Workspace from "./containers/WorkspaceMounted/Workspace";
import Console from "./containers/Console";
import TopToolbarLeft from "./containers/TopToolbarLeft";
import { PrefsSidebar, PrefsRouted } from "./containers/Prefs";
import SplashDialog from "./dialogs/SplashDialog";
import { SiteLibrarySidebar, SiteLibraryRouted, SiteLibraryToolbarRight } from "./containers/SiteLibrary";
import { TopToolbarRight, ToolbarButton } from "./containers/TopToolbarRight";
import service from "./services/service";
import styleLightDefault from "./app-ui-styles/quiqr10/style-light.js";
import styleDarkDefault from "./app-ui-styles/quiqr10/style-dark.js";
import { UserPreferences } from "../types";

const defaultApplicationRole = "contentEditor";

type AppState = {
  splashDialogOpen: boolean;
  showSplashAtStartup: boolean;
  applicationRole: string;
  libraryView: string;
  style: unknown;
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
  history?: unknown;

  constructor(props: null) {
    super(props);

    const style = styleLightDefault;
    const theme = createTheme({
      palette: {
        mode: "light",
        primary: {
          main: blue[500],
        },
      },
    });

    this.state = {
      splashDialogOpen: false,
      showSplashAtStartup: false,
      applicationRole: defaultApplicationRole,
      libraryView: "cards",
      //maximized:win.isMaximized(),
      style: style,
      theme: theme,
      menuIsLocked: true,
      forceShowMenu: false,
      skipMenuTransition: false,
      quiqrDomain: "",
    };

    // (window as any).state = this.state;
  }

  setThemeStyleFromPrefs() {
    service.api.readConfKey("prefs").then((value: UserPreferences) => {
      if (value.interfaceStyle) {
        let themeStyle: "light" | "dark" = "light";
        if (value.interfaceStyle === "quiqr10-dark") {
          themeStyle = "dark";
        }

        const theme = createTheme({
          palette: {
            mode: themeStyle,
            primary: {
              main: blue[500],
            },
          },
        });

        this.setState({
          style: themeStyle === "light" ? styleLightDefault : styleDarkDefault,
          theme: theme,
        });
      }
    });
  }

  componentDidMount() {
    this._ismounted = true;

    this.setThemeStyleFromPrefs();

    service.api.readConfPrefKey("libraryView").then((view) => {
      // TODO: extract to typeguard, or do schema checking in service.api.readConfPrefKey
      if (typeof view === "string") {
        this.setState({ libraryView: view });
      }
    });

    service.api.readConfPrefKey("showSplashAtStartup").then((show) => {
      if (typeof show == "undefined") {
        show = true;
      }

      /**
       * Convert to boolean in case it's a string from config
       * We need this conversion because SplashDialog and Dialog require a boolean, not a string
       * TODO: Maybe we should handle this when the config is loaded initially
       *
       * @see { SplashDialog }
       */
      const showBool = show === true || show === "true";
      this.setState({
        splashDialogOpen: showBool,
        showSplashAtStartup: showBool,
      });
    });

    //PORTQUIQR
    /*
    window.require('electron').ipcRenderer.on('openSplashDialog', ()=>{this.setState({splashDialogOpen: true})});
    window.require('electron').ipcRenderer.on('importSiteDialogOpen', ()=>{this.setState({importSiteDialogOpen: true})});
    window.require('electron').ipcRenderer.on('newSiteDialogOpen', ()=>{this.setState({newSiteDialogOpen: true})});
    window.require('electron').ipcRenderer.on('reloadThemeStyle', ()=>{
      this.setThemeStyleFromPrefs();
    });
    window.require('electron').ipcRenderer.on('redirectToGivenLocation',(event, location)=>{

      this.setApplicationRole();
      if(this.history){
        this.history.push(location);
      }
      else {
        this.history = ['/'];
      }
    });
    */

    this.setApplicationRole();
  }

  /*
  componenWillUnmount(){
    [
      'redirectToGivenLocation',
    ].forEach((channel)=>{
      window.require('electron').ipcRenderer.removeAllListeners(channel);
    });
  }
  */

  setApplicationRole() {
    service.api.readConfPrefKey("applicationRole").then((role) => {
      if (!role) role = defaultApplicationRole;

      // TODO: extract to typeguard, or do schema checking in service.api.readConfPrefKey
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

  renderTopToolbarLeftSwitch() {
    return (
      <Switch>
        <Route path='/' exact render={() => <TopToolbarLeft title='Site Library' />} />

        <Route path='/sites' render={() => <TopToolbarLeft title='Site Library' />} />
      </Switch>
    );
  }

  renderTopToolbarRightSwitch() {
    return (
      <Switch>
        <Route
          path='/prefs'
          exact={false}
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
                  history.push(backurl, true);
                }}
                title='Back'
                icon={ArrowBackIcon}
              />,
            ];

            const rightButtons = [
              <ToolbarButton
                key={"toolbarbutton-library"}
                action={() => {
                  history.push("/sites/last");
                }}
                title='Site Library'
                icon={AppsIcon}
              />,

              <ToolbarButton
                key='buttonPrefs'
                active={true}
                action={() => {
                  history.push("/prefs");
                }}
                title='Preferences'
                icon={SettingsApplicationsIcon}
              />,
            ];

            return <TopToolbarRight itemsLeft={leftButtons} itemsCenter={[]} itemsRight={rightButtons} />;
          }}
        />
        ;{/*REMOVE ONE OF THESE*/}
        <Route
          path='/'
          exact={true}
          render={() => {
            return (
              <SiteLibraryToolbarRight
                handleChange={(v) => this.handleLibraryViewChange(v)}
                handleLibraryDialogClick={(v) => this.handleLibraryDialogClick(v)}
                activeLibraryView={this.state.libraryView}
              />
            );
          }}
        />
        ;
        <Route
          path='/sites/*'
          exact
          render={() => {
            return (
              <SiteLibraryToolbarRight
                handleChange={(v) => this.handleLibraryViewChange(v)}
                handleLibraryDialogClick={(v) => this.handleLibraryDialogClick(v)}
                activeLibraryView={this.state.libraryView}
              />
            );
          }}
        />
      </Switch>
    );
  }

  renderMenuSwitch() {
    return (
      <Switch>
        <Route
          path='/sites'
          exact={true}
          render={() => {
            return <SiteLibrarySidebar />;
          }}
        />
        <Route
          path='/sites/*'
          exact={true}
          render={() => {
            return <SiteLibrarySidebar />;
          }}
        />

        <Route
          path='/create-new'
          exact={true}
          render={() => {
            return null;
          }}
        />

        <Route
          path='/welcome'
          exact={true}
          render={() => {
            return null;
          }}
        />

        <Route
          path='/prefs'
          exact={false}
          render={() => {
            return (
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
            );
          }}
        />

        <Route
          path='*'
          exact={true}
          render={() => {
            return <SiteLibrarySidebar />;
          }}
        />
      </Switch>
    );
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

  renderSelectSites(_openDialog?: string) {
    return (
      <SiteLibraryRouted
        handleLibraryDialogCloseClick={() => this.handleLibraryDialogCloseClick()}
        activeLibraryView={this.state.libraryView}
        key={"selectSite"}
        newSite={this.state.newSiteDialogOpen}
        importSite={this.state.importSiteDialogOpen}
      />
    );
  }

  renderContentSwitch() {
    return (
      <Switch>
        <Route
          path='/'
          exact
          render={() => {
            return this.renderSelectSites();
          }}
        />

        <Route
          path='/sites/new-site/:refresh'
          exact
          render={() => {
            return this.renderSelectSites("newSiteDialog");
          }}
        />

        <Route
          path='/sites/import-site/:refresh'
          exact
          render={() => {
            return this.renderSelectSites("importSiteDialog");
          }}
        />

        <Route
          path='/sites/import-site-url/:url'
          exact={false}
          render={({ match }) => {
            return (
              <SiteLibraryRouted
                handleLibraryDialogCloseClick={() => this.handleLibraryDialogCloseClick()}
                activeLibraryView={this.state.libraryView}
                key={"selectSite"}
                importSiteURL={decodeURIComponent(match.params.url)}
                importSite={true}
              />
            );
          }}
        />

        <Route
          path='/sites/*'
          render={() => {
            return this.renderSelectSites();
          }}
        />

        <Route
          path='/prefs'
          exact={false}
          render={() => {
            return <PrefsRouted />;
          }}
        />
      </Switch>
    );
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

  renderBodyWithToolbars() {
    const marginStyles = {
      marginRight: "0px",
    };

    const containerStyle = this.state.style.container;
    const menuContainerStyle = this.state.style.menuContainer;
    const topToolbarStyle = this.state.style.topToolbar;
    const contentContainerStyle = this.state.style.contentContainer;
    const welcomeScreen = this.renderWelcomeScreen();

    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={this.state.theme}>
          <CssBaseline />
          <React.Fragment>
            {welcomeScreen}

            <div className='App' style={marginStyles}>
              <div style={topToolbarStyle}>
                <div className='toolbarLeft'>{this.renderTopToolbarLeftSwitch()}</div>

                <div className='toolbarRight'>{this.renderTopToolbarRightSwitch()}</div>
              </div>

              <div style={containerStyle}>
                <div style={menuContainerStyle} className='hideScrollbar'>
                  {this.renderMenuSwitch()}
                </div>

                <div
                  key='main-content'
                  style={contentContainerStyle}
                  onClick={() => {
                    if (this.state.forceShowMenu) this.toggleForceShowMenu();
                  }}>
                  {this.renderContentSwitch()}
                </div>
              </div>
            </div>
          </React.Fragment>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  }

  render() {
    let menuContainerStyle = this.state.style.menuContainer;
    let contentContainerStyle = this.state.style.contentContainer;
    const welcomeScreen = this.renderWelcomeScreen();

    if (!this.state.menuIsLocked) {
      contentContainerStyle = Object.assign({}, contentContainerStyle, { display: "block", paddingLeft: "66px" });
      menuContainerStyle = Object.assign({}, menuContainerStyle, {
        position: "absolute",
        zIndex: "2",
        height: "100%",
        width: "280px",
        transform: "translateX(-214px)",
      });

      if (this.state.forceShowMenu) {
        menuContainerStyle.transform = "translateX(0px)";
        contentContainerStyle.transform = "translateX(214px)";
      }
      if (!this.state.skipMenuTransition) {
        const transition = "all ease-in-out .3s";
        contentContainerStyle.transition = transition;
        menuContainerStyle.transition = transition;
      }

      this.setState({ skipMenuTransition: false });
    }

    return (
      <Switch>
        <Route
          path='/console'
          exact={false}
          render={({ history }) => {
            this.history = history;

            return (
              <StyledEngineProvider injectFirst>
                <ThemeProvider theme={this.state.theme}>
                  <CssBaseline />
                  <div className='App'>
                    <div
                      key='main-content'
                      style={contentContainerStyle}
                      onClick={() => {
                        if (this.state.forceShowMenu) this.toggleForceShowMenu();
                      }}>
                      <Console />
                    </div>
                  </div>
                </ThemeProvider>
              </StyledEngineProvider>
            );
          }}
        />
        <Route
          path='/sites/:site/workspaces/:workspace'
          exact
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
        <Route
          path='/sites/:site/workspaces/:workspace/*'
          exact
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
        <Route
          path='/refresh'
          exact={true}
          render={({ history }) => {
            this.history = history;
            return (
              <StyledEngineProvider injectFirst>
                (
                <ThemeProvider theme={this.state.theme}>
                  <div />
                </ThemeProvider>
                )
              </StyledEngineProvider>
            );
          }}
        />
        {/*
        <Route path="/" exact={true} render={ ({match, history})=> {
          this.history = history;
          return (
            <ThemeProvider theme={this.state.theme}>
            </ThemeProvider>
          )
          }} />
            */}
        <Route
          path='/'
          exact={true}
          render={({ history }) => {
            this.history = history;

            const sp = new URLSearchParams(history.location.search);
            if (sp.has("console")) {
              history.push("/console");
            }

            return this.renderBodyWithToolbars();
          }}
        />
        <Route
          path='/sites'
          exact={true}
          render={({ history }) => {
            this.history = history;
            return this.renderBodyWithToolbars();
          }}
        />
        <Route
          path='/sites/*'
          exact={true}
          render={({ history }) => {
            this.history = history;
            return this.renderBodyWithToolbars();
          }}
        />
        <Route
          path='/create-new'
          exact={true}
          render={({ history }) => {
            this.history = history;
            return this.renderBodyWithToolbars();
          }}
        />
        <Route
          path='/welcome'
          exact={true}
          render={({ history }) => {
            this.history = history;
            return this.renderBodyWithToolbars();
          }}
        />
        <Route
          path='/prefs'
          exact={false}
          render={({ history }) => {
            this.history = history;
            return this.renderBodyWithToolbars();
          }}
        />
        <Route
          path='*'
          render={({ history }) => {
            this.history = history;
            return this.renderBodyWithToolbars();
          }}
        />
      </Switch>
    );
  }
}

export default App;
