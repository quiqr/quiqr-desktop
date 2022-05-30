import React               from 'react';
import { Route }           from 'react-router-dom';
import service             from './../../../services/service';
import Typography          from '@material-ui/core/Typography';
import { withStyles }      from '@material-ui/core/styles';
import MainPublishCard     from './components/MainPublishCard';
import SyncServerDialog    from './components/SyncServerDialog';
import SyncBusyDialog      from './components/SyncBusyDialog';
import FormLogoQuiqrCloud  from './components/quiqr-cloud/FormLogoQuiqrCloud';
import FormLogoGitHubPages from './components/github-pages/FormLogoGitHubPages';
import IconButton          from '@material-ui/core/IconButton';
import MoreVertIcon        from '@material-ui/icons/MoreVert';
import Menu                from '@material-ui/core/Menu';
import MenuItem            from '@material-ui/core/MenuItem';
import Button              from '@material-ui/core/Button';
import Dialog              from '@material-ui/core/Dialog';
import DialogActions       from '@material-ui/core/DialogActions';
import DialogTitle         from '@material-ui/core/DialogTitle';
import DialogContent       from '@material-ui/core/DialogContent';
import { snackMessageService } from './../../../services/ui-service';

const useStyles = theme => ({

  container:{
    padding: '20px',
    height: '100%'
  },

  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },

  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '50ch',
  },

});

class SyncRouteGeneral extends React.Component {

  history: any;

  constructor(props){
    super(props);
    this.state = {
      site : {
        publish: []
      },
      serverDialog: {},
      serverBusyDialog: {},
    };
  }

  componentDidUpdate(preProps){

    if(this.state.addRefresh !== this.props.addRefresh) {
      this.openAddServerDialog();
     }

    if(preProps.site !== this.props.site) {
      this.initState();
    }
  }

  componentDidMount(){
    this.initState();
    this.basePath = `/sites/${this.props.siteKey}/workspaces/${this.props.workspaceKey}/sync`;
  }

  openAddServerDialog(){
     this.setState({
        addRefresh: this.props.addRefresh,
        serverDialog: {
          open:true,
          modAction: "Add",
          serverTitle: "Sync Server",
          closeText: "Cancel"
        }
      })
  }

  initState(){

    if(this.props.site){
      this.setState({
        site: this.props.site
      });
    }
  }

  publishAction(publishConf){
    const build=null;

    this.setState({
      serverBusyDialog: {
        open:true,
        serverType: publishConf.config.type,
      }
    })

    service.api.buildWorkspace(this.props.siteKey, this.props.workspaceKey, build).then(()=>{
      this.setState({blockingOperation: 'Publishing site...'});

      service.api.publishSite(this.props.siteKey, publishConf.key).then(()=>{
        //this.startPublishPolling(true);
      });

    }).then(()=>{

    }).catch(()=>{
      snackMessageService.addSnackMessage('Publish failed.');

    }).then(()=>{
      this.setState({
        serverBusyDialog: {
          open:false,
          serverType: null,
        }
      })
    })
  }

  savePublishData(inkey,data){
    let site= this.state.site;

    if(!inkey){
      inkey = `publ-${Math.random()}`;
    }

    const publConfIndex = site.publish.findIndex( ({ key }) => key === inkey );
    if(publConfIndex !== -1){
      site.publish[publConfIndex] = {key:inkey, config: data};
    }
    else{
      site.publish.push({key:inkey, config: data});
    }

    service.api.saveSiteConf(this.state.site.key, this.state.site).then(()=>{
      this.history.push(`${this.basePath}/list/${inkey}`)
    });
  }

  deletePublishConfiguration(inkey){
    let site= this.state.site;

    const publConfIndex = site.publish.findIndex( ({ key }) => key === inkey );
    if(publConfIndex > -1){
      site.publish.splice(publConfIndex, 1);

      service.api.saveSiteConf(this.state.site.key, this.state.site).then(()=>{
        this.history.push(`${this.basePath}/`)
      });
    }
  }

  renderMainCard(publishConf){

    let serviceLogo, title, liveUrl;

    if(publishConf.config.type === 'quiqr'){
      serviceLogo = <FormLogoQuiqrCloud />
      title = publishConf.config.path;
      liveUrl="https://"+publishConf.config.defaultDomain;
    }
    else if(publishConf.config.type === 'github'){
      serviceLogo = <FormLogoGitHubPages />
      title = publishConf.config.username +"/" + publishConf.config.repository;
      liveUrl= `https://${publishConf.config.username}.github.io/${publishConf.config.repository}`
    }

    return <MainPublishCard
      title={title}
      liveURL={liveUrl}
      serviceLogo={serviceLogo}
      onPublish={()=>{
        //service.api.logToConsole(publishConf, "pupConf");
        this.publishAction(publishConf);
      }}
      itemMenu={
        <div>
          <IconButton
            onClick={(event)=>{
              this.setState({anchorEl:event.currentTarget, menuOpen:publishConf.key})
            }}
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={this.state.anchorEl}
            open={(this.state.menuOpen===publishConf.key?true:false)}
            keepMounted
            onClose={()=>{
              this.setState({menuOpen:null});

            }}
          >
            <MenuItem key="edit"
              onClick={
                ()=>{
                  this.setState({
                    menuOpen:null,
                    serverDialog: {
                      open:true,
                      modAction: "Edit",
                      serverTitle: "Quiqr Cloud Server",
                      closeText: "Cancel",
                      publishConf: publishConf
                    }
                  })
                }
              }
            >
              Edit Configuration
            </MenuItem>

            <MenuItem key="delete"
              onClick={
                ()=>{
                  this.setState({
                    menuOpen:null,
                    deleteDialogOpen: true,
                    keyForDeletion: publishConf.key
                  })
                }
              }>
              Delete Configuration
            </MenuItem>
          </Menu>
        </div>
      }

    />
  }

  render(){
    const { site, serverDialog } = this.state;
    let content = null;

    if(site.publish.length < 1){
      //no target setup yet
      content = (

        <div><p>No sync server is configured. Add one first.</p>
          <Button onClick={()=>{
            this.history.push(`${this.basePath}/add/x${Math.random()}`)
          }} color="primary" variant="contained">add sync server</Button>
        </div>
    )
    }
    else if(site.publish.length === 1){
      content = this.renderMainCard(site.publish[0])
    }
    else{
      if(this.props.syncConfKey){
        const publConf = site.publish.find( ({ key }) => key === this.props.syncConfKey );
        //service.api.logToConsole(publConf, "selected PUb conf")
        if(publConf){
          content = this.renderMainCard(publConf);
        }
      }
      else{
        //get last used target of syncConfKey

      }
    }

    return (
      <Route render={({history})=>{

        this.history = history;
        return (

          <React.Fragment>
            <div className={ this.props.classes.container }>
              <Typography variant="h5">Sync Website - {this.state.site.name}</Typography>

              {content}

            </div>

            <SyncBusyDialog
              {...this.state.serverBusyDialog}
              onClose={()=>{
                this.setState({serverBusyDialog: {
                  open:false
                }})
              }}
            />


            <SyncServerDialog
              {...serverDialog}
              onSave={(publishKey, publishConfig)=>{
                this.savePublishData(publishKey, publishConfig);
                this.setState({serverDialog: {
                  open:false
                }})

              }}
              onClose={()=>{
                this.setState({serverDialog: {
                  open:false
                }})
              }}

            />

            <Dialog
              open={this.state.deleteDialogOpen}
              onClose={()=>{this.setState({deleteDialogOpen:false})}}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">{"Are you sure you want to delete this configuration?"}</DialogTitle>
              <DialogContent>
              </DialogContent>
              <DialogActions>
                <Button onClick={()=>{this.setState({deleteDialogOpen:false})}} color="primary">
                  Cancel
                </Button>
                <Button onClick={()=>{
                  this.setState({deleteDialogOpen:false})
                  this.deletePublishConfiguration(this.state.keyForDeletion);
                  }} color="primary">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>

          </React.Fragment>
        )
      }}/>
    );
  }
}

export default withStyles(useStyles)(SyncRouteGeneral);
