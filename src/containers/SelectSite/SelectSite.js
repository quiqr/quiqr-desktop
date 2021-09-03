import { Route } from 'react-router-dom';
import React from 'react';
import service from './../../services/service';
import { snackMessageService } from './../../services/ui-service';
import {List, ListItem} from 'material-ui-02/List';
import Subheader from 'material-ui-02/Subheader';
import IconAdd from 'material-ui-02/svg-icons/content/add';
import muiThemeable from 'material-ui-02/styles/muiThemeable';
import { Wrapper, MessageBlock } from './components/shared';
import CreateSiteDialog from './components/CreateSiteDialog';
import BlockDialog from './components/BlockDialog';
import Spinner from './../../components/Spinner';

import type { EmptyConfigurations, Configurations, SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../../types';

const styles = {
  container:{
    display:'flex',
    height: '100%'
  },
  sitesCol: {
    flex: '0 0 100%',
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
    borderTop: 'solid 1px #ccc',
    padding: '0 20px ',
    fontSize: '80%'
  }
}

type SelectSiteProps = {
  muiTheme : any,
  siteKey : string,
  workspaceKey : string
}

type SelectSiteState = {
  configurations?: Configurations | EmptyConfigurations,
  selectedSite?: SiteConfig,
  selectedSiteWorkspaces?: Array<any>,
  selectedWorkspace?: WorkspaceHeader,
  selectedWorkspaceDetails?: WorkspaceConfig,
  createSiteDialog: bool,
  publishSiteDialog?: { workspace: WorkspaceConfig, workspaceHeader: WorkspaceHeader, open: bool },
  blockingOperation: ?string //this should be moved to a UI service
}

class SelectSite extends React.Component<SelectSiteProps, SelectSiteState>{

  constructor(props){
    super(props);
    this.state = {
      blockingOperation: null,
      currentSiteKey: null,
      createSiteDialog: false,
      publishSiteDialog: undefined,
      siteCreatorMessage: null,
      sitesListingView: 'all'
    };
  }

  componentWillMount(){

    service.getConfigurations(true).then((c)=>{
      var stateUpdate  = {};
      stateUpdate.configurations = c;
      this.setState(stateUpdate);
    });

    service.api.getPogoConfKey('sitesListingView').then((view)=>{
      this.setState({sitesListingView: view });
    });
  }

  mountSite(site : SiteConfig ){

    this.setState({selectedSite: site, selectedSiteWorkspaces:[]});
    this.setState({currentSiteKey: site.key});

    //load all site configuration to enforce validation

    service.api.listWorkspaces(site.key).then((workspaces)=>{

      this.setState({selectedSiteWorkspaces: workspaces});
      if(workspaces.length === 1){
        this.selectWorkspace(site.key, workspaces[0]);
      }
    });
  }

  handleSelectWorkspaceClick = (e, siteKey, workspace)=> {
    e.stopPropagation();
    this.selectWorkspace(siteKey, workspace);
  };

  async selectWorkspace(siteKey: string, workspace : WorkspaceHeader ){

    this.setState({currentWorkspaceKey: workspace.key});

    let select = true;
    if(select){
      await service.api.mountWorkspace(siteKey, workspace.key);
      this.history.push(`/sites/${decodeURIComponent(siteKey)}/workspaces/${decodeURIComponent(workspace.key)}/home/init`);
    }
    else{
      this.history.push(`/`);
    }
  }

  handleAddSiteClick(){
    this.setState({createSiteDialog: true});
  }

  handleCreateSiteSubmit = (data)=>{
    this.setState({createSiteDialog:false, blockingOperation:'Creating site...'})

    service.api.createSite(data).then(()=>{
      return service.getConfigurations(true);
    }).then(configurations=>{
      this.setState({configurations});
    }).catch((e)=>{
      alert('Failed to create site');
    }).then(()=>{
      this.setState({ blockingOperation:null})
    });
  }

  handlePublishSiteCancelClick = () => {
    service.api.parentTempUnHideMobilePreview();
    this.setState({publishSiteDialog: {...this.state.publishSiteDialog, open:false}});
  }

  handleBuildAndPublishClick = ({siteKey, workspaceKey, build, publish}) => {
    service.api.parentTempUnHideMobilePreview();
    this.setState({blockingOperation: 'Building site...', publishSiteDialog: undefined});
    service.api.buildWorkspace(siteKey, workspaceKey, build).then(()=>{
      this.setState({blockingOperation: 'Publishing site...'});
      return service.api.publishSite(siteKey, publish);
    }).then(()=>{
      snackMessageService.addSnackMessage('Site successfully published.');
    }).catch(()=>{
      snackMessageService.addSnackMessage('Publish failed.');
    }).then(()=>{
      this.setState({blockingOperation: null});
    })
  }

  renderSelectSites(){
    //let { siteKey } = this.props;
    let { selectedSite, configurations } = this.state;

    let _configurations = ((configurations: any): Configurations);
    let sites = _configurations.sites || [];
    if(configurations==null){
      return <Spinner />
    }

    let listTitle = 'All Sites';

    if(this.state.sitesListingView === 'mylocal'){
      listTitle = 'My sites';
      sites = sites.filter((site) => {
        return site.owner === this.props.poppygoUsername
      });
    }

    else if(this.state.sitesListingView === 'myremote'){
      listTitle = 'Available remote sites';


      sites = sites.filter((site) => {
        return site.remoteonly === true
      });
    }
    else if(this.state.sitesListingView === 'unpublished'){
      listTitle = 'Unpublished sites';
      sites = sites.filter((site) => {
        return site.published === 'no'
      });
    }

    sites.sort(function(a, b){
      var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
      if (nameA < nameB) //sort string ascending
        return -1
      if (nameA > nameB)
        return 1
      return 0 //default return value (no sorting)
    })

    return (
      <div style={ styles.sitesCol }>
        <List>
          <Subheader>{listTitle}</Subheader>
          { (sites).map((site, index)=>{
            let selected = site===selectedSite;
            let owner = 'user: unknown';
            if(site.published === 'no' ){
              owner = "unpublished";
            }
            else{
              owner = 'user: unknown';
              if(site.owner !== '' ){
                owner = "user: " + site.owner;
              }
            }

            return (<ListItem
            id={"siteselectable-"+site.name}
            key={index}
            style={selected? styles.siteActiveStyle : styles.siteInactiveStyle }
            onClick={ ()=>{ this.mountSite(site) } }
            primaryText={ site.name }
            secondaryText={ owner } />);
          })}

            <ListItem
            key="add-site"
            style={ styles.siteInactiveStyle }
            rightIcon={<IconAdd />}
            onClick={ this.handleAddSiteClick.bind(this) }
            primaryText="New" />
          </List>
          </div>
    );

  }

  render(){

    //let { siteKey } = this.props;
    let { configurations, createSiteDialog } = this.state;

    //let _configurations = ((configurations: any): Configurations);

    if(configurations==null){
      return <Spinner />
    }

    return (
      <Route render={({history})=>{

        this.history = history;
        return (

          <div style={ styles.container }>

            {this.renderSelectSites()}

            <div style={styles.selectedSiteCol}>
              <Wrapper title="">
                <MessageBlock></MessageBlock>
              </Wrapper>
            </div>
            <CreateSiteDialog
            open={createSiteDialog}
            onCancelClick={()=>this.setState({createSiteDialog:false})}
            onSubmitClick={this.handleCreateSiteSubmit}
          />

            {/*this should be moved to a UI service*/}
            <BlockDialog open={this.state.blockingOperation!=null}>{this.state.blockingOperation}<span> </span></BlockDialog>
          </div>
        );
      }}
        />
    );
  }

}

export default muiThemeable()(SelectSite);
