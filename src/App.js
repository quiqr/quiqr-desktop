//@flow

import React from 'react';
import { Switch, Route } from 'react-router-dom'

//CONTAINERS
import Home from './containers/Home'
import Prefs from './containers/Prefs'
//import SelectSite from './containers/SelectSite'
import Collection from './containers/Collection';
import CollectionItem from './containers/CollectionItem';
import Single from './containers/Single';
import Console from './containers/Console';
import Header from './containers/Header';
import NotificationUI from './containers/NotificationUI';
import WorkspaceSidebar from './containers/WorkspaceSidebar';
// import { Sidebar } from './containers/Sidebar';
import ExtraOptions from './containers/ExtraOptions';
import { FormsCookbookSidebar, FormsCookbookRouted } from './containers/FormsCookbook';

//MATERIAL UI
import { MenuItem } from 'material-ui/';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Redirect from 'react-router-dom/Redirect';

//import { createBrowserHistory } from "history";



import service from './services/service';

import type { EmptyConfigurations, Configurations } from './types';

//export const history = createBrowserHistory();

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

class App extends React.Component<AppProps,AppState>{

  //history: any;
  constructor(props : any ){
    super(props);

    let win = window.require('electron').remote.getCurrentWindow();

    this.state = {
      maximized:win.isMaximized(),
      style: style,
      menuIsLocked: true,
      forceShowMenu: false,
      redirectCookbook: false,
      redirectConsole: false,
      redirectPrefs: false,
      mobileBrowserActive: false,
      redirectHome: false,
      redirectSelectSite: false,
      skipMenuTransition: false
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
            // let css = require('./themes/' + c.global.appTheme + '/css/App.css');

            this.setState(stateUpdate);

        })
    }

    redirectMountSite(){
        if(this.state.redirectHome){
            this.setState({redirectHome: false});
        }
        else{
            this.setState({redirectCookbook: false});
            this.setState({redirectConsole: false});
            this.setState({redirectPrefs: false});
            this.setState({redirectHome: true});
        }
    }


  redirectHome(){
      if(this.state.redirectHome){
          this.setState({redirectHome: false});
      }
      else{
          this.setState({redirectCookbook: false});
          this.setState({redirectConsole: false});
          this.setState({redirectPrefs: false});
          this.setState({redirectHome: true});
    }
  }

  redirectCookbook(){
    if(this.state.redirectCookbook){
      this.setState({redirectCookbook: false});
    }
    else{
      this.setState({redirectCookbook: true});
      this.setState({redirectHome: false});
    }
  }

  redirectConsole(){
    this.setState({redirectConsole: true});
  }

  setMobileBrowserOpen(){
    this.setState({mobileBrowserActive: true});
  }
  setMobileBrowserClose(){
    this.setState({mobileBrowserActive: false});
  }

    redirectPrefs(){
        this.setState({redirectPrefs: true});
    }
    redirectSelectSite(){
        this.setState({redirectSelectSite: true});
    }

    componentWillMount(){
        window.require('electron').ipcRenderer.on('redirectCookbook', this.redirectCookbook.bind(this));
        window.require('electron').ipcRenderer.on('redirectHome', this.redirectHome.bind(this));
        window.require('electron').ipcRenderer.on('redirectConsole', this.redirectConsole.bind(this));
        window.require('electron').ipcRenderer.on('redirectPrefs', this.redirectPrefs.bind(this));
        window.require('electron').ipcRenderer.on('setMobileBrowserOpen', this.setMobileBrowserOpen.bind(this));
        window.require('electron').ipcRenderer.on('setMobileBrowserClose', this.setMobileBrowserClose.bind(this));
        window.require('electron').ipcRenderer.on('redirectselectsite', this.redirectSelectSite.bind(this));
        window.require('electron').ipcRenderer.on('redirectMountSite',function(event, args){
            this.setState({redirectMountSite: args});
        }.bind(this));
    }

    minimizeWindow(){
    window.require('electron').remote.getCurrentWindow().minimize();
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

  getExtraItems(){
    let items = [
      // <MenuItem primaryText="Reload" onClick={ ()=>{ window.location = window.location; } } />,
      <MenuItem primaryText="Restart Application" onClick={ ()=>{ const app = window.require('electron').remote.app; app.relaunch(); app.exit(0); } } />,
    ];
    return items;

  }

  getExtraOptionsSwitch(){
    return (<Switch>
      <Route path="/forms-cookbook" exact={false} render={ ({match, history})=> {

        let items = this.getExtraItems();

        if(this.state.configurations && this.state.configurations.global.cookbookEnabled){
          items.push(
            <MenuItem primaryText="Exit Cookbook" onClick={()=>{ history.push('/') }} />
          )
        }

        return (
          <ExtraOptions items={ items } />
          );
      }} />
      <Route
        path="*"
        render={ ({match, history})=>{
          let items = this.getExtraItems();

          if(this.state.configurations && this.state.configurations.global.cookbookEnabled){
            items.push(
              <MenuItem primaryText="Forms Cookbook" onClick={()=>{ history.push('/forms-cookbook') }} />
            )
          }
          return (
            <ExtraOptions items={ items } />
          );
        }}
      />
    </Switch>);
  }

  getMenuSwitch(){
    return (<Switch>
      <Route path='/sites/:site/workspaces/:workspace' render={ ({match, history})=> {
        return this.renderWorkspaceSidebar(history, match.url, match.params.site, match.params.workspace);
      }} />
      <Route path="/" exact={true} render={ ({match, history})=> {
        return this.renderWorkspaceSidebar(history, match.url, null, null);
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
        /*
      <Route path='/selectsite' exact render={ () => {
        return <SelectSite />
      }} />
        */
  getContentSwitch(){
    return (<Switch>
      <Route path='/' exact render={ () => {
        return <Home key={ 'home' } />
      }} />
      <Route path='/prefs' exact render={ () => {
        return <Prefs />
      }} />
      <Route path='/console' exact render={ () => {
        return <Console />
      }} />
      <Route path='/sites/:site/workspaces/:workspace' exact render={ ({match})=> {
        //$FlowFixMe
        return <Home key={ 'home' } siteKey={ decodeURIComponent(match.params.site) } workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />
      <Route path='/sites/:site/workspaces/:workspace/collections/:collection' exact render={ ({match})=> {
        //$FlowFixMe
        return <Collection key={ match.url } siteKey={ decodeURIComponent(match.params.site) } workspaceKey={ decodeURIComponent(match.params.workspace) } collectionKey={ decodeURIComponent(match.params.collection) } />
      }} />
      <Route path='/sites/:site/workspaces/:workspace/collections/:collection/:item' exact render={ ({match})=> {
        //$FlowFixMe
        return <CollectionItem key={ match.url } siteKey={ decodeURIComponent(match.params.site) } workspaceKey={ decodeURIComponent(match.params.workspace) } collectionKey={ decodeURIComponent(match.params.collection) }           collectionItemKey={ decodeURIComponent(match.params.item) } />
      }} />
      <Route path='/sites/:site/workspaces/:workspace/singles/:single' exact render={ ({match})=> {
        //$FlowFixMe
        return <Single key={ match.url } siteKey={ decodeURIComponent(match.params.site) } workspaceKey={ decodeURIComponent(match.params.workspace) } singleKey={ decodeURIComponent(match.params.single) } /> }} />
      <Route path="/forms-cookbook" exact={false} render={ ({match, history})=> {
          console.log(window.location.href);
        return <FormsCookbookRouted />;
      }} />
      <Route path="*" component={(data)=>{
        console.log('Redirecting...',data);
        return <Redirect to='/' />
      }} />
    </Switch>);
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

        let header = <Header
        minimizeHandler={this.minimizeWindow.bind(this)}
        toggleMaximizeHandler={this.toggleWindowMode.bind(this)}
        closeHandler={this.closeWindow.bind(this)}
        isMaximized={this.state.maximized}
    />;

    let containerStyle = this.state.style.container;
    let menuContainerStyle = this.state.style.menuContainer;
    let contentContainerStyle = this.state.style.contentContainer;
  //  let hideMenuItems = false;

     if(!this.state.menuIsLocked){
      contentContainerStyle = Object.assign({}, contentContainerStyle, {display: 'block', paddingLeft:'66px' });
      menuContainerStyle = Object.assign({}, menuContainerStyle, { position: 'absolute', zIndex: '2', height:'100%', width:'280px', transform: 'translateX(-214px)' } )
      //hideMenuItems = true;
      if(this.state.forceShowMenu){
        menuContainerStyle.transform='translateX(0px)';
        contentContainerStyle.transform='translateX(214px)';
      }
      if(!this.state.skipMenuTransition){
        let transition = 'all ease-in-out .3s';
        contentContainerStyle.transition = transition;
        menuContainerStyle.transition = transition;
      }

      this.state.skipMenuTransition = false ;
     }


    //let showInlineMenus = true;
    console.log(this.state.configurations);
    if(this.state.configurations && this.state.configurations.global && this.state.configurations.global.hideInlineMenus === false){
      console.log('hallo');
      //showInlineMenus = false;
    }

    return (<Switch>
      <Route path="/console" exact={false} render={ ({match, history})=> {

       return (
         <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
           <div className="App">
             <div key="main-content" style={contentContainerStyle} onClick={()=>{ if(this.state.forceShowMenu) this.toggleForceShowMenu() }}>

               { this.getContentSwitch() }

              </div>
            </div>
          </MuiThemeProvider>

          )

      }} />

      <Route path="/selectsite" exact={false} render={ ({match, history})=> {

       return (
         <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
           <div className="App">
             <div key="main-content" style={contentContainerStyle} onClick={()=>{ if(this.state.forceShowMenu) this.toggleForceShowMenu() }}>

               { this.getContentSwitch() }

              </div>
            </div>
          </MuiThemeProvider>

          )

      }} />


      <Route path="/prefs" exact={false} render={ ({match, history})=> {

       return (
         <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
           <div className="App">
             <div key="main-content" style={contentContainerStyle} onClick={()=>{ if(this.state.forceShowMenu) this.toggleForceShowMenu() }}>

               { this.getContentSwitch() }

              </div>
            </div>
          </MuiThemeProvider>

          )

      }} />
      <Route
        path="*"
        render={ ({match, history})=>{
          return (
            <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
                <div className="App" style={marginStyles}>

                {(this.state.configurations && this.state.configurations.global && this.state.configurations.global.hideWindowFrame === true) ? (
                  header
                ) : (
                  <div></div>
                )}

                <div style={containerStyle}>

                  {(this.state.configurations && this.state.configurations.global && this.state.configurations.global.hideInlineMenus === false) ? (
                    this.getExtraOptionsSwitch()
                  ) : (
                    <div></div>
                  )}

                  <div style={menuContainerStyle} className='hideScrollbar' >
                    { this.getMenuSwitch() }
                  </div>

                  <div key="main-content" style={contentContainerStyle} onClick={()=>{ if(this.state.forceShowMenu) this.toggleForceShowMenu() }}>
                    { this.getContentSwitch() }
                  </div>

                </div>

                {(this.state.configurations && this.state.configurations.global && this.state.configurations.global.hideInlineMenus === false) ? (

                  <NotificationUI />
                ) : (
                  <div></div>
                )}

                {(this.state.redirectCookbook) ? (
                  <Redirect to='/forms-cookbook' />
                ) : (
                  <div></div>
                )}

                {(this.state.redirectMountSite) ? (
                  <Redirect to={this.state.redirectMountSite} />
                ) : (
                  <div></div>
                )}

                {(this.state.redirectHome) ? (
                  <Redirect to='/' />
                ) : (
                  <div></div>
                )}

                {(this.state.redirectConsole) ? (
                  <Redirect to='/console' />
                ) : (
                  <div></div>
                )}

                {(this.state.redirectPrefs) ? (
                    <Redirect to='/prefs' />
                ) : (
                    <div></div>
                )}
                {(this.state.redirectSelectSite) ? (
                    <Redirect to='/selectsite' />
                ) : (
                    <div></div>
                )}

              </div>
            </MuiThemeProvider>
          );

        }}
      />
    </Switch>);
  }
}

export default App;
