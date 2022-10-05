import React                                                              from 'react';
import { Switch, Route }                                                  from 'react-router-dom'
import { SiteLibrarySidebar, SiteLibraryRouted, SiteLibraryToolbarRight } from './containers/SiteLibrary'
import {TopToolbarRight, ToolbarButton}                                   from './containers/TopToolbarRight'
import AppsIcon                                                           from '@material-ui/icons/Apps';
import Workspace                                                          from './containers/WorkspaceMounted/Workspace';
import Console                                                            from './containers/Console';
import PreviewButtons                                                     from './containers/PreviewBrowser/PreviewButtons';
import TopToolbarLeft                                                     from './containers/TopToolbarLeft'
import { FormsCookbookSidebar, FormsCookbookRouted }                      from './containers/FormsCookbook';
import { PrefsSidebar, PrefsRouted }                                      from './containers/Prefs';
import SplashDialog                                                       from './dialogs/SplashDialog';

import lightBaseTheme                                                     from 'material-ui-02/styles/baseThemes/lightBaseTheme';
import darkBaseTheme                                                      from 'material-ui-02/styles/baseThemes/darkBaseTheme';
import MuiThemeProvider                                                   from 'material-ui-02/styles/MuiThemeProvider';
import getMuiTheme                                                        from 'material-ui-02/styles/getMuiTheme';

import Redirect                                                           from 'react-router-dom/Redirect';
import service                                                            from './services/service';

const defaultApplicationRole = "contentEditor";

const pogoTheme = getMuiTheme(lightBaseTheme, {
  palette: {
    background: {
    },
  },
  props: {
  },
  overrides: {
  },
});

const pogoDarkTheme = getMuiTheme(darkBaseTheme, {
  palette: {
    background: {
    },
  },
  props: {
  },
  overrides: {
  },
});

let style = require('./themes/quiqr10/style.js');
let trySet = false;

class App extends React.Component{

  constructor(props){
    super(props);

    let win = window.require('electron').remote.getCurrentWindow();

    this.state = {
      splashDialogOpen: false,
      showSplashAtStartup: false,
      applicationRole: defaultApplicationRole,
      libraryView: "list",
      maximized:win.isMaximized(),
      style: style,
      menuIsLocked: true,
      forceShowMenu: false,
      mobileBrowserActive: false,
      skipMenuTransition: false,
      quiqrUsername: "",
      quiqrFingerprint: "",
      quiqrDomain: "",
    };

    win.on('maximize', () => { this.setState({maximized: true}); });
    win.on('unmaximize', ()=>{ this.setState({maximized: false}); });
    window.state = this.state;
  }

  componentDidMount(){

    this._ismounted = true;

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

    window.require('electron').ipcRenderer.on('setMobileBrowserOpen', this.setMobileBrowserOpen.bind(this));
    window.require('electron').ipcRenderer.on('setMobileBrowserClose', this.setMobileBrowserClose.bind(this));
    window.require('electron').ipcRenderer.on('openSplashDialog', ()=>{this.setState({splashDialogOpen: true})});
    window.require('electron').ipcRenderer.on('redirectToGivenLocation',(event, location)=>{

      this.setApplicationRole();
      if(this.history){
        this.history.push(location);
      }
      else {
        this.history = ['/'];
      }
    });


    service.getConfigurations().then((c)=>{
      var stateUpdate  = {};
      stateUpdate.configurations = c;
      stateUpdate.style = require('./themes/' + c.global.appTheme + '/style.js');

      this.setState(stateUpdate);
    })
    this.getProfile();
    this.setApplicationRole();

  }

  componentWillUnmount(){
    [
      'setMobileBrowserOpen',
      'setMobileBrowserClose',
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

  //TODO REMOVE
  getProfile(){
    let getProfile = service.api.getQuiqrProfile();

    getProfile.then((profileAndFingerprint)=>{
      if(profileAndFingerprint){
        if(this.state.quiqrUsername !== profileAndFingerprint.profile.username){
          this.setState({quiqrUsername: profileAndFingerprint.profile.username, quiqrFingerprint:profileAndFingerprint.fingerprint});
        }
      }
      else{
        //CAUSES LOOP
        //this.setState({quiqrUsername: '', quiqrFingerprint: ''});
      }
    }, (e)=>{
    })

    return true;
  }

  setMobileBrowserOpen(){
    this.setState({mobileBrowserActive: true});
  }
  setMobileBrowserClose(){
    this.setState({mobileBrowserActive: false});
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
      <Route path='/prefs' exact={false} render={ () => {
        const rightButtons = [
          <ToolbarButton
            key={"toolbarbutton-library"}
            action={()=>{
              service.api.redirectTo("/sites/last");
            }}
            title="Site Library"
            icon={AppsIcon}
          />
        ];

        return <TopToolbarRight
          itemsLeft={[]}
          itemsCenter={[]}
          itemsRight={rightButtons}
        />



      }} />

      <Route path='/forms-cookbook' render={ () => {
        const rightButtons = [
          <ToolbarButton
            key={"toolbarbutton-library"}
            action={()=>{
              service.api.redirectTo("/sites/last");
            }}
            title="Site Library"
            icon={AppsIcon}
          />
        ];

        return <TopToolbarRight
          itemsLeft={[]}
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

      <Route path="/forms-cookbook" exact={false} render={ ({match, history})=> {
        return (<FormsCookbookSidebar
          menus={[]}
          hideItems={!this.state.forceShowMenu && !this.state.menuIsLocked}
          menuIsLocked={this.state.menuIsLocked}
          onToggleItemVisibility={()=>{this.toggleForceShowMenu()}}
          onLockMenuClicked={()=>{this.toggleMenuIsLocked()}}
        />);
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

    this.getProfile();
    return (
      <SiteLibraryRouted
        activeLibraryView={ this.state.libraryView}
        key={ 'selectSite' }
        quiqrUsername={this.state.quiqrUsername}
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
        //return this.renderImportSite();
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

      <Route path="/forms-cookbook" exact={false} render={ () => {
        return <FormsCookbookRouted />;
      }} />

      <Route path="/prefs" exact={false} render={ () => {
        return <PrefsRouted />;
      }} />

      <Route path="*" component={(data)=>{
        return <Redirect to='/' />
      }} />
    </Switch>);
  }

  tryServer(){

    if(!trySet){

      trySet = true;
      setTimeout(function () {
        trySet = false;
        service.api.openMobilePreview();

      }, 2000);
    }
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
    if(this.state.mobileBrowserActive){
      marginStyles = {
        marginRight:'340px',
        borderRightWidth: 1,
        borderRightColor: '#ccc',
        borderRightStyle: 'solid'
      };
    }else{
      marginStyles = {
        marginRight:'0px'
      };
    }

    let containerStyle = this.state.style.container;
    let menuContainerStyle = this.state.style.menuContainer;
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
          <MuiThemeProvider muiTheme={pogoTheme}>
            <div className="App">
              <div key="main-content" style={contentContainerStyle} onClick={()=>{ if(this.state.forceShowMenu) this.toggleForceShowMenu() }}>
                <Console />
              </div>
            </div>
          </MuiThemeProvider>
        )

      }} />

      <Route path='/preview-empty' exact render={ ({match, history}) => {
        this.history = history;

        return (
          <MuiThemeProvider muiTheme={pogoDarkTheme}>
            <div style={{backgroundColor:"#ccc", height:"83px"}}>
            </div>
          </MuiThemeProvider>
        )
      }} />

      <Route path='/preview-buttons' exact render={ ({match, history}) => {
        this.history = history;
        return (
          <MuiThemeProvider muiTheme={pogoDarkTheme}>
            <div style={{backgroundColor:"#606060"}}>
              <PreviewButtons />
            </div>
          </MuiThemeProvider>
        )
      }} />

      <Route path='/preview-no-server' exact render={ ({match, history}) => {
        this.history = history;

        this.tryServer();
        return (
          <MuiThemeProvider muiTheme={pogoDarkTheme}>
            <div style={{backgroundColor:"#ccc", height:"83px"}}>
            </div>
          </MuiThemeProvider>
        )
      }} />

      <Route path='/sites/:site/workspaces/:workspace' exact render={ ({match, history})=> {
        this.history = history;
        return (
          <React.Fragment>

            {welcomeScreen}
            <Workspace
              applicationRole={ this.state.applicationRole }
              siteKey={ decodeURIComponent(match.params.site) }
              workspaceKey={ decodeURIComponent(match.params.workspace) } />
          </React.Fragment>

        );
      }} />
      <Route path='/sites/:site/workspaces/:workspace/*' exact render={ ({match, history})=> {
        this.history = history;
        return (
          <React.Fragment>
            {welcomeScreen}
            <Workspace
              applicationRole={ this.state.applicationRole }
              siteKey={ decodeURIComponent(match.params.site) }
              workspaceKey={ decodeURIComponent(match.params.workspace) } />
          </React.Fragment>

        );
      }} />


      <Route
        path="*"
        render={ ({match, history})=>{
          this.history = history;
          return (
            <MuiThemeProvider muiTheme={pogoTheme}>

              <React.Fragment>
                {welcomeScreen}

                <div className="App" style={marginStyles}>

                  <div className="topToolbar">

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
            </MuiThemeProvider>
          );

        }} />
    </Switch>);
  }
}

export default App;
