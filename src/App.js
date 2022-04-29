import React                                         from 'react';
import { Switch, Route }                             from 'react-router-dom'

//CONTAINERS
//import SelectSite                                    from './containers/SelectSite'
import { SiteLibrarySidebar, SiteLibraryRouted }     from './containers/SiteLibrary'
import Workspace                                     from './containers/WorkspaceMounted/Workspace';
import Console                                       from './containers/Console';
import PreviewButtons                                from './containers/PreviewBrowser/PreviewButtons';

import TopToolbarLeft                                from './containers/TopToolbarLeft'

import Welcome                                       from './containers/Welcome';

//import WorkspaceSidebar                              from './containers/WorkspaceSidebar';
import { FormsCookbookSidebar, FormsCookbookRouted } from './containers/FormsCookbook';
import { PrefsSidebar, PrefsRouted }                 from './containers/Prefs';

//import { SiteConfSidebar, SiteConfRouted }           from './containers/WorkspaceMounted/SiteConf';

import lightBaseTheme                                from 'material-ui-02/styles/baseThemes/lightBaseTheme';
import darkBaseTheme                                 from 'material-ui-02/styles/baseThemes/darkBaseTheme';
import MuiThemeProvider                              from 'material-ui-02/styles/MuiThemeProvider';
import getMuiTheme                                   from 'material-ui-02/styles/getMuiTheme';

import Redirect                                      from 'react-router-dom/Redirect';
import service                                       from './services/service';

import type { EmptyConfigurations, Configurations }  from './types';

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

type AppProps = {
}

type AppState = {
  configurations?: Configurations | EmptyConfigurations,
  maximized : bool,
  menuIsLocked: bool,
  forceShowMenu: bool,
  skipMenuTransition: bool
}

let style = require('./themes/default/style.js');
let trySet = false;

class App extends React.Component<AppProps,AppState>{

  constructor(props : any ){
    super(props);

    let win = window.require('electron').remote.getCurrentWindow();

    this.state = {
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
    console.log('App MOUNTED');
    this._ismounted = true;

    service.getConfigurations().then((c)=>{
      var stateUpdate  = {};
      stateUpdate.configurations = c;
      stateUpdate.style = require('./themes/' + c.global.appTheme + '/style.js');

      this.setState(stateUpdate);
    })
    this.getProfile();
  }

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

  //REDIRECTS FROM BACKGROUND
  redirectHome(){
    this.history.push('/');
  }

  redirectCookbook(){
    this.history.push('/forms-cookbook');
  }

  redirectPrefs(){
    this.history.push('/prefs');
  }

  /*
  redirectSiteConf(){
    this.history.push('/siteconf');
  }
  */

  redirectConsole(){
    this.history.push('/console');
  }

  setMobileBrowserOpen(){
    this.setState({mobileBrowserActive: true});
  }
  setMobileBrowserClose(){
    this.setState({mobileBrowserActive: false});
  }

  componentWillMount(){
    window.require('electron').ipcRenderer.on('redirectHome', this.redirectHome.bind(this));
    window.require('electron').ipcRenderer.on('redirectCookbook', this.redirectCookbook.bind(this));
    window.require('electron').ipcRenderer.on('redirectConsole', this.redirectConsole.bind(this));
    window.require('electron').ipcRenderer.on('redirectPrefs', this.redirectPrefs.bind(this));
   // window.require('electron').ipcRenderer.on('redirectSiteConf', this.redirectSiteConf.bind(this));
    window.require('electron').ipcRenderer.on('setMobileBrowserOpen', this.setMobileBrowserOpen.bind(this));
    window.require('electron').ipcRenderer.on('setMobileBrowserClose', this.setMobileBrowserClose.bind(this));

    window.require('electron').ipcRenderer.on('redirectToGivenLocation',function(event, location){

      this.history.push(location);

    }.bind(this));
  }
  componentWillUnmount(){
    [
      'redirectHome',
      'redirectCookbook',
      'redirectConsole',
      'redirectPrefs',
//      'redirectSiteConf',
      'setMobileBrowserOpen',
      'setMobileBrowserClose',
      'redirectToGivenLocation',
    ].forEach((channel)=>{
      window.require('electron').ipcRenderer.removeAllListeners(channel);
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

      <Route path="*" component={(data)=>{
        return null;
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

  renderSelectSites(){
    this.getProfile();
    return (
      <SiteLibraryRouted
        key={ 'selectSite' }
        quiqrUsername={this.state.quiqrUsername}
      />
    );
  }

  renderCreateSite() {
    this.getProfile();
    return (
      <SiteLibraryRouted
        key={ 'selectSite' }
        quiqrUsername={this.state.quiqrUsername}
        createSite={ true }
      />
    );
  }

  renderContentSwitch(){
    return (<Switch>
      <Route path='/' exact render={ () => {
        return this.renderSelectSites();
      }} />

      <Route path='/sites/create-new' exact render={ () => {
        return this.renderCreateSite();
      }} />

      <Route path='/sites/*' render={ () => {
        return this.renderSelectSites();
      }} />


      <Route path='/welcome' exact render={ () => {
        return <Welcome key={ 'selectSite' } />
      }} />

      <Route path="/forms-cookbook" exact={false} render={ ({match, history})=> {
        return <FormsCookbookRouted />;
      }} />

      <Route path="/prefs" exact={false} render={ ({match, history})=> {
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

      <Route path='/sites/:site/workspaces/:workspace' exact render={ ({match})=> {
        return (
          <Workspace
            history={this.history}
            siteKey={ decodeURIComponent(match.params.site) }
            workspaceKey={ decodeURIComponent(match.params.workspace) } />

        );
      }} />
      <Route path='/sites/:site/workspaces/:workspace/*' exact render={ ({match})=> {
        return (
          <Workspace
            history={this.history}
            siteKey={ decodeURIComponent(match.params.site) }
            workspaceKey={ decodeURIComponent(match.params.workspace) } />

        );
      }} />

      <Route
      path="*"
      render={ ({match, history})=>{
        /*
        const isRedirect = history.action === 'REPLACE';
        if(isRedirect){
          service.api.logToConsole('ISREDIRECT');
        }
        */

        this.history = history;
        return (
          <MuiThemeProvider muiTheme={pogoTheme}>

            <div className="App" style={marginStyles}>

              <div className="topToolbar">

                <div className="toolbarLeft">
                  { this.renderTopToolbarLeftSwitch() }
                </div>

                <div className="toolbarRight">
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
          </MuiThemeProvider>
        );

      }} />
  </Switch>);
  }
}

export default App;
