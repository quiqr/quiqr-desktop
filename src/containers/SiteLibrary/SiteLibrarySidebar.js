import * as React           from 'react';
import { Route }            from 'react-router-dom';
import { Sidebar }          from './../Sidebar';
import type { SidebarMenu } from './../Sidebar';
//import service              from './../../services/service';


export class SiteLibrarySidebar extends React.Component {

    render(){
        return <Route render={({history})=>{ return this.renderWithRoute(history) }} />
    }

    renderWithRoute(history: {push:(path: string)=>void}){

      let encodedSiteKey = this.props.siteKey;
      let encodedWorkspaceKey = this.props.workspaceKey;
      let basePath = `/sites/all`;

      let menus = [
        {
          title: 'On this computer',
          items: [
            {
              active: true,
              label: "All",
              onClick: ()=>{
                history.push(`${basePath}`)
              }
            },
          ]
        },
        {
          title: 'In my cloud',
          items: [
            {
              active: true,
              label: "Quiqr Cloud",
              onClick: ()=>{
                history.push(`${basePath}/quiqr-cloud`)
              }
            },
          ]
        },
      ]

      return <Sidebar {...this.props} menus={menus} />
    }
}
