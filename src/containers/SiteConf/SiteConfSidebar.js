import * as React           from 'react';
import { Route }            from 'react-router-dom';
import { Sidebar }          from './../Sidebar';
import type { SidebarMenu } from './../Sidebar';
import service              from './../../services/service';


export class SiteConfSidebar extends React.Component {

    render(){
        return <Route render={({history})=>{ return this.renderWithRoute(history) }} />
    }

    renderWithRoute(history: {push:(path: string)=>void}){

      let encodedSiteKey = this.props.siteKey;
      let encodedWorkspaceKey = this.props.workspaceKey;
      let basePath = `/siteconf/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}`;

      let menu: SidebarMenu = {
        title: 'Site Configuration',
        items: [
          {
            active: true,
            label: "General",
            onClick: ()=>{
              service.api.logToConsole(`${basePath}/general/`);
              history.push(`${basePath}/general/`)
            }
          },
          /*
          {
            active: true,
            label: "Danger",
            onClick: ()=>{
              service.api.logToConsole(`${basePath}/danger/`);
              history.push(`${basePath}/danger/`)
            }
          }
          */
        ]
      }

      return <Sidebar {...this.props} menus={[menu]} />
    }
}
