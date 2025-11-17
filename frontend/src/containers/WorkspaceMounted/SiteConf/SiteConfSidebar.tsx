import * as React           from 'react';
import { Route }            from 'react-router-dom';
import Sidebar              from './../../Sidebar';
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

  renderWithRoute(history){

    let encodedSiteKey = this.props.siteKey;
    let encodedWorkspaceKey = this.props.workspaceKey;
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}/siteconf`;

    let menus = [
      {
        title: 'Site Information',
        items: [
          {
            active: true,
            label: "Mount Information ",
            selected: (this.state.selectedMenuItem==='general' ? true : false),
            onClick: ()=>{
              this.setState({selectedMenuItem:'general'});
              history.push(`${basePath}/general/`)
            }
          },
          {
            active: true,
            label: "Etalage",
            selected: (this.state.selectedMenuItem==='etalage' ? true : false),
            onClick: ()=>{
              this.setState({selectedMenuItem:'etalage'});
              history.push(`${basePath}/etalage/`)
            }
          },
          {
            active: true,
            label: "Site Readme",
            selected: (this.state.selectedMenuItem==='sitereadme' ? true : false),
            onClick: ()=>{
              this.setState({selectedMenuItem:'sitereadme'});
              history.push(`${basePath}/sitereadme/`)
            }
          },
          {
            active: true,
            label: "Project Readme",
            selected: (this.state.selectedMenuItem==='projectreadme' ? true : false),
            onClick: ()=>{
              this.setState({selectedMenuItem:'projectreadme'});
              history.push(`${basePath}/projectreadme/`)
            }
          },
        ]
      },
      {
        title: 'Preview Check Settings',
        items: [
          {
            active: true,
            label: "Preview Check Settings",
            selected: (this.state.selectedMenuItem==='previewchecksettings' ? true : false),
            onClick: ()=>{
              this.setState({selectedMenuItem:'previewchecksettings'});
              history.push(`${basePath}/previewchecksettings/`)
            }
          },
        ]
      },
      {
        title: 'CMS',
        items: [
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
      },
    ]

    return <Sidebar {...this.props} menus={menus} />
  }
}
