import * as React           from 'react';
import { Route }            from 'react-router-dom';
import { Sidebar }          from './../../Sidebar';
import type { SidebarMenu } from './../../Sidebar';
//import service              from './../../services/service';

export class SiteConfSidebar extends React.Component {

  constructor(props){

    super(props);
    this.state = {
      selectedMenuItem: 'general'
    }
  }

  render(){
    return <Route render={({history})=>{ return this.renderWithRoute(history) }} />
  }

  renderWithRoute(history: {push:(path: string)=>void}){

    let encodedSiteKey = this.props.siteKey;
    let encodedWorkspaceKey = this.props.workspaceKey;
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}/siteconf`;

    let menu: SidebarMenu = {
      title: 'Site Configuration',
      items: [
        {
          active: true,
          label: "General",
          selected: (this.state.selectedMenuItem==='general' ? true : false),
          onClick: ()=>{
            this.setState({selectedMenuItem:'general'});
            history.push(`${basePath}/general/`)
          }
        },
        {
          active: true,
          label: "Model",
          selected: (this.state.selectedMenuItem==='model' ? true : false),
          onClick: ()=>{
            this.setState({selectedMenuItem:'model'});
            history.push(`${basePath}/model/`)
          }
        },
      ]
    }

    return <Sidebar {...this.props} menus={[menu]} />
  }
}
