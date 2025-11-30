import * as React       from 'react';
import { Route }        from 'react-router-dom';
import Sidebar          from './../../Sidebar';
import service          from './../../../services/service';
import AddIcon          from '@mui/icons-material/Add';
import IconButton       from '@mui/material/IconButton';
import MoreVertIcon     from '@mui/icons-material/MoreVert';
import Menu             from '@mui/material/Menu';
import MenuItem         from '@mui/material/MenuItem';
import SyncConfigDialog from './components/SyncConfigDialog';
import Button           from '@mui/material/Button';
import Dialog           from '@mui/material/Dialog';
import DialogActions    from '@mui/material/DialogActions';
import DialogTitle      from '@mui/material/DialogTitle';
import DialogContent    from '@mui/material/DialogContent';
import { History } from 'history';
//targets
import {Meta as GitHubMeta}   from './syncTypes/github'
import {Meta as FolderMeta}   from './syncTypes/folder'
import {Meta as SysGitMeta}   from './syncTypes/sysgit'

interface PublishConfig {
  key: string;
  config?: {
    type?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface SiteWithPublish {
  key: string;
  publish: PublishConfig[];
  [key: string]: unknown;
}

interface ServerDialogConfig {
  open?: boolean;
  modAction?: string;
  closeText?: string;
  publishConf?: PublishConfig;
}

interface SyncSidebarProps {
  siteKey: string;
  workspaceKey: string;
  site: SiteWithPublish;
  [key: string]: unknown;
}

interface SyncSidebarState {
  site: SiteWithPublish;
  anchorEl?: HTMLElement | null;
  menuOpen?: number | null;
  serverDialog?: ServerDialogConfig;
  deleteDialogOpen?: boolean;
  keyForDeletion?: string;
}

export class SyncSidebar extends React.Component<SyncSidebarProps, SyncSidebarState> {

  history: History | null = null;

  constructor(props: SyncSidebarProps){
    super(props);
    this.state = {
      site: {
        key: '',
        publish: [],
      },
    }
  }


  componentDidUpdate(preProps: SyncSidebarProps){
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
    return <Route render={({history})=>{
      this.history = history;
      return this.renderWithRoute(history) }
    } />
  }

  renderButton(index: number, publ: PublishConfig){

    return (
      <IconButton
        edge="end"
        aria-label="comments"
        onClick={(e)=>{
          this.setState({anchorEl:e.currentTarget, menuOpen:index})
        }}
        size="large">
        <MoreVertIcon />
      </IconButton>
    );
  }

  renderMenu(index: number, publ: PublishConfig){
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


  deletePublishConfiguration(inkey: string){
    const encodedSiteKey = this.props.siteKey;
    const encodedWorkspaceKey = this.props.workspaceKey;
    const basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}/sync`;

    const site = this.props.site;

    const publConfIndex = site.publish.findIndex( ({ key }) => key === inkey );
    if(publConfIndex > -1){
      site.publish.splice(publConfIndex, 1);

      service.api.saveSiteConf(this.props.site.key, this.props.site).then(()=>{
        // Must stay imperative - navigation after async operation
        this.history?.push(`${basePath}/`)
      });
    }
  }


  renderWithRoute(history: History){
    const {site} = this.state;

    const encodedSiteKey = this.props.siteKey;
    const encodedWorkspaceKey = this.props.workspaceKey;
    const basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}/sync`;

    const targets = [];
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
          to: `${basePath}/list/${publ.key}/`,
        });
      }

      index++;
    })

    const menus = [{
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
            // Must stay imperative - uses Math.random() for cache busting
            onClick: ()=>{
              history.push(`${basePath}/add/x${Math.random()}`)
            }
          }
        ]

      }
    ]

    return (

      <React.Fragment>
        <SyncConfigDialog
          {...(this.state.serverDialog as Record<string, unknown>)}
          site={this.props.site as unknown as { key: string; publish: Array<{ key: string; config: unknown }> }}
          onSave={(publishKey)=>{
            // Must stay imperative - navigation after async operation
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
