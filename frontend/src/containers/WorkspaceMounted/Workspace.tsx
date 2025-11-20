import React                               from 'react';
import { withRouter, RouteComponentProps }                      from 'react-router';
import { Switch, Route }                   from 'react-router-dom'
import AppsIcon                            from '@mui/icons-material/Apps';
import SettingsApplicationsIcon            from '@mui/icons-material/SettingsApplications';
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import BuildIcon                           from '@mui/icons-material/Build';
import LibraryBooksIcon                    from '@mui/icons-material/LibraryBooks';
import SyncIcon                            from '@mui/icons-material/Sync';
import OpenInBrowserIcon                   from '@mui/icons-material/OpenInBrowser';
import Dashboard                           from './Dashboard'
import TopToolbarLeft                      from '../TopToolbarLeft'
import {TopToolbarRight, ToolbarButton}    from '../TopToolbarRight'
import Collection                          from './Collection';
import CollectionItem                      from './Collection/CollectionItem';
import Single                              from './Single';
import WorkspaceSidebar                    from './WorkspaceSidebar';
import { SiteConfSidebar, SiteConfRouted } from './SiteConf';
import { SyncSidebar, SyncRouted }         from './Sync';
import service                             from '../../services/service';
import { History } from 'history';

//TODO use global
import styleLightDefault from '../../app-ui-styles/quiqr10/style-light.js';
import styleDarkDefault from '../../app-ui-styles/quiqr10/style-dark.js';
import { UserPreferences } from '../../../types';
let style = styleLightDefault;

interface SiteConfig {
  key: string;
  name: string;
  publish?: Array<{
    key: string;
    config?: {
      type?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface WorkspaceConfig {
  serve?: Array<{
    hugoHidePreviewSite?: boolean;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface StyleConfig {
  container: Record<string, unknown>;
  menuContainer: Record<string, unknown>;
  contentContainer: Record<string, unknown>;
  topToolbar: Record<string, unknown>;
  [key: string]: unknown;
}

interface WorkspaceProps extends RouteComponentProps {
  siteKey: string;
  workspaceKey: string;
  applicationRole?: string;
}

interface WorkspaceState {
  site: SiteConfig | null;
  workspace: WorkspaceConfig | null;
  error: string | null;
  style: StyleConfig;
  menuIsLocked: boolean;
  forceShowMenu: boolean;
  skipMenuTransition: boolean;
}

class WorkSpace extends React.Component<WorkspaceProps, WorkspaceState>{

  _ismounted: boolean = false;

  constructor(props: WorkspaceProps){
    super(props);

    //PORTQUIQR
    //let win = window.require('electron').remote.getCurrentWindow();

    this.state = {
      site: null,
      workspace: null,
      error: null,
      //maximized:win.isMaximized(),
      style: style,
      menuIsLocked: true,
      forceShowMenu: false,
      skipMenuTransition: false,
    };

    /*
    win.on('maximize', () => { this.setState({maximized: true}); });
    win.on('unmaximize', ()=>{ this.setState({maximized: false}); });
    window.state = this.state;
    */
  }

  componentDidMount(){

    this._ismounted = true;

    /* PORTQUIQR
    window.require('electron').ipcRenderer.on('frontEndBusy', ()=>{
      this.setState({showEmpty: true});
    });
    service.registerListener(this);
    */

    this.refresh();
    this.setThemeStyleFromPrefs();
  }

  setThemeStyleFromPrefs(){
    service.api.readConfKey('prefs').then((value: UserPreferences)=>{
      if(value.interfaceStyle){
        let themeStyle='light';
        if(value.interfaceStyle ==='quiqr10-dark'){
          themeStyle='dark';
        }

        this.setState({
          style: themeStyle === 'light' ? styleLightDefault : styleDarkDefault,
        });
      }
    });
  }


  componentDidUpdate(preProps: WorkspaceProps){

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
      service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle)=>{
        if(this._ismounted){
          this.setState({
            site: bundle.site as SiteConfig,
            workspace: bundle.workspaceDetails as WorkspaceConfig,
            error: null
          });
        }
      }).catch((e: unknown)=>{
        if(this._ismounted){
          this.setState({site: null, workspace: null, error: String(e)});
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

  renderWorkspaceSidebar = (_history: History, url: string, site: string, workspace: string)=>{

    return <WorkspaceSidebar
      key={ url }
      applicationRole={ this.props.applicationRole }
      siteKey={ site ? decodeURIComponent(site) : '' }
      workspaceKey={ workspace ? decodeURIComponent(workspace) : '' }
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

  toolbarItemsLeft(siteKey: string, workspaceKey: string, activeButton: string, history: History){
    return [
      <ToolbarButton
        key="buttonContent"
        active={(activeButton === "content" ? true : false)}
        action={()=>{
          history.push(`/sites/${siteKey}/workspaces/${workspaceKey}`);
        }}
        title="Content"
        icon={LibraryBooksIcon}
      />,
      <ToolbarButton
        key="buttonSync"
        active={(activeButton === "sync" ? true : false)}
        action={()=>{
          history.push(`/sites/${siteKey}/workspaces/${workspaceKey}/sync/`);
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
          history.push(`/sites/${siteKey}/workspaces/${workspaceKey}/siteconf/general`);
        }}
        title="Tools"
        icon={BuildIcon}
      />
        :null)
    ];
  }

  toolbarItemsRight(siteKey: string, history: History){

    return [
      <ToolbarButton
        key="buttonLog"
        action={()=>{
          service.api.showLogWindow();
        }}
        title="Log"
        icon={DeveloperModeIcon}
      />,
      <ToolbarButton
        key="buttonLibrary"
        action={()=>{
          service.api.openSiteLibrary().then(()=>{
            history.push(`/sites/last`);
          });
        }}
        title="Site Library"
        icon={AppsIcon}
      />,
      <ToolbarButton
        key="buttonPrefs"
        action={()=>{
          history.push(`/prefs/?siteKey=${siteKey}`);
        }}
        title="Preferences"
        icon={SettingsApplicationsIcon}
      />,

    ];
  }

  showPreviewSiteButton(){
    if(this.state.workspace && this.state.workspace.serve && this.state.workspace.serve[0].hugoHidePreviewSite){
      return null
    }

    return (
      <ToolbarButton
        key="buttonPreview"
        action={()=>{
          this.openPreviewInBrowser();
        }}
        title="Preview Site"
        icon={OpenInBrowserIcon}
      />
    )
  }

  openPreviewInBrowser(){

    let currentBaseUrlPath = '';
    service.api.getCurrentBaseUrl().then((path)=>{
      if (typeof path === 'string') {
        currentBaseUrlPath = path;
        window.require('electron').shell.openExternal('http://localhost:13131'+currentBaseUrlPath);
      }
    });
  }

  renderTopToolbarRightSwitch(){

    return (<Switch>

      <Route path='/sites/:site/workspaces/:workspace/siteconf' render={ ({match, history})=> {
        const siteKey= decodeURIComponent(match.params.site);
        const workspaceKey= decodeURIComponent(match.params.workspace);
        return <TopToolbarRight

          key="toolbar-right-workspace-siteconf"
          itemsLeft={this.toolbarItemsLeft(siteKey, workspaceKey, "tools", history)}
          itemsCenter={[]}
          itemsRight={this.toolbarItemsRight(siteKey, history)}
        />
      }} />

      <Route path='/sites/:site/workspaces/:workspace/sync' render={ ({match,history})=> {
        const siteKey= decodeURIComponent(match.params.site);
        const workspaceKey= decodeURIComponent(match.params.workspace);
        const toolbarItemsCenter = [
          this.showPreviewSiteButton()
        ];

        return <TopToolbarRight
          key="toolbar-right-workspace-dashboard"
          itemsLeft={this.toolbarItemsLeft(siteKey, workspaceKey, "sync", history)}
          itemsCenter={toolbarItemsCenter}
          itemsRight={this.toolbarItemsRight(siteKey, history)}
        />
      }} />

      <Route path='/sites/:site/workspaces/:workspace' render={ ({match, history})=> {
        const siteKey= decodeURIComponent(match.params.site);
        const workspaceKey= decodeURIComponent(match.params.workspace);
        const toolbarItemsCenter = [
          this.showPreviewSiteButton()
        ];

        return <TopToolbarRight
          key="toolbar-right-workspace-dashboard"
          itemsLeft={this.toolbarItemsLeft(siteKey, workspaceKey, "content", history)}
          itemsCenter={toolbarItemsCenter}
          itemsRight={this.toolbarItemsRight(siteKey, history)}
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
          site={ this.state.site as SiteConfig & { publish: Array<{ key: string; config?: { type?: string; [key: string]: unknown } }> } }
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

  renderDashboard(match: { url: string; params: { [key: string]: string } }){
    return <Dashboard
      key={ match.url }
      applicationRole={ this.props.applicationRole }
      siteKey={ decodeURIComponent(match.params.site) }
      workspaceKey={ decodeURIComponent(match.params.workspace) } />
  }

  renderSync(match: { url: string; params: { [key: string]: string } }){
    return <SyncRouted
      key={ match.url }
      site={ this.state.site }
      workspace={ this.state.workspace }
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
    let topToolbarStyle = this.state.style.topToolbar;

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

      this.setState({skipMenuTransition: false});
    }

    return (<Switch>
      <Route
      path="*"
      render={ ({match})=>{

        return (

            <div className="App" style={marginStyles}>

              <div style={topToolbarStyle}>

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
        );

      }} />
  </Switch>);
  }
}

export default withRouter(WorkSpace);

