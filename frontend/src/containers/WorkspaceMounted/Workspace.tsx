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
import Box from '@mui/material/Box';
import { SiteConfig } from '../../../types';

interface WorkspaceConfig {
  serve?: Array<{
    hugoHidePreviewSite?: boolean;
    [key: string]: unknown;
  }>;
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

  toolbarItemsLeft(siteKey: string, workspaceKey: string, activeButton: string){
    return [
      <ToolbarButton
        key="buttonContent"
        active={(activeButton === "content" ? true : false)}
        to={`/sites/${siteKey}/workspaces/${workspaceKey}`}
        title="Content"
        icon={LibraryBooksIcon}
      />,
      <ToolbarButton
        key="buttonSync"
        active={(activeButton === "sync" ? true : false)}
        to={`/sites/${siteKey}/workspaces/${workspaceKey}/sync/`}
        title="Sync"
        icon={SyncIcon}
      />,
      (

      this.props.applicationRole === 'siteDeveloper' ?
      <ToolbarButton
        key="buttonSiteConf"
        active={(activeButton === "tools" ? true : false)}
        to={`/sites/${siteKey}/workspaces/${workspaceKey}/siteconf/general`}
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
        // Must stay imperative - calls API before navigation
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
        to={`/prefs/?siteKey=${siteKey}`}
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
          itemsLeft={this.toolbarItemsLeft(siteKey, workspaceKey, "tools")}
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
          itemsLeft={this.toolbarItemsLeft(siteKey, workspaceKey, "sync")}
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
          itemsLeft={this.toolbarItemsLeft(siteKey, workspaceKey, "content")}
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

    // Reset skipMenuTransition if it was set
    if (this.state.skipMenuTransition) {
      this.setState({ skipMenuTransition: false });
    }

    return (<Switch>
      <Route
      path="*"
      render={ ({match})=>{

        return (

            <Box sx={{ marginRight: 0 }}>
              {/* Top Toolbar */}
              <Box
                sx={{
                  borderTop: (theme) => `solid 1px ${theme.palette.toolbar.border}`,
                  borderBottom: (theme) => `solid 1px ${theme.palette.toolbar.border}`,
                  top: 0,
                  position: 'absolute',
                  display: 'flex',
                  width: '100%',
                  backgroundColor: (theme) => theme.palette.toolbar.background,
                }}
              >
                {/* Toolbar Left */}
                <Box
                  sx={{
                    flex: '0 0 280px',
                    borderRight: (theme) => `solid 1px ${theme.palette.toolbar.border}`,
                    overflowY: 'hidden',
                    overflowX: 'hidden',
                    height: '50px',
                  }}
                >
                  { this.renderTopToolbarLeftSwitch() }
                </Box>

                {/* Toolbar Right */}
                <Box sx={{ flex: 'auto', height: '50px', overflow: 'hidden' }}>
                  { this.renderTopToolbarRightSwitch() }
                </Box>
              </Box>

              {/* Main Container */}
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  height: 'calc(100vh - 52px)',
                  marginTop: '52px',
                  overflowX: 'hidden',
                }}
              >
                {/* Sidebar/Menu */}
                <Box
                  className='hideScrollbar'
                  sx={{
                    flex: '0 0 280px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    userSelect: 'none',
                    background: (theme) => theme.palette.sidebar.background,
                    // Dynamic: unlocked menu behavior
                    ...(this.state.menuIsLocked
                      ? {}
                      : {
                          position: 'absolute',
                          zIndex: 2,
                          height: '100%',
                          width: '280px',
                          transform: this.state.forceShowMenu
                            ? 'translateX(0px)'
                            : 'translateX(-214px)',
                          transition: this.state.skipMenuTransition
                            ? 'none'
                            : 'all ease-in-out 0.3s',
                        }),
                  }}
                >
                  { this.renderMenuSwitch() }
                </Box>

                {/* Content */}
                <Box
                  key="main-content"
                  onClick={()=>{ if(this.state.forceShowMenu) this.toggleForceShowMenu() }}
                  sx={{
                    flex: 'auto',
                    userSelect: 'none',
                    overflow: 'auto',
                    overflowX: 'hidden',
                    // Dynamic: unlocked menu content shift
                    ...(this.state.menuIsLocked
                      ? {}
                      : {
                          display: 'block',
                          paddingLeft: '66px',
                          transform: this.state.forceShowMenu
                            ? 'translateX(214px)'
                            : 'translateX(0px)',
                          transition: this.state.skipMenuTransition
                            ? 'none'
                            : 'all ease-in-out 0.3s',
                        }),
                  }}
                >
                  { this.state.error && (<p style={{
                    color: '#EC407A', padding: '10px', margin: '16px',
                    fontSize:'14px', border: 'solid 1px #EC407A',
                    borderRadius:3
                  }}>{this.state.error}</p>) }

                  { this.renderContentSwitch() }
                </Box>

              </Box>

            </Box>
        );

      }} />
  </Switch>);
  }
}

export default withRouter(WorkSpace);

