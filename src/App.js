import React                                         from 'react';
import { Switch, Route }                             from 'react-router-dom'

//CONTAINERS
import SelectSite                                    from './containers/SelectSite'
import Console                                       from './containers/Console';
import PreviewButtons                                from './containers/PreviewButtons';
import Prefs                                         from './containers/Prefs'

import Home                                          from './containers/Home'
import Collection                                    from './containers/Collection';
import CollectionItem                                from './containers/CollectionItem';
import Single                                        from './containers/Single';
import Welcome                                       from './containers/Welcome';

import WorkspaceSidebar                              from './containers/WorkspaceSidebar';
import { FormsCookbookSidebar, FormsCookbookRouted } from './containers/FormsCookbook';

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
      poppygoUsername: "",
      poppygoFingerprint: "",
      poppygoDomain: "",
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
    let getProfile = service.api.getPoppyGoProfile();

    getProfile.then((profileAndFingerprint)=>{
      if(profileAndFingerprint){
        if(this.state.poppygoUsername !== profileAndFingerprint.profile.username){
          this.setState({poppygoUsername: profileAndFingerprint.profile.username, poppygoFingerprint:profileAndFingerprint.fingerprint});
        }
      }
      else{
        this.setState({poppygoUsername: '', poppygoFingerprint: ''});
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
    window.require('electron').ipcRenderer.on('setMobileBrowserOpen', this.setMobileBrowserOpen.bind(this));
    window.require('electron').ipcRenderer.on('setMobileBrowserClose', this.setMobileBrowserClose.bind(this));
    window.require('electron').ipcRenderer.on('redirectMountSite',function(event, args){
      this.history.push(args);
    }.bind(this));
    window.require('electron').ipcRenderer.on('redirectToGivenLocation',function(event, location){
      this.history.push(location);
    }.bind(this));
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

  renderWorkspaceSidebar = (history : any, url : string, site : ?string, workspace : ?string)=>{

    return <WorkspaceSidebar
    key={ url }
    siteKey={ site ? decodeURIComponent(site) : null }
    workspaceKey={ workspace ? decodeURIComponent(workspace) : null }
    history={history}
    hideItems={!this.state.forceShowMenu && !this.state.menuIsLocked}
    menuIsLocked={this.state.menuIsLocked}
    onToggleItemVisibility={()=>{this.toggleForceShowMenu()}}
    onLockMenuClicked={()=>{this.toggleMenuIsLocked()}} />
  }

  renderMenuSwitch(){
    return (<Switch>

      <Route path="/" exact={true} render={ ({match, history})=> {
        return this.renderWorkspaceSidebar(history, match.url, null, null);
      }} />

      <Route path="/welcome" exact={true} render={ ({match, history})=> {
        return null;
      }} />

      <Route path='/sites/:site/workspaces/:workspace' render={ ({match, history})=> {
        return this.renderWorkspaceSidebar(history, match.url, match.params.site, match.params.workspace);
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
        </Switch>);
  }

  renderSelectSites(){
    this.getProfile();
    return <SelectSite
    key={ 'selectSite' }
    poppygoUsername={this.state.poppygoUsername}
  />
  }
  renderHome(match){
    this.getProfile();
    return <Home
    key={ match.url }
    poppygoUsername={this.state.poppygoUsername}
    poppygoFingerprint={this.state.poppygoFingerprint}
    siteKey={ decodeURIComponent(match.params.site) }
    workspaceKey={ decodeURIComponent(match.params.workspace) } />
  }

  renderContentSwitch(){
    return (<Switch>
      <Route path='/' exact render={ () => {
        return this.renderSelectSites();
      }} />

      <Route path='/selectsite' exact render={ () => {
        return this.renderSelectSites();
      }} />

      <Route path='/welcome' exact render={ () => {
        return <Welcome key={ 'selectSite' } />
      }} />

        <Route path='/sites/:site/workspaces/:workspace' exact render={ ({match})=> {
          return this.renderHome(match);
        }} />

        <Route path='/sites/:site/workspaces/:workspace/home/:refresh' exact render={ ({match})=> {
          return this.renderHome(match);
        }} />

        <Route path='/sites/:site/workspaces/:workspace/collections/:collection' exact render={ ({match})=> {
          return <Collection
          key={ match.url }
          siteKey={ decodeURIComponent(match.params.site) }
          workspaceKey={ decodeURIComponent(match.params.workspace) }
          collectionKey={ decodeURIComponent(match.params.collection) } />
        }} />

          <Route path='/sites/:site/workspaces/:workspace/collections/:collection/:item' exact render={ ({match})=> {
            return <CollectionItem
            key={ match.url }
            siteKey={ decodeURIComponent(match.params.site) }
            workspaceKey={ decodeURIComponent(match.params.workspace) }
            collectionKey={ decodeURIComponent(match.params.collection) }
            collectionItemKey={ decodeURIComponent(match.params.item) } />
          }} />

            <Route path='/sites/:site/workspaces/:workspace/singles/:single' exact render={ ({match})=> {
              return <Single
              key={ match.url }
              siteKey={ decodeURIComponent(match.params.site) }
              workspaceKey={ decodeURIComponent(match.params.workspace) }
              singleKey={ decodeURIComponent(match.params.single) } /> }} />

              <Route path="/forms-cookbook" exact={false} render={ ({match, history})=> {
                return <FormsCookbookRouted />;
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

          <Route path="/prefs" exact={false} render={ ({match, history})=> {
            this.history = history;

            return (
              <MuiThemeProvider muiTheme={pogoTheme}>
                <div className="App">
                  <div key="main-content" style={contentContainerStyle} onClick={()=>{ if(this.state.forceShowMenu) this.toggleForceShowMenu() }}>

                    <Prefs />

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

                          <Route
                          path="*"
                          render={ ({match, history})=>{
                            const isRedirect = history.action === 'REPLACE';
                            if(isRedirect){
                              service.api.logToConsole('ISREDIRECT');
                            }

                            this.history = history;
                            return (
                              <MuiThemeProvider muiTheme={pogoTheme}>

                                <div className="App" style={marginStyles}>

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

                          }}
                            />
                                </Switch>);
  }
}

export default App;
