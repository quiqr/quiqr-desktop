import React                   from 'react';
import { Switch, Route }       from 'react-router-dom'
import List                    from '@material-ui/core/List';
import ListSubheader           from '@material-ui/core/ListSubheader';
import ListItem                from '@material-ui/core/ListItem';
import ListItemText            from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton              from '@material-ui/core/IconButton';
import Menu                    from '@material-ui/core/Menu';
import MenuItem                from '@material-ui/core/MenuItem';
import MoreVertIcon            from '@material-ui/icons/MoreVert';
import service                 from './../../services/service';
import { snackMessageService } from './../../services/ui-service';
import CreateSiteDialog        from './components/CreateSiteDialog';
import BlockDialog             from './../../components/BlockDialog';
import RemoteSiteDialog        from './components/RemoteSiteDialog';

import Spinner                   from './../../components/Spinner';

export class SiteLibraryRouted extends React.Component{

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
      sitesListingView: ''
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

    service.api.readConfPrefKey('sitesListingView').then((view)=>{
      this.setState({sitesListingView: view });
    });
  }

  mountSite(site ){
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

  async selectWorkspace(siteKey: string, workspace ){
    this.setState({currentWorkspaceKey: workspace.key});
    await service.api.mountWorkspace(siteKey, workspace.key);
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

  renderItemMenu(index){

    return (
    <div>
      <IconButton
        onClick={(event)=>{
          this.setState({anchorEl:event.currentTarget, menuOpen:index})
          service.api.logToConsole('open');
        }}
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={this.state.anchorEl}
        open={(this.state.menuOpen===index?true:false)}
        keepMounted
        onClose={()=>{
          this.setState({menuOpen:null});
          service.api.logToConsole("jojo");

        }}
      >
        <MenuItem key="rename">
          Rename
        </MenuItem>

        <MenuItem key="tags">
          Edit Tags
        </MenuItem>
      </Menu>
    </div>
  );}

  renderSelectSites(source, sourceArgument){
    let { selectedSite, configurations } = this.state;

    let listingSource
    if(source === 'last'){
      listingSource = this.state.sitesListingView;
      if(listingSource.includes("local-tags-")){
        sourceArgument = listingSource.split("tags-")[1];
        listingSource = "tags";
      }
    }
    else{
      listingSource = source;
    }

    let _configurations = configurations;
    let sites = _configurations.sites || [];
    if(configurations==null){
      return <Spinner />
    }
    if(this.state.showSpinner){
      return <Spinner />
    }

    let listTitle = 'All Sites';

    if(listingSource === 'quiqr-cloud' || (listingSource ==='last' && this.state.sitesListingView === 'quiqr-cloud')){
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
      listTitle = 'Sites in tag: '+ sourceArgument;
      sites = sites.filter((site) => {
        return (site.tags && site.tags.includes(sourceArgument))
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
        <List
          style={{padding: 0}}
          subheader={
            <ListSubheader component="div" id="nested-list-subheader">
              { listTitle }
            </ListSubheader>
          }>

          { (sites).map((site, index)=>{
            let selected = site===selectedSite;

            return (

              <ListItem
                id={"siteselectable-"+site.name}
                key={index}
                selected={selected}
                onClick={ ()=>{
                  if(site.remote){
                    this.setState({remoteSiteDialog:true});
                    this.setState({currentRemoteSite:site.name})
                  }
                  else{
                    this.mountSite(site)
                  }
                }}

                button >
                <ListItemText primary={site.name} />
            <ListItemSecondaryAction>
                {this.renderItemMenu(index)}
            </ListItemSecondaryAction>

              </ListItem>

            );
          })}

        </List>
    );

  }

  renderDialogs(){
    let { configurations, createSiteDialog, remoteSiteDialog } = this.state;

    return (
      <div>

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
            return (
              this.renderSelectSites(source, null)
            );
          }}
          />

          <Route path='/sites/:source/:args' exact render={ ({match, history})=> {
            this.history = history;
            let source = decodeURIComponent(match.params.source)
            let sourceArgument = decodeURIComponent(match.params.args)
            return (
                this.renderSelectSites(source, sourceArgument)
            );
          }}
          />

          <Route path='/sites' render={ ({match, history})=> {
            this.history = history;
            return (
              this.renderSelectSites("last",null)
            );
          }}
          />

        </Switch>
        {this.renderDialogs()}
      </React.Fragment>
    );
  }
}

export default SiteLibraryRouted;
