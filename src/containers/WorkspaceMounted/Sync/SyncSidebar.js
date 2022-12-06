import * as React from 'react';
import { Route }  from 'react-router-dom';
import Sidebar    from './../../Sidebar';
//import service    from './../../../services/service';
import AddIcon    from '@material-ui/icons/Add';
import IconQuiqr  from '../../../svg-assets/IconQuiqr';
import IconGitHub from '../../../svg-assets/IconGitHub';
import FolderIcon from '@material-ui/icons/Folder';

export class SyncSidebar extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      site: {
        publish: [],
      },
      selectedMenuItem: ''
    }
  }


  componentDidUpdate(preProps){
    if(preProps.site !== this.props.site){
      this.initState();
    }
  }

  componentDidMount(){
    this.initState();
  }

  initState(){
    if(this.props.site){
      this.setState({
        site: this.props.site
      });
    }
  }

  render(){
    return <Route render={({history})=>{ return this.renderWithRoute(history) }} />
  }

  renderWithRoute(history: {push:(path: string)=>void}){
    let {site} = this.state;

    let encodedSiteKey = this.props.siteKey;
    let encodedWorkspaceKey = this.props.workspaceKey;
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}/sync`;

    let targets = [];
    site.publish.forEach((publ)=>{

      let label, icon
      if(publ.config && publ.config.type === "quiqr" ){
        label = publ.config.path;
        icon = <IconQuiqr/>
      }
      else if(publ.config && publ.config.type === "github" ){
        if(publ.config.title && publ.config.title !== ''){
          label = publ.config.title;
        }
        else{
          label = publ.config.username+"/"+publ.config.repository;
        }

        icon = <IconGitHub/>
      }
      else if(publ.config && publ.config.type === "folder" ){
        label = publ.config.path;
        icon = <FolderIcon/>
      }

      label = (label.length >  20 ? `${label.substring(0, 20)}...` : label);
      if(label){
        targets.push({
          active: true,
          icon: icon,
          label: label,
          selected: (this.state.selectedMenuItem===publ.key ? true : false),
          onClick: ()=>{
            this.setState({selectedMenuItem:publ.key});
            history.push(`${basePath}/list/${publ.key}/`)
          }
        });
      }
    })

    let menus = [{
        title: 'Sync Targets',
        items: targets
      },
      {
        title: '',
        items: [
          {
            spacer: true,
          },
          {
            icon: <AddIcon />,
            label: "ADD SYNC TARGET",
            onClick: ()=>{
              this.setState({selectedMenuItem:'general'});
              history.push(`${basePath}/add/x${Math.random()}`)
            }
          }
        ]

      }
    ]

    return <Sidebar {...this.props} menus={menus} />
  }
}
