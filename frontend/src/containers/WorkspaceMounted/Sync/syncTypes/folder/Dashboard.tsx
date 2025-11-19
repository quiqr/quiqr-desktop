import * as React              from 'react';
import Box                     from '@mui/material/Box';
import Typography              from '@mui/material/Typography';
import Link from '@mui/material/Link';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import Divider                 from '@mui/material/Divider';
import Button                  from '@mui/material/Button';
import ArrowUpwardIcon         from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon       from '@mui/icons-material/ArrowDownward';
import Meta                    from './Meta'
import {snackMessageService}   from '../../../../../services/ui-service';
import service                 from '../../../../../services/service';

interface DashboardProps {
  siteKey: string;
  workspaceKey: string;
  enableSyncFrom: boolean;
  enableSyncTo: boolean;
  publishConf: {
    type: string;
    path?: string;
    publishScope?: string;
    pullOnly?: boolean;
    [key: string]: unknown;
  };
  onSyncDialogControl: (open: boolean, text: string, icon: React.ReactNode) => void;
  onConfigure: () => void;
}

export class Dashboard extends React.Component<DashboardProps>{

  pullFromRemote(){
    this.props.onSyncDialogControl(
      true,
      Meta.syncingText, Meta.icon());

    service.api.publisherDispatchAction(this.props.siteKey, this.props.publishConf, 'pullFromRemote',{},90000).then(()=>{

      this.props.onSyncDialogControl(
        false,
        Meta.syncingText, Meta.icon());

      snackMessageService.addSnackMessage("Sync: sync from folder finished.", { severity: "success" });

    }).catch((e)=>{
      snackMessageService.addSnackMessage('Sync: sync from folder failed.', {severity: 'warning'});
      this.props.onSyncDialogControl(
        false,
        Meta.syncingText, Meta.icon());
    });
  }

  pushToRemote(){
    this.props.onSyncDialogControl(
      true,
      Meta.syncingText, Meta.icon());

    service.api.buildWorkspace(this.props.siteKey, this.props.workspaceKey, null, this.props.publishConf).then(()=>{

      service.api.publisherDispatchAction(this.props.siteKey, this.props.publishConf, 'pushToRemote',{},90000).then(()=>{

        this.props.onSyncDialogControl(
          false,
          Meta.syncingText, Meta.icon());
        //this.refreshRemoteStatus();

        snackMessageService.addSnackMessage('Sync: Sync to folder finished.', {severity: 'success'});
      }).catch(()=>{
        this.props.onSyncDialogControl(
          false,
          Meta.syncingText, Meta.icon());
        snackMessageService.addSnackMessage('Sync: Sync to folder failed.', {severity: 'warning'});
      });
    });
  }

  render(){

    return (
      <React.Fragment>
        <Box component="div" style={{
          display:'flex',
          alignItems: 'flex-start'
          }} m={2}>

          <Box component="span" m={1}>
            <FolderIcon fontSize="large"/>
          </Box>

          <Box component="span" style={{flexGrow:1}}>
            <Typography>{Meta.sidebarLabel(this.props.publishConf)}</Typography>

            <Link component="button" variant="body2"
              onClick={()=>{
                service.api.openFileInEditor(this.props.publishConf.path);
              }}
            >
            Open in File Manager
            </Link>
          </Box>

          <Box component="span">
            <Button
              onClick={()=>{this.props.onConfigure()}}
              size="small"
              variant="contained"
              startIcon={<SettingsIcon />}>
              Configure
            </Button>
          </Box>
        </Box>
        <Box component="div" style={{
          display:'flex',
          alignItems: 'flex-start'
        }} m={2}>

          { this.props.enableSyncTo ?
            <Button
              onClick={()=>{this.pushToRemote()}}
              style={{marginRight:'5px'}}
              size="small"
              variant="contained"
              color="primary"
              startIcon={<ArrowUpwardIcon />}
            >
              Sync to folder
            </Button>
            :null
          }

          { this.props.enableSyncFrom ?
            <Button
              onClick={()=>{this.pullFromRemote()}}
              size="small"
              variant="contained"
              color="primary"
              startIcon={<ArrowDownwardIcon />}
            >
              Sync from Folder
            </Button>
            :null
          }
        </Box>
        <Divider/>
      </React.Fragment>
    );
  }

}

export default Dashboard;
