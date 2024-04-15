import * as React       from 'react';
import { Route }        from 'react-router-dom';
import Sidebar          from './../../Sidebar';
import service          from './../../../services/service';
import AddIcon          from '@material-ui/icons/Add';
import IconButton       from '@material-ui/core/IconButton';
import MoreVertIcon     from '@material-ui/icons/MoreVert';
import Menu             from '@material-ui/core/Menu';
import MenuItem         from '@material-ui/core/MenuItem';
import SyncConfigDialog from './components/SyncConfigDialog';
import Button           from '@material-ui/core/Button';
import Dialog           from '@material-ui/core/Dialog';
import DialogActions    from '@material-ui/core/DialogActions';
import DialogTitle      from '@material-ui/core/DialogTitle';
import DialogContent    from '@material-ui/core/DialogContent';
//targets
import {Meta as GitHubMeta}   from './syncTypes/github'
import {Meta as FolderMeta}   from './syncTypes/folder'
import {Meta as SysGitMeta}   from './syncTypes/sysgit'

export class SyncSidebar extends React.Component {

  history: any;

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
      this.checkLastOpenedPublishConf();
    }
  }

  componentDidMount(){
    this.initState();
    this.checkLastOpenedPublishConf();
  }

  checkLastOpenedPublishConf(){
    service.api.readConfKey('lastOpenedPublishTargetForSite').then((value)=>{
      if(value){
        if(this.props.siteKey in value){
          this.setState({selectedMenuItem: value[this.props.siteKey]});
        }
      }
    });
  }

  initState(){
    if(this.props.site){
      this.setState({
        site: this.props.site
      });
    }
  }

  render(){
    return <Route render={({history})=>{
      this.history = history;
      return this.renderWithRoute(history) }
    } />
  }

  renderButton(index,publ){

    return (
      <IconButton edge="end" aria-label="comments" onClick={(e)=>{
        this.setState({anchorEl:e.currentTarget, menuOpen:index})
      }}>
        <MoreVertIcon />
      </IconButton>
    )
  }

  renderMenu(index, publ){
    return (
      <Menu
        anchorEl={this.state.anchorEl}
        open={(this.state.menuOpen===index?true:false)}
        keepMounted
        onClose={()=>{
          this.setState({menuOpen:null});
        }}
      >
        <MenuItem key="configure"
          onClick={
            ()=>{
              this.setState({
                menuOpen:null,
                serverDialog: {
                  open:true,
                  modAction: "Edit",
                  closeText: "Cancel",
                  publishConf: publ
                }
              })
            }
          }>
          Configure
        </MenuItem>

        <MenuItem key="delete"
          onClick={
            ()=>{
              this.setState({
                menuOpen:null,
                deleteDialogOpen: true,
                keyForDeletion: publ.key
              })

            }
          }>
          Delete
        </MenuItem>

      </Menu>
    )
  }


  deletePublishConfiguration(inkey){
    let encodedSiteKey = this.props.siteKey;
    let encodedWorkspaceKey = this.props.workspaceKey;
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}/sync`;

    let site= this.props.site;

    const publConfIndex = site.publish.findIndex( ({ key }) => key === inkey );
    if(publConfIndex > -1){
      site.publish.splice(publConfIndex, 1);

      service.api.saveSiteConf(this.props.site.key, this.props.site).then(()=>{
        this.history.push(`${basePath}/`)
      });
    }
  }


  renderWithRoute(history: {push:(path: string)=>void}){
    let {site} = this.state;

    let encodedSiteKey = this.props.siteKey;
    let encodedWorkspaceKey = this.props.workspaceKey;
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}/sync`;

    let targets = [];
    let index = 0;

    site.publish.forEach((publ)=>{

      let label, icon

      if(publ.config && publ.config.type === "github" ){
        label = GitHubMeta.sidebarLabel(publ.config);
        icon = GitHubMeta.icon();
      }
      else if(publ.config && publ.config.type === "sysgit" ){
        label = SysGitMeta.sidebarLabel(publ.config);
        icon = SysGitMeta.icon();
      }

      else if(publ.config && publ.config.type === "folder" ){
        label = FolderMeta.sidebarLabel(publ.config);
        icon = FolderMeta.icon();
      }

      label = (label.length >  17 ? `${label.substring(0, 17)}..` : label);
      if(label){
        targets.push({
          active: true,
          icon: icon,
          label: label,
          secondaryMenu: this.renderMenu(index, publ),
          secondaryButton: this.renderButton(index, publ),
          selected: (this.state.selectedMenuItem===publ.key ? true : false),
          onClick: ()=>{
            this.setState({selectedMenuItem:publ.key});
            history.push(`${basePath}/list/${publ.key}/`)
          }
        });
      }

      index++;
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

    return (

      <React.Fragment>
        <SyncConfigDialog
          {...this.state.serverDialog}
          site={this.props.site}
          onSave={(publishKey)=>{
            this.history.push(`${basePath}/list/${publishKey}`)
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
          open={this.state.deleteDialogOpen||false}
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


        <Sidebar {...this.props} menus={menus} />
      </React.Fragment>
    )
  }
}
