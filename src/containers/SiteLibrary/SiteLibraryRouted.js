import React                     from 'react';
import { Switch, Route }         from 'react-router-dom'

import {List, ListItem}          from 'material-ui-02/List';
import Subheader                 from 'material-ui-02/Subheader';
import IconAdd                   from 'material-ui-02/svg-icons/content/add';
import muiThemeable              from 'material-ui-02/styles/muiThemeable';

import service                   from './../../services/service';
import { snackMessageService }   from './../../services/ui-service';

import { Wrapper, MessageBlock } from './components/shared';
import CreateSiteDialog          from './components/CreateSiteDialog';
import BlockDialog               from './components/BlockDialog';
import RemoteSiteDialog          from './components/RemoteSiteDialog';

import Spinner                   from './../../components/Spinner';

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

export class SiteLibraryRouted extends React.Component<SelectSiteProps, SelectSiteState>{

  constructor(props){
    super(props);
    this.state = {
      blockingOperation: null,
      currentSiteKey: null,
      showSpinner: false,
      remoteSiteDialog: false,
      createSiteDialog: false,
      currentRemoteSite: '',
      publishSiteDialog: undefined,
      siteCreatorMessage: null,
      remoteSitesAsOwner: [],
      remoteSitesAsMember: [],
      sitesListingView: 'local'
    };
  }

  updateRemoteSites(username){
    if(username){
      service.api.getUserRemoteSites(username).then((remote_sites)=>{

        if(remote_sites.sites && remote_sites.sites_with_member_access){
          this.setState({
            remoteSitesAsOwner: remote_sites.sites,
            remoteSitesAsMember: remote_sites.sites_with_member_access
          });
        }
      });
    }
    else{
      this.setState({
        remoteSitesAsOwner: [],
        remoteSitesAsMember: []
      });

    }
  }

  componentWillUpdate(nextProps, nextState) {

    if(this.props.createSite !== nextProps.createSite){
      this.setState({createSiteDialog: nextProps.createSite});
    }

    if(this.props.quiqrUsername !== nextProps.quiqrUsername){
      this.updateRemoteSites(nextProps.quiqrUsername);
    }
  }

  componentWillMount(){
    this.updateRemoteSites(this.props.quiqrUsername);
    window.require('electron').ipcRenderer.on('frontEndBusy', ()=>{
      this.setState({showSpinner: true});
    });

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

  indexTags(){

  }

  handleSelectWorkspaceClick = (e, siteKey, workspace)=> {
    e.stopPropagation();
    this.selectWorkspace(siteKey, workspace);
  };

  async selectWorkspace(siteKey: string, workspace : WorkspaceHeader ){
    //this.setState({currentWorkspaceKey: workspace.key});
    //await service.api.mountWorkspace(siteKey, workspace.key);
    this.history.push(`/sites/${decodeURIComponent(siteKey)}/workspaces/${decodeURIComponent(workspace.key)}/home/init`);
  }

  handleAddSiteClick(){
    this.setState({createSiteDialog: true});
  }

  handleRemoteSiteClick(){
    this.setState({remoteSiteDialog: true});
  }

  handleCreateSiteSubmit = (data)=>{
    let siteKey = data.key;
    this.setState({createSiteDialog:false, blockingOperation:'Creating site...'})

    service.api.createSite(data).then( ()=> {
      service.getConfigurations(true).then((c)=>{
        let site = c.sites.find((x)=>x.key===siteKey);
        this.mountSite(site);
      });

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

  renderSelectSites(source, sourceArgument){
    let { selectedSite, configurations } = this.state;

    let listingSource
    if(source === 'last'){
      listingSource = this.state.sitesListingView;
    }
    else{
      listingSource = source;
    }

    let _configurations = ((configurations: any): Configurations);
    let sites = _configurations.sites || [];
    if(configurations==null){
      return <Spinner />
    }
    if(this.state.showSpinner){
      return <Spinner />
    }

    let listTitle = 'All Sites';
      service.api.logToConsole(listingSource)

    if(listingSource === 'quiqr-cloud'){
      listTitle = `Available remote sites (${this.props.quiqrUsername})`;

      sites = [];
      this.state.remoteSitesAsOwner.forEach((remotesite)=>{
        sites.push({
          name: remotesite,
          owner: this.props.quiqrUsername,
          remote: true
        })
      });
      this.state.remoteSitesAsMember.forEach((remotesite)=>{
        sites.push({
          name: remotesite,
          owner: "?",
          remote: true
        })
      });
    }
    else if (listingSource === 'tags'){
      listTitle = `Available remote sites (${this.props.quiqrUsername})`;
      listTitle = 'Sites in tags: '+ sourceArgument;
      sites = sites.filter((site) => {
       if (site.tags && site.tags.includes(sourceArgument)){
         return true;
       }
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

            return (<ListItem
            id={"siteselectable-"+site.name}
            key={index}
            style={selected? styles.siteActiveStyle : styles.siteInactiveStyle }
            onClick={ ()=>{
              if(site.remote){
                this.setState({remoteSiteDialog:true});
                this.setState({currentRemoteSite:site.name})
              }
              else{
                this.mountSite(site)
              }
            }}
            primaryText={ site.name }
            secondaryText={ "" } />);
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

  renderDialogs(){
    let { configurations, createSiteDialog, remoteSiteDialog } = this.state;

    return (
      <div>

        <div style={styles.selectedSiteCol}>
          <Wrapper title="">
            <MessageBlock></MessageBlock>
          </Wrapper>
        </div>

        <RemoteSiteDialog
          open={remoteSiteDialog}
          configurations={configurations}
          remoteSiteName={this.state.currentRemoteSite}
          onCancelClick={()=>this.setState({remoteSiteDialog:false})}
          mountSite={(siteKey)=>{
            service.getConfigurations(true).then((c)=>{
              let site = c.sites.find((x)=>x.key===siteKey);
              this.mountSite(site);
            });
          }}
        />

        <CreateSiteDialog
          open={createSiteDialog}
          //open={true}
          onCancelClick={()=>this.setState({createSiteDialog:false})}
          onSubmitClick={this.handleCreateSiteSubmit}
        />

        {/*this should be moved to a UI service*/}
        <BlockDialog open={this.state.blockingOperation!=null}>{this.state.blockingOperation}<span> </span></BlockDialog>
      </div>

    )
  }

  render(){

    let { configurations } = this.state;


    if(configurations==null){
      return <Spinner />
    }

    return (
      <React.Fragment>

        <Switch>

          <Route path='/sites/:source' exact render={ ({match, history})=> {
            this.history = history;
            let source = decodeURIComponent(match.params.source)
            //service.api.logToConsole(source, 'source')
            return (
              <div style={ styles.container }>
                {this.renderSelectSites(source, null)}
              </div>
            );
          }}
          />

          <Route path='/sites/:source/:args' exact render={ ({match, history})=> {
            this.history = history;
            let source = decodeURIComponent(match.params.source)
            let sourceArgument = decodeURIComponent(match.params.args)
            //service.api.logToConsole(source, 'source')
            return (
              <div style={ styles.container }>
                {this.renderSelectSites(source, sourceArgument)}
              </div>
            );
          }}
          />

          <Route path='/sites' render={ ({match, history})=> {
            this.history = history;
            return (
              <div style={ styles.container }>
                {this.renderSelectSites("last")}
              </div>
            );
          }}
          />

        </Switch>
        {this.renderDialogs()}
      </React.Fragment>
    );
  }

}

export default muiThemeable()(SiteLibraryRouted);
