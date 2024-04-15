import * as React                       from 'react';
import { withStyles }                   from '@material-ui/core/styles';
import Button                           from '@material-ui/core/Button';
import MuiDialogTitle                   from '@material-ui/core/DialogTitle';
import Grid                             from '@material-ui/core/Grid';
import Box                              from '@material-ui/core/Box';
import Typography                       from '@material-ui/core/Typography';
import Dialog                           from '@material-ui/core/Dialog';
import DialogActions                    from '@material-ui/core/DialogActions';
import DialogContent                    from '@material-ui/core/DialogContent';
import DialogContentText                from '@material-ui/core/DialogContentText';
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

const useStyles = theme => ({

  root: {
    margin: 0,
    padding: theme.spacing(2),
  },

  serverFormLogo: {
    position: 'absolute',
    right: theme.spacing(3),
    top: theme.spacing(3),
  },

  paper: {
    padding:"40px",
    cursor: "pointer",
    backgroundColor:"#eee",
    '&:hover': {
      backgroundColor:"#ccc"
    }
  }
});

class SyncConfigDialog extends React.Component{

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
    const {classes} = this.props;
    const sysGitBinAvailable = true;
    return (

      <React.Fragment>
        <Grid container  spacing={2}>

          { (sysGitBinAvailable ?
          <Grid item xs={6}>
            <CardNewSysGit
              classes={classes}
              handleClick={()=>{
                this.setState({serverType: 'sysgit',
                  dialogSize: "md",
                });
              }} />
          </Grid>
          : null) }

          <Grid item xs={6}>

            <CardNewGitHub
              classes={classes}
              handleClick={()=>{
                this.setState({serverType: 'github',
                  dialogSize: "md",
                });
              }} />

          </Grid>

          <Grid item xs={6}>
            <CardNewFolder
              classes={classes}
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
    let { open, classes, modAction, closeText } = this.props;
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
        open={open||false}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth={this.state.dialogSize} >

        <MuiDialogTitle disableTypography className={classes.root}>
          <Box className={classes.serverFormLogo}>
          {serverFormLogo}
          </Box>
          <Typography variant="h6">{modAction + " " + configDialogTitle}</Typography>
        </MuiDialogTitle>

        <DialogContent>
          {content}
          <DialogContentText id="alert-dialog-description">
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {actions}
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(useStyles)(SyncConfigDialog);
