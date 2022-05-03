import { Route }               from 'react-router-dom';
import React                   from 'react';
import service                 from './../../../services/service';
import muiThemeable            from 'material-ui-02/styles/muiThemeable';
import Spinner                 from './../../../components/Spinner';
import MarkdownIt              from 'markdown-it'

import type { EmptyConfigurations, Configurations, SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../../types';

const md = new MarkdownIt({html:true});

const styles = {
  container:{
    display:'flex',
    height: '100%'
  },
  sitesCol: {
    flex: '0 0 280px',
    overflowY:'auto',
    overflowX:'hidden',
    userSelect:'none',
    borderRight: 'solid 1px #e0e0e0',
    background:'#fafafa'
  },
  selectedSiteCol: {
    flex: 'auto',
    overflow: 'auto'
  },
  siteActiveStyle: {
    fontWeight: 'bold',
    backgroundColor: 'white',
    borderBottom: 'solid 1px #e0e0e0',
    borderTop: 'solid 1px #e0e0e0',
    position: 'relative'
  },
  siteInactiveStyle: {
    borderBottom: 'solid 1px transparent',
    borderTop: 'solid 1px transparent'
  },
  creatorMessage: {
    borderBottom: 'solid 1px transparent',
    padding: '0 20px ',
    fontSize: '80%'
  }
}

type HomeProps = {
  muiTheme : any,
  siteKey : string,
  workspaceKey : string
}

type HomeState = {
  configurations?: Configurations | EmptyConfigurations,
  selectedSite?: SiteConfig,
  selectedSiteWorkspaces?: Array<any>,
  selectedWorkspace?: WorkspaceHeader,
  selectedWorkspaceDetails?: WorkspaceConfig,
  publishSiteDialog?: { workspace: WorkspaceConfig, workspaceHeader: WorkspaceHeader, open: bool },
  registerDialog?: { open: bool },
  claimDomainDialog?: { open: bool },
  blockingOperation: ?string //this should be moved to a UI service
}

class Home extends React.Component<HomeProps, HomeState>{

  history: any;

  constructor(props){
    super(props);
    this.state = {
      blockingOperation: null,
      currentSiteKey: null,
      buttonPressed: "",
      siteCreatorMessage: null
    };
  }

  componentDidUpdate(preProps: HomeProps){
    if(this._ismounted && preProps.siteKey !== this.props.siteKey){
      this.checkSiteInProps();
    }

  }

  componentDidMount(){
    this.checkSiteInProps();
    this._ismounted = true;
  }


  checkSiteInProps(){

    var { siteKey, workspaceKey } = this.props;

    if(siteKey && workspaceKey){

      if(this.state.currentSiteKey !== siteKey){
        service.api.readConfKey('devDisableAutoHugoServe').then((devDisableAutoHugoServe)=>{
          if(!devDisableAutoHugoServe){
            service.api.serveWorkspace(siteKey, workspaceKey, "Start Hugo from Home");
          }
        });
      }

      this.setState({currentSiteKey: siteKey});
      this.setState({currentWorkspaceKey: workspaceKey});

      service.getSiteCreatorMessage(siteKey, workspaceKey).then((message)=>{
        let siteCreatorMessage = md.render(message);
        this.setState({siteCreatorMessage:siteCreatorMessage});
      });

      service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle)=>{
        var stateUpdate  = {};
        stateUpdate.configurations = bundle.configurations;
        stateUpdate.selectedSite = bundle.site;

        stateUpdate.selectedSiteWorkspaces = bundle.siteWorkspaces;
        stateUpdate.selectedWorkspace = bundle.workspace;
        stateUpdate.selectedWorkspaceDetails = bundle.workspaceDetails;

        this.setState(stateUpdate);
      }).catch(e=>{
        this.setState({site: null, workspace: null, error: e});
      });
    }
    else{
      service.getConfigurations(true).then((c)=>{
        var stateUpdate  = {};
        stateUpdate.configurations = c;
        this.setState(stateUpdate);
      })
    }
  }


  render(){

    let { configurations } = this.state;

    if(this.state.error){
      return null

    }
    else if( this.state.showSpinner || configurations == null || this.state.selectedSite == null ){
      return <Spinner />
    }

    return (
      <Route render={({history}) => {
        this.history = history;

        return (
          <div style={ styles.container }>

            <div className="markdown" style={ styles.creatorMessage } dangerouslySetInnerHTML={{__html:this.state.siteCreatorMessage}} />



          </div>
        )
      }}/>

    );
  }

}

export default muiThemeable()(Home);
