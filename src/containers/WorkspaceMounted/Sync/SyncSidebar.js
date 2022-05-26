import * as React from 'react';
import { Route }  from 'react-router-dom';
import Sidebar    from './../../Sidebar';
import service    from './../../../services/service';

export class SyncSidebar extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      publish: [],
      selectedMenuItem: 'general'
    }
  }

  render(){
    return <Route render={({history})=>{ return this.renderWithRoute(history) }} />
  }

  componentDidUpdate(preProps: HomeProps){
    if(this._ismounted && preProps.publish !== this.props.publish){
      if(this.props.site && this.props.site.publish){
        this.setState({publish: this.props.site.publish});
      }
    }
  }

  componentDidMount(){
    this._ismounted = true;
    if(this.props.site && this.props.site.publish){
      this.setState({publish: this.props.site.publish});
    }
  }

  handleClick(path){
    this.history.push(`${path}`)
  }

  renderWithRoute(history: {push:(path: string)=>void}){
    this.history = history;

    let encodedSiteKey = this.props.siteKey;
    let encodedWorkspaceKey = this.props.workspaceKey;
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}/sync`;

    let targets = [];
    this.state.publish.forEach((publ)=>{

      //service.api.logToConsole(publ);
      let label
      if(publ.config && publ.config.type === "quiqr" ){
        label = "Q: " + publ.config.path;
      }
      else{
        label = "someconf"
      }
      targets.push({
        active: true,
        label: label,
        selected: (this.state.selectedMenuItem==='general' ? true : false),
        onClick: ()=>{
          this.setState({selectedMenuItem:'general'});
          this.handleClick(`${basePath}/${publ.key}/`)
        }
      });
    })

    let menus = [{
      title: 'Sync Targets',
      items: targets,
    },
      {
        title: '. ',
        items: [
          {
            label: "ADD SYNC SERVER"
          }
        ]

      }
    ]

    return <Sidebar {...this.props} menus={menus} />
  }
}
