import React                          from 'react';
import { Route }                      from 'react-router-dom';
import service                        from './../../../services/service';
import { withStyles }                 from '@material-ui/core/styles';
import SyncConfigDialog               from './components/SyncConfigDialog';
import SyncBusyDialog                 from './components/SyncBusyDialog';
import Button                         from '@material-ui/core/Button';
import { snackMessageService }        from './../../../services/ui-service';
//targets
import {Dashboard as GitHubDashboard} from './syncTypes/github'
import {Dashboard as FolderDashboard} from './syncTypes/folder'

const useStyles = theme => ({

  container:{
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
      lastOpenedPublishedKey: null,
    };
  }

  componentDidUpdate(preProps){

    if(this.state.addRefresh !== this.props.addRefresh) {
      this.openAddServerDialog();
    }

    if(preProps.site !== this.props.site) {
      this.initState();
      this.checkLastOpenedPublishConf();
    }
  }

  componentDidMount(){
    this.initState();
    this.checkLastOpenedPublishConf();
    this.basePath = `/sites/${this.props.siteKey}/workspaces/${this.props.workspaceKey}/sync`;
  }

  checkLastOpenedPublishConf(){
    service.api.readConfKey('lastOpenedPublishTargetForSite').then((value)=>{
      if(value){
        if(this.props.siteKey in value){
          this.setState({lastOpenedPublishedKey: value[this.props.siteKey]});
        }
      }
    });
  }

  openAddServerDialog(){
    this.setState({
      addRefresh: this.props.addRefresh,
      serverDialog: {
        open:true,
        modAction: "Add",
        serverTitle: "Sync Target",
        closeText: "Cancel"
      }
    })
  }

  onConfigure(publishConf){
    this.setState({
      menuOpen:null,
      serverDialog: {
        open:true,
        modAction: "Edit",
        closeText: "Cancel",
        publishConf: publishConf
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

  syncDialogControl(open, title='', icon=null){
    this.setState({
      serverBusyDialog: {
        open:open,
        serverTitle: title,
        icon: icon,
      }
    })
  }

  //TODO MOVE TO SERVICE
  mergeAction(publishConf){
    this.setState({
      serverBusyDialog: {
        open:true,
        //serverType: publishConf.config.type,
      }
    })

    service.api.mergeSiteWithRemote(this.props.siteKey, publishConf).then(()=>{
      this.setState({
        serverBusyDialog: {
          open:false,
          serverType: null,
        }
      })
      snackMessageService.addSnackMessage('Sync: pull from remote finished.','success');

    }).catch((e)=>{
      service.api.logToConsole(e ,"mergefail");
      snackMessageService.addSnackMessage('Sync: pull from remote failed.', {severity: 'warning'});
      this.setState({
        serverBusyDialog: {
          open:false,
          serverType: null,
        }
      })
    });
  }

  //TODO MOVE TO SERVICE
  publishAction(publishConf){
    const build=null;

    this.setState({
      serverBusyDialog: {
        open:true,
        serverType: publishConf.config.type,
      }
    })

    service.api.buildWorkspace(this.props.siteKey, this.props.workspaceKey, build, publishConf.config).then(()=>{

      service.api.publishSite(this.props.siteKey, publishConf).then(()=>{
        this.setState({
          serverBusyDialog: {
            open:false,
            serverType: null,
          }
        })

        snackMessageService.addSnackMessage('Sync: Push to remote finished.', {severity: 'success'});
      }).catch(()=>{
        snackMessageService.addSnackMessage('Sync: Push to remote failed.', {severity: 'warning'});
        this.setState({
          serverBusyDialog: {
            open:false,
            serverType: null,
          }
        })
      });
    });
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

  renderMainCard(publishConf){

    /*
    let publishCardObj = {
      serviceLogo: '',
      title: '',
      liveUrl: '',
      syncToText: '',
      syncFromText: '',
      repoAdminUrl: '',
      enableSyncFrom: false,
      enableSyncTo: true
    };
    */

    let enableSyncFrom = false;
    let enableSyncTo = true;

    let dashboard;

    if(publishConf.config.publishScope === 'source' ||publishConf.config.publishScope === 'build_and_source' ){
      enableSyncFrom = true;
    }
    if(publishConf.config.pullOnly === true){
      enableSyncTo = false;
    }

    if(publishConf.config.type === 'github'){
      //publishCardObj = GitHubMeta.publishCardObj(publishConf.config)
      dashboard = (
        <GitHubDashboard
          siteKey={this.props.siteKey}
          workspaceKey={this.props.workspaceKey}
          onSyncDialogControl={(open, text, icon)=>{
            this.syncDialogControl(open,text,icon);
          }}
          enableSyncFrom={enableSyncFrom}
          enableSyncTo={enableSyncTo}
          publishConf={publishConf.config}

          //title={publishCardObj.title}
          //repoAdminUrl={publishCardObj.repoAdminUrl}
          //serviceLogo={publishCardObj.serviceLogo}

          onConfigure={()=>{
            this.onConfigure(publishConf);
          }}

        />
      )
    }
    else if(publishConf.config.type === 'folder'){
      //publishCardObj = FolderMeta.publishCardObj(publishConf.config)
      dashboard = (
        <FolderDashboard
          siteKey={this.props.siteKey}
          workspaceKey={this.props.workspaceKey}
          onSyncDialogControl={(open, text, icon)=>{
            this.syncDialogControl(open,text,icon);
          }}
          enableSyncFrom={enableSyncFrom}
          enableSyncTo={enableSyncTo}
          publishConf={publishConf.config}

          onConfigure={()=>{
            this.onConfigure(publishConf);
          }}

        />
      )

    }

    return dashboard;
  }

  render(){
    const { site, serverDialog } = this.state;
    let content = null;

    if(site.publish.length < 1){
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
    else if(this.props.syncConfKey){
      const publConf = site.publish.find( ({ key }) => key === this.props.syncConfKey );
      if(publConf){
        content = this.renderMainCard(publConf);
      }
    }
    else if(this.state.lastOpenedPublishedKey){
      const publConf = site.publish.find( ({ key }) => key === this.state.lastOpenedPublishedKey );
      if(publConf){
        content = this.renderMainCard(publConf);
      }
    }

    if(!content){
      content = this.renderMainCard(site.publish[0])
    }

    return (
      <Route render={({history})=>{

        this.history = history;
        return (

          <React.Fragment>

            <div className={ this.props.classes.container }>

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

            <SyncConfigDialog
              {...serverDialog}
              site={this.state.site}
              onSave={(publishKey)=>{

                this.history.push(`${this.basePath}/list/${publishKey}`)

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

          </React.Fragment>
        )
      }}/>
    );
  }
}

export default withStyles(useStyles)(SyncRouteGeneral);
