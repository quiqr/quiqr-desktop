import React     from 'react';
import { Route } from 'react-router-dom'
import service   from './../../services/service'
import Sidebar, { SidebarMenu } from '../Sidebar';
import { History } from 'history';
import { UserPreferences } from '../../../types';
//import Box       from '@mui/material/Box';
//import Switch    from '@mui/material/Switch';

interface SiteConfig {
  key: string;
  [key: string]: unknown;
}

interface WorkspaceCollection {
  key: string;
  title: string;
  [key: string]: unknown;
}

interface WorkspaceSingle {
  key: string;
  title: string;
  [key: string]: unknown;
}

interface WorkspaceMenuItem {
  key: string;
  disabled?: boolean;
  [key: string]: unknown;
}

interface WorkspaceMenu {
  title: string;
  disabled?: boolean;
  matchRole?: string;
  menuItems: WorkspaceMenuItem[];
}

interface WorkspaceDetails {
  collections: WorkspaceCollection[];
  singles: WorkspaceSingle[];
  menu?: WorkspaceMenu[];
}

interface WorkspaceSidebarProps {
  siteKey: string;
  workspaceKey: string;
  hideItems?: boolean;
  menuIsLocked?: boolean;
  onLockMenuClicked?: () => void;
  onToggleItemVisibility?: () => void;
  applicationRole?: string;
}

interface WorkspaceSidebarState {
  site: SiteConfig | null;
  draftMode: boolean;
  workspace: WorkspaceDetails | null;
  menusCollapsed: string[];
  error: string | null;
  prefs?: Record<string, unknown>;
  showEmpty?: boolean;
  selectedMenuItem?: string;
}

class WorkspaceSidebar extends React.Component<WorkspaceSidebarProps, WorkspaceSidebarState>{

  _ismounted: boolean = false;

  constructor(props: WorkspaceSidebarProps){
    super(props);

    this.state = {
      site: null,
      draftMode: false,
      workspace: null,
      menusCollapsed: [],
      error: null
    };

  }

  componentDidMount(){
    /* PORTQUIQR
    window.require('electron').ipcRenderer.on('frontEndBusy', ()=>{
      this.setState({showEmpty: true});
    });
    service.registerListener(this);
    */

    this._ismounted = true;
    this.refresh();

    service.api.readConfKey('prefs').then((value: UserPreferences)=>{

      this.setState({prefs: value});

      const collapsedMenusKey = this.props.siteKey+':collapsedMenus';
      if(collapsedMenusKey in value && Array.isArray(value[collapsedMenusKey])){
        this.setState({menusCollapsed: value[collapsedMenusKey] as string[] });
      } else {
        this.setState({menusCollapsed: []});
      }
      
    });
  }

  componentDidUpdate(preProps: WorkspaceSidebarProps){

    if(preProps.siteKey){

      if(!this.state.site)
      {
        this.refresh();
      }
    }
  }

  refresh = ()=>{
    let {siteKey, workspaceKey } = this.props;
    if(siteKey && workspaceKey){
      service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle)=>{
        if(this._ismounted){
          this.setState({
            site: bundle.site,
            workspace: bundle.workspaceDetails,
            error: null
          });
        }
      }).catch((e: Error | string)=>{
        if(this._ismounted){
          const errorMessage = typeof e === 'string' ? e : e.message;
          this.setState({site: null, workspace: null, error: errorMessage});
        }
      });
    }
  }

  componentWillUnmount(){
    service.unregisterListener(this);
    this._ismounted = false;
  }

  render(){
    if(this.state.showEmpty){
      return (<div />);
    }
    else{}
    return (<Route render={({history})=>{ return this.renderWithRoute(history) }} />);
  }

  matchRole(menuslot: WorkspaceMenu){
    if(typeof menuslot.matchRole === 'undefined' || menuslot.matchRole === '' || menuslot.matchRole === 'all' || this.props.applicationRole === menuslot.matchRole){
      return true;
    }
    return false;
  }

  renderWithRoute(history: History){

    let encodedSiteKey = this.props.siteKey ? encodeURIComponent(this.props.siteKey) : '';
    let encodedWorkspaceKey = this.props.workspaceKey ? encodeURIComponent(this.props.workspaceKey) : '';
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}`;

    let menus: SidebarMenu[] = [];

    if(this.state.workspace){

      //TODO only allow menu not singles and collections remove this if
      if("menu" in this.state.workspace){
        this.state.workspace.menu.map((menuslot, mindex) => {

          if(this.matchRole(menuslot) && menuslot.disabled !== true){

            menus.push({
              title: menuslot.title,
              expandable: true,
              items: menuslot.menuItems.filter( (item)=> item.disabled !== true ).map((menuitem, iindex) => {
                let item = null;
                let itemType = null;

                if(this.state.workspace?.collections?.some(e => e.key === menuitem.key)) {
                  item = this.state.workspace.collections.find(e => e.key === menuitem.key);
                  itemType = "collections";
                }
                else if(this.state.workspace?.singles?.some(e => e.key === menuitem.key)) {
                  item = this.state.workspace.singles.find(e => e.key === menuitem.key);
                  itemType = "singles";
                }

                if(item){
                  return {
                    label: item.title,
                    selected: (this.state.selectedMenuItem===`menu-${mindex}-${iindex}` ? true : false),
                    onClick: () => {
                      this.setState({selectedMenuItem:`menu-${mindex}-${iindex}`})
                      history.push(`${basePath}/${itemType}/${encodeURIComponent(item.key)}`);
                      this.refresh();
                    },
                    active: false
                  }
                }
                else{
                  return {
                    label: menuitem.key +' (missing)',
                    active: false
                  }
                }

              })
            });
          }
          return null;

        });

      }
      else{

        //COLLECTIONS MENU
        if(this.state.workspace.collections.length > 0){
          menus.push({
            title: 'Collections',
            items: this.state.workspace.collections.map((collection, index) => {
              return {
                label: collection.title,
                onClick: () => {
                  history.push(`${basePath}/collections/${encodeURIComponent(collection.key)}`);
                  this.refresh();
                },
                active: false
              }
            })
          });
        }

        //SINGLES MENU
        if(this.state.workspace.singles.length > 0){
          menus.push({
            title: 'Singles',
            items: this.state.workspace.singles.map((collection, index) => {
              return {
                label: collection.title,
                onClick: () => {
                  history.push(`${basePath}/singles/${encodeURIComponent(collection.key)}`)
                  this.refresh();
                },
                active: false
              }
            })
          });
        }

      }
    }

    let statusPanel = null;
    /*let statusPanel = (

        <Box
          className="status-panel"
          style={{
            borderTop:'solid 1px #c7c5c4',
            backgroundColor:'#d8d9da',
            width:'280px',
            height:'100px',
            bottom:'0px',
            position:'absolute'
          }}>
          <Box m={1}><div className="led led-green"></div>Hugo Server Running</Box>
          <Box m={1}><div className="led led-green" ></div>Build Success</Box>
          <Box m={1}> 
            <Switch
              size="small"
              checked={this.state.draftMode}
              onChange={(e)=>{
                if(e.target.checked){
                  this.setState({draftMode:true})
                }
                else{
                  this.setState({draftMode:false})
                }
              }}

              name="draftmode"
              color="primary"
            />
            Draft Mode</Box>

        </Box>
    )
    */

    return (<React.Fragment>
      <Sidebar
        hideItems={this.props.hideItems}
        statusPanel={statusPanel}
        menus={menus}
        menusCollapsed={this.state.menusCollapsed}
        onMenuExpandToggle={(menuKey)=>{

          let collapseList = this.state.menusCollapsed || [];
          if(collapseList.includes(menuKey)){
            let index = collapseList.indexOf(menuKey);
            if (index !== -1) {
              collapseList.splice(index, 1);
            }
          }
          else{
            collapseList.push(menuKey);
          }

          service.api.saveConfPrefKey(this.props.siteKey+':collapsedMenus',collapseList);
          this.setState({menusCollapsed: collapseList});

        }}
      />
      { this.state.error && (
        <p style={{
          color: '#EC407A', padding: '10px', margin: '16px',
          fontSize:'14px', border: 'solid 1px #EC407A',
          borderRadius:3
        }}>{this.state.error}</p>)
      }

    </React.Fragment>
    )
  }
}

export default WorkspaceSidebar;
