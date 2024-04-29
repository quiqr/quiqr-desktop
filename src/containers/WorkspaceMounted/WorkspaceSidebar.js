import React     from 'react';
import { Route } from 'react-router-dom'
import service   from './../../services/service'
import Sidebar   from '../Sidebar';
//import Box       from '@material-ui/core/Box';
//import Switch    from '@material-ui/core/Switch';

class WorkspaceSidebar extends React.Component{

  constructor(props){
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
    window.require('electron').ipcRenderer.on('frontEndBusy', ()=>{
      this.setState({showEmpty: true});
    });
    service.registerListener(this);

    this._ismounted = true;
    this.refresh();

    service.api.readConfKey('prefs').then((value)=>{
      this.setState({prefs: value });

      if(value[this.props.siteKey+':collapsedMenus']){
        this.setState({menusCollapsed: value[this.props.siteKey+':collapsedMenus'] });
      }
      else{
        this.setState({menusCollapsed: []});
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

  refresh = ()=>{
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

  render(){
    if(this.state.showEmpty){
      return (<div />);
    }
    else{}
    return (<Route render={({history})=>{ return this.renderWithRoute(history) }} />);
  }

  matchRole(menuslot){
    if(typeof menuslot.matchRole === 'undefined' || menuslot.matchRole === '' || menuslot.matchRole === 'all' || this.props.applicationRole === menuslot.matchRole){
      return true;
    }
    return false;
  }

  renderWithRoute(history: any){

    let encodedSiteKey = this.props.siteKey ? encodeURIComponent(this.props.siteKey) : '';
    let encodedWorkspaceKey = this.props.workspaceKey ? encodeURIComponent(this.props.workspaceKey) : '';
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}`;

    let menus: Array = [];

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

                if(this.state.workspace.collections.some(e => e.key === menuitem.key)) {
                  item = this.state.workspace.collections.find(e => e.key === menuitem.key);
                  itemType = "collections";
                }
                else if(this.state.workspace.singles.some(e => e.key === menuitem.key)) {
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
        menuIsLocked={this.props.menuIsLocked}
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
        onLockMenuClicked={this.props.onLockMenuClicked}
        onToggleItemVisibility={this.props.onToggleItemVisibility}
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
