import React                               from 'react';
import { withRouter }                      from 'react-router';
import { Switch, Route }                   from 'react-router-dom'
import Dashboard                           from './Dashboard'
import Publish                             from './Publish'
import TopToolbarLeft                      from '../TopToolbarLeft'
import {TopToolbarRight, ToolbarButton}    from '../TopToolbarRight'
import Collection                          from './Collection';
import CollectionItem                      from './Collection/CollectionItem';
import Single                              from './Single';
import WorkspaceSidebar                    from './WorkspaceSidebar';
import { SiteConfSidebar, SiteConfRouted } from './SiteConf';
import AppsIcon                            from '@material-ui/icons/Apps';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import TuneIcon                            from '@material-ui/icons/Tune';
import LibraryBooksIcon                    from '@material-ui/icons/LibraryBooks';
import PublishIcon                         from '@material-ui/icons/Publish';
import OpenInBrowserIcon                   from '@material-ui/icons/OpenInBrowser';
import lightBaseTheme                      from 'material-ui-02/styles/baseThemes/lightBaseTheme';
//import darkBaseTheme                                 from 'material-ui-02/styles/baseThemes/darkBaseTheme';
import MuiThemeProvider                    from 'material-ui-02/styles/MuiThemeProvider';
import getMuiTheme                         from 'material-ui-02/styles/getMuiTheme';
import service                             from '../../services/service';

const iconColor = "#000";
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

let style = require('../../themes/default/style.js');

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
    this.refresh();

    service.getConfigurations().then((c)=>{
      var stateUpdate  = {};
      stateUpdate.configurations = c;
      stateUpdate.style = require('../../themes/' + c.global.appTheme + '/style.js');

      this.setState(stateUpdate);
    })
    this.getProfile();
  }

  componentDidUpdate(preProps: compProps){

    if(preProps.siteKey){

      if(!this.state.site)
      {
        this.refresh();
      }
    }
  }
  componentWillMount(){
    window.require('electron').ipcRenderer.on('frontEndBusy', ()=>{
      this.setState({showEmpty: true});
    });
    service.registerListener(this);
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

  toolbarItemsLeft(siteKey, workspaceKey){
    return [
      <ToolbarButton
        action={()=>{
          service.api.redirectTo(`/sites/${siteKey}/workspaces/${workspaceKey}`);
        }}
        title="Content"
        icon={<LibraryBooksIcon style={{ color: iconColor }} />}
      />,
      <ToolbarButton
        action={()=>{
          service.api.redirectTo(`/sites/${siteKey}/workspaces/${workspaceKey}/publish/front`);
        }}
        title="Publish"
        icon={<PublishIcon style={{ color: iconColor }} />}
      />,
      <ToolbarButton
        action={()=>{
          service.api.redirectTo(`/sites/${siteKey}/workspaces/${workspaceKey}/siteconf/general`);
        }}
        title="Config"
        icon={<TuneIcon style={{ color: iconColor }} />}
      />,
    ];
  }

  toolbarItemsRight(){

    return [
      <ToolbarButton
        action={()=>{
          service.api.redirectTo("/sites/last");
        }}
        title="Site Library"
        icon={<AppsIcon style={{ color: iconColor }} />}
      />,
        <ToolbarButton
        action={()=>{
          service.api.redirectTo(`/prefs/`);
        }}
        title="Preferences"
        icon={<SettingsApplicationsIcon style={{ color: iconColor }} />}
      />,
  ];
  }

  renderTopToolbarRightSwitch(){

    return (<Switch>

      <Route path='/sites/:site/workspaces/:workspace/siteconf' render={ ({match})=> {
        const siteKey= decodeURIComponent(match.params.site);
        const workspaceKey= decodeURIComponent(match.params.workspace);
        return <TopToolbarRight
          itemsLeft={this.toolbarItemsLeft(siteKey, workspaceKey)}
          itemsCenter={[]}
          itemsRight={this.toolbarItemsRight()}
        />
      }} />

      <Route path='/sites/:site/workspaces/:workspace' render={ ({match})=> {
        const siteKey= decodeURIComponent(match.params.site);
        const workspaceKey= decodeURIComponent(match.params.workspace);
        const toolbarItemsCenter = [
          <ToolbarButton
            action={()=>{
              window.require('electron').shell.openExternal('http://localhost:13131');
            }}
            title="Preview in Browser"
            icon={<OpenInBrowserIcon style={{ color: iconColor }} />}
          />
        ];

        return <TopToolbarRight
          itemsLeft={this.toolbarItemsLeft(siteKey, workspaceKey)}
          itemsCenter={toolbarItemsCenter}
          itemsRight={this.toolbarItemsRight()}
        />
      }} />

    </Switch>);
  }

  renderMenuSwitch(){
    const {history} = this.props;
    return (<Switch>

      <Route path='/sites/:site/workspaces/:workspace/publish' render={ ({match})=> {
        return null;
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
    this.getProfile();
    return <Dashboard
      key={ match.url }
      quiqrUsername={this.state.quiqrUsername}
      quiqrFingerprint={this.state.quiqrFingerprint}
      siteKey={ decodeURIComponent(match.params.site) }
      workspaceKey={ decodeURIComponent(match.params.workspace) } />
  }

  renderPublish(match){
    this.getProfile();
    return <Publish
      key={ match.url }
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

      <Route path='/sites/:site/workspaces/:workspace/publish/*'  render={ ({match})=> {
        return this.renderPublish(match);
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

