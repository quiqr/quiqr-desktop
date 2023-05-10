import React                                from 'react';
import { Route }                            from 'react-router-dom'
import service                              from './../../services/service'
import Sidebar                              from '../Sidebar';

class WorkspaceSidebar extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      site: null,
      workspace: null,
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

  renderWithRoute(history: any){

    let encodedSiteKey = this.props.siteKey ? encodeURIComponent(this.props.siteKey) : '';
    let encodedWorkspaceKey = this.props.workspaceKey ? encodeURIComponent(this.props.workspaceKey) : '';
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}`;

    let menus: Array = [];

    if(this.state.workspace){

      if("menu" in this.state.workspace){
        this.state.workspace.menu.map((menuslot, mindex) => {

          if(typeof menuslot.matchRole === 'undefined' || this.props.applicationRole === menuslot.matchRole){
            menus.push({
              title: menuslot.title,
              expandable: true,
              items: menuslot.menuItems.map((menuitem, iindex) => {
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

    return (<React.Fragment>
      <Sidebar
        hideItems={this.props.hideItems}
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
