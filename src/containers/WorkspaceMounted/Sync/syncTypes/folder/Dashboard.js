import * as React              from 'react';
import { withStyles }          from '@material-ui/core/styles';
import Box                     from '@material-ui/core/Box';
import Typography              from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import FolderIcon from '@material-ui/icons/Folder';
import SettingsIcon from '@material-ui/icons/Settings';
import Divider                 from '@material-ui/core/Divider';
import Button                  from '@material-ui/core/Button';
import ArrowUpwardIcon         from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon       from '@material-ui/icons/ArrowDownward';
import Meta                    from './Meta'
import {snackMessageService}   from '../../../../../services/ui-service';
import service                 from '../../../../../services/service';

const useStyles = theme => ({
});

class Dashboard extends React.Component{

  pullFromRemote(){
    this.props.onSyncDialogControl(
      true,
      Meta.syncingText, Meta.icon());

    service.api.publisherDispatchAction(this.props.siteKey, this.props.publishConf, 'pullFromRemote',{},90000).then(()=>{

      this.props.onSyncDialogControl(
        false,
        Meta.syncingText, Meta.icon());

      snackMessageService.addSnackMessage('Sync: sync from folder finished.','success');

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
              color="default"
              startIcon={<SettingsIcon />}
            >
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
    )
  }

}

export default withStyles(useStyles)(Dashboard);


