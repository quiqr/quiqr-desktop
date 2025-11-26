import * as React                       from 'react';
import Button                           from '@mui/material/Button';
import MuiDialogTitle                   from '@mui/material/DialogTitle';
import Grid                             from '@mui/material/Grid';
import Box                              from '@mui/material/Box';
import Typography                       from '@mui/material/Typography';
import Dialog                           from '@mui/material/Dialog';
import DialogActions                    from '@mui/material/DialogActions';
import DialogContent                    from '@mui/material/DialogContent';
import DialogContentText                from '@mui/material/DialogContentText';
import service                          from './../../../../services/service';

//GitHub Target
import {FormConfig as GitHubPagesForm}  from '../syncTypes/github'
import {Meta as GitHubMeta}             from '../syncTypes/github'
import {CardNew as CardNewGitHub}       from '../syncTypes/github'

//System Git Target
import {FormConfig as SysGitForm}       from '../syncTypes/sysgit'
import {CardNew as CardNewSysGit}       from '../syncTypes/sysgit'
import {Meta as SysGitMeta}             from '../syncTypes/sysgit'

//Folder Target
import {Meta as FolderMeta}             from '../syncTypes/folder'
import {FormConfig as FolderExportForm} from '../syncTypes/folder'
import {CardNew as CardNewFolder}       from '../syncTypes/folder'
import DialogTitle from "@mui/material/DialogTitle";

interface SyncConfigDialogProps {
  open?: boolean;
  site: {
    key: string;
    publish: Array<{
      key: string;
      config: unknown;
    }>;
  };
  publishConf?: {
    key: string;
    config: {
      type: string;
    };
  };
  modAction?: string;
  closeText?: string;
  onClose: () => void;
  onSave: (inkey: string) => void;
}

interface SyncConfigDialogState {
  serverType: string | null;
  saveEnabled: boolean;
  pubData: any;
  dialogSize: string;
  publishKey?: string;
}

class SyncConfigDialog extends React.Component<SyncConfigDialogProps, SyncConfigDialogState>{

  constructor(props){
    super(props);

    this.state = {
      serverType: null,
      saveEnabled: false,
      pubData: {},
      dialogSize: "sm",
    }
  }

  savePublishData(inkey,data){
    let site= this.props.site;

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

    service.api.saveSiteConf(site.key, site).then(()=>{
      this.props.onSave(inkey);
    });
  }


  componentDidUpdate(preProps){
    if(this.props.publishConf && preProps.publishConf !== this.props.publishConf) {
      this.setState({
        serverType: this.props.publishConf.config.type,
        publishKey: this.props.publishConf.key,
        dialogSize: "md",
      });
    }
  }

  renderServerCards(){
    const sysGitBinAvailable = true;
    return (

      <React.Fragment>
        <Grid container  spacing={2}>

          { (sysGitBinAvailable ?
          <Grid item xs={6}>
            <CardNewSysGit
              handleClick={()=>{
                this.setState({serverType: 'sysgit',
                  dialogSize: "md",
                });
              }} />
          </Grid>
          : null) }

          <Grid item xs={6}>

            <CardNewGitHub
              handleClick={()=>{
                this.setState({serverType: 'github',
                  dialogSize: "md",
                });
              }} />

          </Grid>

          <Grid item xs={6}>
            <CardNewFolder
              handleClick={()=>{
                this.setState({serverType: 'folder',
                  dialogSize: "md",
                });
              }} />

          </Grid>

        </Grid>
      </React.Fragment>
    )
  }

  render(){
    let { open, modAction, closeText } = this.props;
    let content, serverFormLogo = null;
    let saveButtonHidden = true;
    let configDialogTitle = '';

    if(this.state.serverType){
      if (this.state.serverType === 'github'){

        configDialogTitle = GitHubMeta.configDialogTitle;
        serverFormLogo = GitHubMeta.icon();
        content = <GitHubPagesForm
            publishConf={this.props.publishConf}
            modAction={this.props.modAction}
            setSaveEnabled={(enabled)=>{
              this.setState({saveEnabled:enabled});
            }}
            setData={(pubData)=>{
              this.setState({pubData:pubData});
          }} />

        saveButtonHidden = false;
      }

      else if (this.state.serverType === 'sysgit'){
        configDialogTitle = SysGitMeta.configDialogTitle;
        serverFormLogo = SysGitMeta.icon();
        content = <SysGitForm
            publishConf={this.props.publishConf}
            modAction={this.props.modAction}
            setSaveEnabled={(enabled)=>{
              this.setState({saveEnabled:enabled});
            }}
            setData={(pubData)=>{
              this.setState({pubData:pubData});
          }} />

        saveButtonHidden = false;
      }

      else if (this.state.serverType === 'folder'){


        configDialogTitle = FolderMeta.configDialogTitle;
        serverFormLogo = FolderMeta.icon();
        content = <FolderExportForm
            publishConf={this.props.publishConf}
            modAction={this.props.modAction}
            setSaveEnabled={(enabled)=>{
              this.setState({saveEnabled:enabled});
            }}
            setData={(pubData)=>{
              this.setState({pubData:pubData});
          }} />

        saveButtonHidden = false;
      }

    }
    else if(modAction === 'Add'){
      content = this.renderServerCards();
    }

    const actions = [
      <Button key="action1" color="primary" onClick={this.props.onClose}>
        {closeText}
      </Button>,
      (saveButtonHidden?null:
        <Button  key="action2" color="primary" hidden={saveButtonHidden} disabled={!this.state.saveEnabled} onClick={()=>{
          this.savePublishData(this.state.publishKey, this.state.pubData);
          //this.props.onSave(this.state.publishKey, this.state.pubData);
        }}>
          {"save"}
        </Button>),
    ];

    return (
      <Dialog
        open={open || false}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        fullWidth={true}
        maxWidth={this.state.dialogSize}>
        <DialogTitle sx={{ margin: 0, p: 2 }}>
          <Box sx={{ position: "absolute", right: "24px", top: "24px" }}>{serverFormLogo}</Box>
          <Typography variant='h6'>{modAction + " " + configDialogTitle}</Typography>
        </DialogTitle>

        <DialogContent>
          {content}
          <DialogContentText id='alert-dialog-description'></DialogContentText>
        </DialogContent>
        <DialogActions>{actions}</DialogActions>
      </Dialog>
    );
  }
}

export default SyncConfigDialog;
