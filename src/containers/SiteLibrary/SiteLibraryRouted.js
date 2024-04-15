import React                        from 'react';
import Typography                   from '@material-ui/core/Typography';
import { Switch, Route }            from 'react-router-dom'
import Box                          from '@material-ui/core/Box';
import List                         from '@material-ui/core/List';
import ListSubheader                from '@material-ui/core/ListSubheader';
import Grid                         from '@material-ui/core/Grid';
import Menu                         from '@material-ui/core/Menu';
import MenuItem                     from '@material-ui/core/MenuItem';
import IconButton                   from '@material-ui/core/IconButton';
import MoreVertIcon                 from '@material-ui/icons/MoreVert';
import NewSlashImportSiteDialog     from './dialogs/NewSlashImportSiteDialog';
import EditSiteTagsDialogs          from './dialogs/EditSiteTagsDialogs';
import RenameSiteDialog             from './dialogs/RenameSiteDialog';
import CopySiteDialog               from './dialogs/CopySiteDialog';
import DeleteSiteDialog             from './dialogs/DeleteSiteDialog';
import SiteListItem                 from './components/SiteListItem';
import CardItem                     from './components/CardItem';
import BlockDialog                  from './../../components/BlockDialog';
import Spinner                      from './../../components/Spinner';
import service                      from './../../services/service';
import { withStyles }               from '@material-ui/core/styles';

const net = window.require('electron').remote.net;

const useStyles = theme => ({
});

class SiteLibraryRouted extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      blockingOperation: null,
      currentSiteKey: null,
      showSpinner: false,
      configurations: [],
      editTagsDialog: false,
      renameDialog: false,
      copyDialog: false,
      deleteDialog: false,
      dialogSiteConf: {},
      dialogNewSlashImportSite: {
        open: false,
        newOrImport: 'new'
      },
      publishSiteDialog: undefined,
      siteCreatorMessage: null,
      quiqrCommunityTemplates: [],
      sitesListingView: ''
    };
  }

  componentDidMount(){

    this.updateLocalSites();
    this.updateCommunityTemplates();

    service.api.stopHugoServer();

    window.require('electron').ipcRenderer.on('frontEndBusy', ()=>{
      this.setState({showSpinner: true});
    });


    service.api.readConfPrefKey('sitesListingView').then((view)=>{
      this.setState({sitesListingView: view });
    });

  }

  updateCommunityTemplates(){

    const url = "https://quiqr.github.io/quiqr-community-templates/templates.json";
    let request = net.request(url);

    let data='';

    request.on('error', (err) => {
      this.setState({quiqrCommunityTemplatesError:"Can't download templates. Your computer might be offline."});
    });

    request.on('response', (response) => {
      response.on('error', (error) => {
        this.setState({quiqrCommunityTemplatesError:"Can't download templates. Server might have problems."});
      })

      response.on('end', () => {
        this.setState({
          quiqrCommunityTemplatesError: null,
          quiqrCommunityTemplates:JSON.parse(data)});
      });
      response.on("close", () => {
      });
      response.on("data", chunk => {
        data += chunk;
      });
    })
    request.end()
  }

  updateLocalSites(){
    let localsites = [];
    service.getConfigurations(true).then((c)=>{

      c.sites.forEach((site) =>{
        localsites.push(site.name);
      });

      this.setState({
        localsites :localsites
      });

      var stateUpdate  = {};
      stateUpdate.configurations = c;


      this.setState(stateUpdate);
    });

  }

  componentWillUpdate(nextProps, nextState) {

    if(this.props.newSite !== nextProps.newSite){
      this.setState({
        dialogNewSlashImportSite: {
          open: nextProps.newSite,
          newOrImport: 'new',
        }
      });
    }

    if(this.props.importSite !== nextProps.importSite){
      this.setState({
        dialogNewSlashImportSite: {
          open: nextProps.importSite,
          newOrImport: 'import',
        }
      });
    }

    if(nextProps.importSiteURL && this.props.importSiteURL !== nextProps.importSiteURL){
      this.setState({
        importSiteURL: nextProps.importSiteURL
      });
    }

  }

  mountSiteByKey(siteKey){
    service.getConfigurations(true).then((c)=>{
      let site = c.sites.find((x)=>x.key===siteKey);
      this.mountSite(site);
    });
  }

  mountSite(site){
    this.setState({selectedSite: site, selectedSiteWorkspaces:[]});
    this.setState({currentSiteKey: site.key});

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

  renderItemMenuButton(index, siteconfig){
    return (
      <IconButton
        onClick={(event)=>{
          this.setState({anchorEl:event.currentTarget, menuOpen:index})
        }}
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
      >
        <MoreVertIcon />
      </IconButton>
    );
  }

  renderItemMenuItems(index, siteconfig){

    if(siteconfig.template){
      return (
        <Menu
          anchorEl={this.state.anchorEl}
          open={(this.state.menuOpen===index?true:false)}
          keepMounted
          onClose={()=>{
            this.setState({menuOpen:null});
          }}
        >
          <MenuItem key="import"
            onClick={
              ()=>{
                this.setState({menuOpen:null});
                this.handleSiteClick(siteconfig);
              }
            }>
            Import
          </MenuItem>

          <MenuItem key="visit"
            onClick={
              ()=>{
                this.setState({menuOpen:null});
                window.require('electron').shell.openExternal(siteconfig.homepageURL);
              }
            }>
            Open Homepage
          </MenuItem>

        </Menu>
      );

    }
    else{


      return (
        <Menu
          anchorEl={this.state.anchorEl}
          open={(this.state.menuOpen===index?true:false)}
          keepMounted
          onClose={()=>{
            this.setState({menuOpen:null});

          }}
        >
          <MenuItem key="rename"
            onClick={
              ()=>{
                this.setState({renameDialog: true, menuOpen:null, dialogSiteConf: siteconfig})
              }
            }>
            Rename
          </MenuItem>

          <MenuItem key="copy"
            onClick={
              ()=>{
                this.setState({copyDialog: true, menuOpen:null, dialogSiteConf: siteconfig})
              }
            }>
            Copy
          </MenuItem>

          <MenuItem key="tags"
            onClick={
              ()=>{
                this.setState({editTagsDialog: true, menuOpen:null, dialogSiteConf: siteconfig})
              }
            }>
            Edit Tags
          </MenuItem>

          <MenuItem key="delete"
            onClick={
              ()=>{
                this.setState({deleteDialog: true, menuOpen:null, dialogSiteConf: siteconfig})
              }
            }>
            Delete
          </MenuItem>

        </Menu>
      );
    }
  }

  renderSelectSites(source, sourceArgument){

    if(this.state.showSpinner){
      return <Spinner />
    }

    let listingSource
    let listTitle = '';
    let sites = [];

    if(source === 'last'){

      listingSource = this.state.sitesListingView;
      if(listingSource && listingSource.includes("local-tags-")){
        sourceArgument = listingSource.split("tags-")[1];
        listingSource = "tags";
      }

    }
    else{
      listingSource = source;
    }

    if(listingSource === 'quiqr-community-templates' || (listingSource ==='last' && this.state.sitesListingView === 'templates-quiqr-community')){
      listTitle = 'Quiqr Community Templates';

      sites = [];
      this.state.quiqrCommunityTemplates.forEach((template)=>{

        let screenshotURL = null;
        if(template.ScreenshotImageType){
          screenshotURL = "https://quiqr.github.io/quiqr-community-templates/templates/"+template.NormalizedName+"/screenshot."+template.ScreenshotImageType;
        }

        sites.push({
          key: "template-"+template.QuiqrEtalageName,
          name: template.QuiqrEtalageName,
          screenshotURL: screenshotURL,
          homepageURL: template.QuiqrEtalageHomepage,
          importSiteURL: template.SourceLink.trim(),
          template: true,
        })
      });

    }
    else if (listingSource === 'tags'){
      listTitle = 'Sites in tag: '+ sourceArgument;
      sites = this.state.configurations.sites.filter((site) => {
        return (site.tags && site.tags.includes(sourceArgument))
      });
    }
    else{
      listTitle = 'All sites on this computer';
      //let _configurations = configurations;
      sites = this.state.configurations.sites || [];
      if(this.state.configurations==null){
        return <Spinner />
      }
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
      (this.props.activeLibraryView === "cards" ? this.renderCards(sites, listTitle) : this.renderList(sites, listTitle))

    );

  }

  renderCards(sites, listTitle){
    return (

      <Box m={3}>
        <Box my={3}>
          <Typography variant="h6" >{listTitle}</Typography>
        </Box>

        {this.state.quiqrCommunityTemplatesError}
        <Grid container spacing={3} >
          {sites.map((site, index)=>{

            return (
              <Grid
                key={"siteCardA"+index}
                item
              >
                <CardItem
                  siteClick={()=>{
                    this.handleSiteClick(site);
                  }}
            site={site}
            itemMenuButton={this.renderItemMenuButton(index, site)}
            itemMenuItems={this.renderItemMenuItems(index, site)}
              />
              </Grid>
          )
          })}
      </Grid>
      </Box>

    );
          }
  handleSiteClick(site){
    if(site.template){
      this.setState({
        dialogNewSlashImportSite: {
          open: true,
          newOrImport: 'import',
        },
        importSiteURL: site.importSiteURL
      });

    }
    else{
      this.mountSite(site)
    }
  }

  renderList(sites, listTitle){
    return (

      <List
        style={{padding: 0}}
        subheader={
          <ListSubheader component="div" id="nested-list-subheader">
            { listTitle }
          </ListSubheader>
        }>

      { (sites).map((site, index)=>{
        return (

          <SiteListItem
          key={"sitelistitem"+index}

          siteClick={()=>{
            this.handleSiteClick(site);
          }}
          site={site}
          itemMenuButton={this.renderItemMenuButton(index, site)}
            itemMenuItems={ this.renderItemMenuItems(index, site)}
          />

        );
      })}

      </List>
    )

  }

  renderDialogs(){

    return (
      <div>

      <DeleteSiteDialog
      open={this.state.deleteDialog}
            siteconf={this.state.dialogSiteConf}
            onCancelClick={()=>this.setState({deleteDialog:false})}
            onDelete={(siteKey)=>{
              this.setState({deleteDialog:false});
              service.api.deleteSite(siteKey);
              this.updateLocalSites();
            }}
        />

        <RenameSiteDialog
          open={this.state.renameDialog}
          localsites={this.state.localsites}
          siteconf={this.state.dialogSiteConf}
          onCancelClick={()=>this.setState({renameDialog:false})}
          onSavedClick={()=>{
            this.setState({renameDialog:false});
            this.updateLocalSites();
          }}
        />

        <CopySiteDialog
          open={this.state.copyDialog}
          localsites={this.state.localsites}
          siteconf={this.state.dialogSiteConf}
          onCancelClick={()=>this.setState({copyDialog:false})}
          onSavedClick={()=>{
            this.setState({copyDialog:false});
            this.updateLocalSites();
          }}
        />
        <EditSiteTagsDialogs
          open={this.state.editTagsDialog}
          siteconf={this.state.dialogSiteConf}
          onCancelClick={()=>this.setState({editTagsDialog:false})}
          onSavedClick={()=>{
            this.setState({editTagsDialog:false});
            service.api.redirectTo("/sites/last", true);
          }}
        />

        <NewSlashImportSiteDialog
          open={this.state.dialogNewSlashImportSite.open}
          onClose={
            ()=> {
              this.setState({
                importSiteURL: null,
                dialogNewSlashImportSite:{open:false}
              });
              this.updateLocalSites();
            }
          }
          newOrImport={this.state.dialogNewSlashImportSite.newOrImport}
          importSiteURL={this.state.importSiteURL}
          mountSite={(siteKey)=>{
            this.mountSiteByKey(siteKey);
          }}
        />

        <BlockDialog open={this.state.blockingOperation!=null}>{this.state.blockingOperation}</BlockDialog>
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

          <Route path='/sites/import-site-url/:url' exact render={ ({match, history})=> {
            this.history = history;
            let url = decodeURIComponent(match.params.refresh)
            return (
              this.renderSelectSites(url, null)
            );
          }}
          />
          <Route path='/sites/import-site/:refresh' exact render={ ({match, history})=> {
            this.history = history;
            let refresh = decodeURIComponent(match.params.refresh)
            return (
              this.renderSelectSites(refresh, null)
            );
          }}
          />
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

          <Route path='/' render={ ({match, history})=> {
            this.history = history;
            return (
              this.renderSelectSites("last",null)
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

export default withStyles(useStyles)(SiteLibraryRouted);
