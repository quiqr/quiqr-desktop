import React                                                              from 'react';
import { Switch, Route }                                                  from 'react-router-dom'
import Redirect                                                           from 'react-router-dom/Redirect';
import AppsIcon                                                           from '@material-ui/icons/Apps';
import ArrowBackIcon                                                      from '@material-ui/icons/ArrowBack';
import SettingsApplicationsIcon                                           from '@material-ui/icons/SettingsApplications';
import { createTheme, ThemeProvider }                                     from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { blue }                                                           from '@material-ui/core/colors';
import Workspace                                                          from './containers/WorkspaceMounted/Workspace';
import Console                                                            from './containers/Console';
import TopToolbarLeft                                                     from './containers/TopToolbarLeft'
import { PrefsSidebar, PrefsRouted }                                      from './containers/Prefs';
import SplashDialog                                                       from './dialogs/SplashDialog';
import { SiteLibrarySidebar, SiteLibraryRouted, SiteLibraryToolbarRight } from './containers/SiteLibrary'
import {TopToolbarRight, ToolbarButton}                                   from './containers/TopToolbarRight'
import service                                                            from './services/service';

let defaultApplicationRole = "contentEditor";

class App extends React.Component{

  constructor(props){
    super(props);

    let win = window.require('electron').remote.getCurrentWindow();
    let style = require('./app-ui-styles/quiqr10/style-light.js');
    let theme = createTheme({
      palette: {
        type: "light",
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
      maximized:win.isMaximized(),
      style: style,
      theme: theme,
      menuIsLocked: true,
      forceShowMenu: false,
      skipMenuTransition: false,
      quiqrDomain: "",
    };

    win.on('maximize', () => { this.setState({maximized: true}); });
    win.on('unmaximize', ()=>{ this.setState({maximized: false}); });
    window.state = this.state;
  }

  setThemeStyleFromPrefs(){
    service.api.readConfKey('prefs').then((value)=>{
      if(value.interfaceStyle){

        let themeStyle='light';
        if(value.interfaceStyle ==='quiqr10-dark'){
          themeStyle='dark';
        }

        let theme = createTheme({
          palette: {
            type: themeStyle,
            primary: {
              main: blue[500],
            },
          },
        });

        this.setState({
          style: require('./app-ui-styles/quiqr10/style-'+themeStyle+'.js'),
          theme: theme
        });
      }
    });
  }

  componentDidMount(){

    this._ismounted = true;

    this.setThemeStyleFromPrefs();

    service.api.readConfPrefKey('libraryView').then((view)=>{
      this.setState({libraryView: view });
    });

    service.api.readConfPrefKey('showSplashAtStartup').then((show)=>{
      if(typeof show == 'undefined'){
        show=true;
      }
      this.setState({
        splashDialogOpen: show,
        showSplashAtStartup: show,
      });
    });

    window.require('electron').ipcRenderer.on('openSplashDialog', ()=>{this.setState({splashDialogOpen: true})});
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

    this.setApplicationRole();
  }

  componenWillUnmount(){
    [
      'redirectToGivenLocation',
    ].forEach((channel)=>{
      window.require('electron').ipcRenderer.removeAllListeners(channel);
    });
  }

  setApplicationRole(){
    service.api.readConfPrefKey('applicationRole').then((role)=>{
      if(!role) role = defaultApplicationRole;
      this.setState({applicationRole: role });
    });
  }

  closeWindow(){
    window.require('electron').remote.getCurrentWindow().close();
  }

  toggleWindowMode(){
    let win = window.require('electron').remote.getCurrentWindow();
    if(!this.state.maximized){
      win.maximize();
    }
    else{
      win.unmaximize();
    }
  }

  toggleMenuIsLocked(){
    let menuIsLocked = !this.state.menuIsLocked;
    this.setState({menuIsLocked, forceShowMenu: true, skipMenuTransition:true});
    window.dispatchEvent(new Event('resize'));
  }

  toggleForceShowMenu(){
    var forceShowMenu = !this.state.forceShowMenu;
    this.setState({forceShowMenu});
  }

  renderTopToolbarLeftSwitch(){

    return (<Switch>

      <Route path='/' exact render={ () => {
        return <TopToolbarLeft title="Site Library"/>
      }} />

      <Route path='/sites/*' exact render={ () => {
        return <TopToolbarLeft title="Site Library"/>
      }} />

    </Switch>);
  }

  renderTopToolbarRightSwitch(){

    return (<Switch>

      <Route path='/prefs' exact={false} render={ (props) => {

        const sp = new URLSearchParams(props.location.search);
        let backurl = "/sites/last";
        if(sp.has("siteKey")){
          let siteKey = sp.get("siteKey");
          backurl = `/sites/${siteKey}/workspaces/source`;
        }
        const leftButtons = [
          <ToolbarButton
            key={"back"}
            action={()=>{
              service.api.redirectTo(backurl, true);
            }}
            title="Back"
            icon={ArrowBackIcon}
          />,
        ]

        const rightButtons = [
          <ToolbarButton
            key={"toolbarbutton-library"}
            action={()=>{
              service.api.redirectTo("/sites/last");
            }}
            title="Site Library"
            icon={AppsIcon}
          />,
          <ToolbarButton
            key="buttonPrefs"
            active={true}
            action={()=>{
              service.api.redirectTo("/prefs");
            }}
            title="Preferences"
            icon={SettingsApplicationsIcon}
          />,
        ];

        return <TopToolbarRight
          itemsLeft={leftButtons}
          itemsCenter={[]}
          itemsRight={rightButtons}
        />

      }} />

      <Route path="/" exact={true} render={ ({match, history})=> {
        return <SiteLibraryToolbarRight
          handleChange={(v)=>this.handleLibraryViewChange(v)}
          activeLibraryView={ this.state.libraryView} />
      }} />

      <Route path='/sites/*' exact render={ () => {
        return <SiteLibraryToolbarRight
          handleChange={(v)=>this.handleLibraryViewChange(v)}
          activeLibraryView={ this.state.libraryView} />
      }} />

    </Switch>);
  }

  renderMenuSwitch(){
    return (<Switch>


      <Route path="/" exact={true} render={ ({match, history})=> {
        return (
          <SiteLibrarySidebar />
        );
      }} />
      <Route path="/sites" exact={true} render={ ({match, history})=> {
        return (
          <SiteLibrarySidebar />
        );
      }} />
      <Route path="/sites/*" exact={true} render={ ({match, history})=> {
        return (
          <SiteLibrarySidebar />
        );
      }} />

      <Route path="/create-new" exact={true} render={ ({match, history})=> {
        return null;
      }} />

      <Route path="/welcome" exact={true} render={ ({match, history})=> {
        return null;
      }} />

      <Route path="/prefs" exact={false} render={ ({match, history})=> {
        return (<PrefsSidebar
          menus={[]}
          hideItems={!this.state.forceShowMenu && !this.state.menuIsLocked}
          menuIsLocked={this.state.menuIsLocked}
          onToggleItemVisibility={()=>{this.toggleForceShowMenu()}}
          onLockMenuClicked={()=>{this.toggleMenuIsLocked()}}
        />);
      }} />


    </Switch>);
  }

  handleLibraryViewChange(view){
    service.api.saveConfPrefKey("libraryView",view);
    this.setState({libraryView: view})
  }

  renderSelectSites(openDialog){

    return (
      <SiteLibraryRouted
        activeLibraryView={ this.state.libraryView}
        key={ 'selectSite' }
        newSite={ (openDialog === 'newSiteDialog' ? true : false ) }
        importSite={ (openDialog === 'importSiteDialog' ? true : false ) }
      />
    );
  }

  renderContentSwitch(){
    return (<Switch>
      <Route path='/' exact render={ () => {
        return this.renderSelectSites();
      }} />

      <Route path='/sites/new-site/:refresh' exact render={ () => {
        return this.renderSelectSites('newSiteDialog');
      }} />

      <Route path='/sites/import-site/:refresh' exact render={ () => {
        return this.renderSelectSites('importSiteDialog');
      }} />

      <Route path='/sites/import-site-url/:url' exact={false} render={ ({match, history}) => {

        return (
          <SiteLibraryRouted
            activeLibraryView={ this.state.libraryView}
            key={ 'selectSite' }
            importSiteURL={ decodeURIComponent(match.params.url) }
            importSite={ true }
          />
        )
      }} />

      <Route path='/sites/*' render={ () => {
        return this.renderSelectSites();
      }} />

      <Route path="/prefs" exact={false} render={ () => {
        return <PrefsRouted />;
      }} />

      <Route path="*" component={(data)=>{
        return <Redirect to='/' />
      }} />
    </Switch>);
  }

  renderWelcomeScreen(){

    return (
      <SplashDialog
        open={this.state.splashDialogOpen}
        showSplashAtStartup={this.state.showSplashAtStartup}
        onClose={()=>{this.setState({splashDialogOpen:false})}}
        onChangeSplashCheck={(show)=>{
          service.api.saveConfPrefKey("showSplashAtStartup",show);
        }}
      />
    )
  }

  render() {

    let marginStyles;
    marginStyles = {
      marginRight:'0px'
    };

    let containerStyle = this.state.style.container;
    let menuContainerStyle = this.state.style.menuContainer;
    let topToolbarStyle = this.state.style.topToolbar;
    let contentContainerStyle = this.state.style.contentContainer;
    let welcomeScreen = this.renderWelcomeScreen();

    if(!this.state.menuIsLocked){
      contentContainerStyle = Object.assign({}, contentContainerStyle, {display: 'block', paddingLeft:'66px' });
      menuContainerStyle = Object.assign({}, menuContainerStyle, {
        position: 'absolute',
        zIndex: '2',
        height:'100%',
        width:'280px',
        transform: 'translateX(-214px)' } )

      if(this.state.forceShowMenu){
        menuContainerStyle.transform='translateX(0px)';
        contentContainerStyle.transform='translateX(214px)';
      }
      if(!this.state.skipMenuTransition){
        let transition = 'all ease-in-out .3s';
        contentContainerStyle.transition = transition;
        menuContainerStyle.transition = transition;
      }

      this.state.setState({skipMenuTransition: false});
    }

    return (<Switch>

      <Route path="/console" exact={false} render={ ({match, history})=> {
        this.history = history;

        return (
          <ThemeProvider theme={this.state.theme}>
            <CssBaseline />
            <div className="App">
              <div key="main-content" style={contentContainerStyle} onClick={()=>{ if(this.state.forceShowMenu) this.toggleForceShowMenu() }}>
                <Console />
              </div>
            </div>
          </ThemeProvider>
        )

      }} />

      <Route path='/sites/:site/workspaces/:workspace' exact render={ ({match, history})=> {
        this.history = history;
        return (
          <ThemeProvider theme={this.state.theme}>
            <CssBaseline />
            {welcomeScreen}
            <Workspace
              applicationRole={ this.state.applicationRole }
              siteKey={ decodeURIComponent(match.params.site) }
              workspaceKey={ decodeURIComponent(match.params.workspace) } />
          </ThemeProvider>

        );
      }} />
      <Route path='/sites/:site/workspaces/:workspace/*' exact render={ ({match, history})=> {
        this.history = history;
        return (

          <ThemeProvider theme={this.state.theme}>
            <CssBaseline />
            {welcomeScreen}
            <Workspace
              applicationRole={ this.state.applicationRole }
              siteKey={ decodeURIComponent(match.params.site) }
              workspaceKey={ decodeURIComponent(match.params.workspace) } />
          </ThemeProvider>

        );
      }} />


      <Route
        path="*"
        render={ ({match, history})=>{
          this.history = history;
          return (
            <ThemeProvider theme={this.state.theme}>
              <CssBaseline />

              <React.Fragment>
                {welcomeScreen}

                <div className="App" style={marginStyles}>

                  <div style={topToolbarStyle} className="xxtopToolbar">

                    <div className="toolbarLeft">
                      { this.renderTopToolbarLeftSwitch() }
                    </div>

                    <div className="toolbarRight">
                      { this.renderTopToolbarRightSwitch() }
                    </div>
                  </div>

                  <div style={containerStyle}>

                    <div style={menuContainerStyle} className='hideScrollbar' >
                      { this.renderMenuSwitch() }
                    </div>

                    <div key="main-content" style={contentContainerStyle} onClick={()=>{ if(this.state.forceShowMenu) this.toggleForceShowMenu() }}>
                      { this.renderContentSwitch() }
                    </div>


                  </div>

                </div>
              </React.Fragment>
            </ThemeProvider>
          );

        }} />
    </Switch>);
  }
}

export default App;
