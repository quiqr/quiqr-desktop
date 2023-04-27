import React                               from 'react';
import { withRouter }                      from 'react-router';
import { Switch, Route }                   from 'react-router-dom'
import Dashboard                           from './Dashboard'
import TopToolbarLeft                      from '../TopToolbarLeft'
import {TopToolbarRight, ToolbarButton}    from '../TopToolbarRight'
import Collection                          from './Collection';
import CollectionItem                      from './Collection/CollectionItem';
import Single                              from './Single';
import WorkspaceSidebar                    from './WorkspaceSidebar';
import { SiteConfSidebar, SiteConfRouted } from './SiteConf';
import { SyncSidebar, SyncRouted }         from './Sync';
import AppsIcon                            from '@material-ui/icons/Apps';
import SettingsApplicationsIcon            from '@material-ui/icons/SettingsApplications';
import BuildIcon                           from '@material-ui/icons/Build';
import LibraryBooksIcon                    from '@material-ui/icons/LibraryBooks';
import SyncIcon                            from '@material-ui/icons/Sync';
import OpenInBrowserIcon                   from '@material-ui/icons/OpenInBrowser';
import lightBaseTheme                      from 'material-ui-02/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider                    from 'material-ui-02/styles/MuiThemeProvider';
import getMuiTheme                         from 'material-ui-02/styles/getMuiTheme';
import service                             from '../../services/service';

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

let style = require('../../app-ui-styles/quiqr10/style.js');

class WorkSpace extends React.Component{

  constructor(props){
    super(props);

    let win = window.require('electron').remote.getCurrentWindow();

    this.state = {
      site: null,
      workspace: null,
      error: null,
      maximized:win.isMaximized(),
      style: style,
      menuIsLocked: true,
      forceShowMenu: false,
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

    window.require('electron').ipcRenderer.on('frontEndBusy', ()=>{
      this.setState({showEmpty: true});
    });
    service.registerListener(this);

    this.refresh();

    service.api.readConfKey('prefs').then((value)=>{
      if(value.interfaceStyle){
        this.setState({style: require('../../app-ui-styles/'+value.interfaceStyle+'/style.js') });
      }
    });
  }

  componentDidUpdate(preProps: compProps){

    if(preProps.siteKey){

      if(!this.state.site)
      {
        this.refresh();
      }
    }
  }

  refresh(){
    let {siteKey, workspaceKey } = this.props;
    if(siteKey && workspaceKey){
      let stateUpdate = {};
      service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle)=>{
        stateUpdate.site = bundle.site;
        stateUpdate.workspace = bundle.workspaceDetails;
        stateUpdate.error = null;
        if(this._ismounted){
          this.setState(stateUpdate);
        }
      }).catch(e=>{
        if(this._ismounted){
          this.setState({site: null, workspace: null, error: e});
        }
      });
    }
  }

  componentWillUnmount(){
    service.unregisterListener(this);
    this._ismounted = false;
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
      applicationRole={ this.props.applicationRole }
      siteKey={ site ? decodeURIComponent(site) : null }
      site={this.state.site}
      workspaceKey={ workspace ? decodeURIComponent(workspace) : null }
      quiqrUsername={this.state.quiqrUsername}
      history={history}
      hideItems={!this.state.forceShowMenu && !this.state.menuIsLocked}
      menuIsLocked={this.state.menuIsLocked}
      onToggleItemVisibility={()=>{this.toggleForceShowMenu()}}
      onLockMenuClicked={()=>{this.toggleMenuIsLocked()}} />
  }

  renderTopToolbarLeftSwitch(){
    let siteName = "";
    if(this.state.site){
      siteName = this.state.site.name;
    }

    return (<Switch>

      <Route path='/sites/:site/workspaces/:workspace' render={ ({match})=> {
        return <TopToolbarLeft
          title={siteName}
          siteKey={ decodeURIComponent(match.params.site) }
          workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

    </Switch>);
  }

  toolbarItemsLeft(siteKey, workspaceKey, activeButton){
    return [
      <ToolbarButton
        key="buttonContent"
        active={(activeButton === "content" ? true : false)}
        action={()=>{
          service.api.redirectTo(`/sites/${siteKey}/workspaces/${workspaceKey}`);
        }}
        title="Content"
        icon={LibraryBooksIcon}
      />,
      <ToolbarButton
        key="buttonSync"
        active={(activeButton === "sync" ? true : false)}
        action={()=>{
          service.api.redirectTo(`/sites/${siteKey}/workspaces/${workspaceKey}/sync/`);
        }}
        title="Sync"
        icon={SyncIcon}
      />,
      (

      this.props.applicationRole === 'siteDeveloper' ?
      <ToolbarButton
        key="buttonSiteConf"
        active={(activeButton === "tools" ? true : false)}
        action={()=>{
          service.api.redirectTo(`/sites/${siteKey}/workspaces/${workspaceKey}/siteconf/general`);
        }}
        title="Tools"
        icon={BuildIcon}
      />
        :null)
    ];
  }

  toolbarItemsRight(siteKey){

    return [
      <ToolbarButton
        key="buttonLibrary"
        action={()=>{
          service.api.openSiteLibrary();
        }}
        title="Site Library"
        icon={AppsIcon}
      />,
      <ToolbarButton
        key="buttonPrefs"
        action={()=>{
          service.api.redirectTo(`/prefs/?siteKey=${siteKey}`);
        }}
        title="Preferences"
        icon={SettingsApplicationsIcon}
      />,
    ];
  }

  openPreviewInBrowser(){

    let currentBaseUrlPath = '';
    service.api.getCurrentBaseUrl().then((path)=>{
      currentBaseUrlPath = path;
      window.require('electron').shell.openExternal('http://localhost:13131'+currentBaseUrlPath);
    });
    //service.api.logToConsole(currentBaseUrl);
  }

  renderTopToolbarRightSwitch(){

    return (<Switch>

      <Route path='/sites/:site/workspaces/:workspace/siteconf' render={ ({match})=> {
        const siteKey= decodeURIComponent(match.params.site);
        const workspaceKey= decodeURIComponent(match.params.workspace);
        return <TopToolbarRight

          key="toolbar-right-workspace-siteconf"
          itemsLeft={this.toolbarItemsLeft(siteKey, workspaceKey, "tools")}
          itemsCenter={[]}
          itemsRight={this.toolbarItemsRight(siteKey)}
        />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/sync' render={ ({match})=> {
        const siteKey= decodeURIComponent(match.params.site);
        const workspaceKey= decodeURIComponent(match.params.workspace);
        const toolbarItemsCenter = [
          <ToolbarButton
            key="buttonPreview"
            action={()=>{
              this.openPreviewInBrowser();
            }}
            title="Preview in Browser"
            icon={OpenInBrowserIcon}
          />
        ];

        return <TopToolbarRight
          key="toolbar-right-workspace-dashboard"
          itemsLeft={this.toolbarItemsLeft(siteKey, workspaceKey, "sync")}
          itemsCenter={toolbarItemsCenter}
          itemsRight={this.toolbarItemsRight(siteKey)}
        />
      }} />

      <Route path='/sites/:site/workspaces/:workspace' render={ ({match})=> {
        const siteKey= decodeURIComponent(match.params.site);
        const workspaceKey= decodeURIComponent(match.params.workspace);
        const toolbarItemsCenter = [
          <ToolbarButton
            key="buttonPreview"
            action={()=>{
              this.openPreviewInBrowser();
            }}
            title="Preview in Browser"
            icon={OpenInBrowserIcon}
          />
        ];

        return <TopToolbarRight
          key="toolbar-right-workspace-dashboard"
          itemsLeft={this.toolbarItemsLeft(siteKey, workspaceKey, "content")}
          itemsCenter={toolbarItemsCenter}
          itemsRight={this.toolbarItemsRight(siteKey)}
        />
      }} />

    </Switch>);
  }

  renderMenuSwitch(){
    const {history} = this.props;
    return (<Switch>

      <Route path='/sites/:site/workspaces/:workspace/sync' render={ ({match})=> {
        return (<SyncSidebar
          menus={[]}
          site={ this.state.site }
          workspace={ this.state.workspace }
          siteKey={ decodeURIComponent(match.params.site) }
          workspaceKey={ decodeURIComponent(match.params.workspace) }
          hideItems={!this.state.forceShowMenu && !this.state.menuIsLocked}
          menuIsLocked={this.state.menuIsLocked}
          onToggleItemVisibility={()=>{this.toggleForceShowMenu()}}
          onLockMenuClicked={()=>{this.toggleMenuIsLocked()}}
        />);
      }} />

      <Route path='/sites/:site/workspaces/:workspace/siteconf' render={ ({match})=> {
        return (<SiteConfSidebar
        menus={[]}
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) }
        hideItems={!this.state.forceShowMenu && !this.state.menuIsLocked}
        menuIsLocked={this.state.menuIsLocked}
        onToggleItemVisibility={()=>{this.toggleForceShowMenu()}}
        onLockMenuClicked={()=>{this.toggleMenuIsLocked()}}
      />);
      }} />

      <Route path='/sites/:site/workspaces/:workspace' render={ ({match})=> {
        return this.renderWorkspaceSidebar(history, match.url, match.params.site, match.params.workspace);
      }} />

    </Switch>);
  }

  renderDashboard(match){
    return <Dashboard
      key={ match.url }
      applicationRole={ this.props.applicationRole }
      quiqrUsername={this.state.quiqrUsername}
      quiqrFingerprint={this.state.quiqrFingerprint}
      siteKey={ decodeURIComponent(match.params.site) }
      workspaceKey={ decodeURIComponent(match.params.workspace) } />
  }

  renderSync(match){
    return <SyncRouted
      key={ match.url }
      site={ this.state.site }
      workspace={ this.state.workspace }
      quiqrUsername={this.state.quiqrUsername}
      quiqrFingerprint={this.state.quiqrFingerprint}
      siteKey={ decodeURIComponent(match.params.site) }
      workspaceKey={ decodeURIComponent(match.params.workspace) } />
  }

  renderContentSwitch(){
    return (<Switch>
      <Route path='/sites/:site/workspaces/:workspace' exact render={ ({match})=> {
        return this.renderDashboard(match);
      }} />

      <Route path='/sites/:site/workspaces/:workspace/home/:refresh' exact render={ ({match})=> {
        return this.renderDashboard(match);
      }} />

      <Route path='/sites/:site/workspaces/:workspace/sync/*'  render={ ({match})=> {
        return this.renderSync(match);
      }} />

      <Route path='/sites/:site/workspaces/:workspace/siteconf/*'  render={ ({match})=> {
        return <SiteConfRouted
          siteKey={ decodeURIComponent(match.params.site) }
          workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/siteconf'  render={ ({match})=> {
        return <SiteConfRouted
          siteKey={ decodeURIComponent(match.params.site) }
          workspaceKey={ decodeURIComponent(match.params.workspace) } />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/collections/:collection' exact render={ ({match})=> {
        return <Collection
        key={ match.url }
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) }
        collectionKey={ decodeURIComponent(match.params.collection) } />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/collections/:collection/:item/:refresh' exact render={ ({match})=> {
        return <CollectionItem
        key={ match.url }
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) }
        collectionKey={ decodeURIComponent(match.params.collection) }
        collectionItemKey={ decodeURIComponent(match.params.item) } />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/collections/:collection/:item' exact render={ ({match})=> {
        return <CollectionItem
        key={ match.url }
        siteKey={ decodeURIComponent(match.params.site) }
        workspaceKey={ decodeURIComponent(match.params.workspace) }
        collectionKey={ decodeURIComponent(match.params.collection) }
        collectionItemKey={ decodeURIComponent(match.params.item) } />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/singles/:single/:refresh' exact render={ ({match})=> {
        return <Single
        key={ match.url }
        siteKey={ decodeURIComponent(match.params.site) }
        refreshed={ true }
        workspaceKey={ decodeURIComponent(match.params.workspace) }
        singleKey={ decodeURIComponent(match.params.single) } /> }} />

      <Route path='/sites/:site/workspaces/:workspace/singles/:single' render={ ({match})=> {
        return <Single
        key={ match.url }
        siteKey={ decodeURIComponent(match.params.site) }
        refreshed={ false }
        workspaceKey={ decodeURIComponent(match.params.workspace) }
        singleKey={ decodeURIComponent(match.params.single) } /> }} />

    </Switch>);
  }

  render() {

    let marginStyles = {
      marginRight:'0px'
    };

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
      <Route
      path="*"
      render={ ({match})=>{

        return (
          <MuiThemeProvider muiTheme={pogoTheme}>

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
                  { this.state.error && (<p style={{
                    color: '#EC407A', padding: '10px', margin: '16px',
                    fontSize:'14px', border: 'solid 1px #EC407A',
                    borderRadius:3
                  }}>{this.state.error}</p>) }

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

//export default WorkSpace;
export default withRouter(WorkSpace);

