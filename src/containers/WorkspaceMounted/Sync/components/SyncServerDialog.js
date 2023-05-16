import * as React          from 'react';
import { withStyles }      from '@material-ui/core/styles';
import Button              from '@material-ui/core/Button';
import MuiDialogTitle      from '@material-ui/core/DialogTitle';
import Grid                from '@material-ui/core/Grid';
import Paper               from '@material-ui/core/Paper';
import Box                 from '@material-ui/core/Box';
import Typography          from '@material-ui/core/Typography';
import Dialog              from '@material-ui/core/Dialog';
import DialogActions       from '@material-ui/core/DialogActions';
import DialogContent       from '@material-ui/core/DialogContent';
import DialogContentText   from '@material-ui/core/DialogContentText';
import FolderIcon          from '@material-ui/icons/Folder';
import GitHubPagesForm     from './github-pages/GitHubPagesForm'
import FolderExportForm    from './folder-export/FolderExportForm'
import CardLogoGitHubPages from '../../../../svg-assets/CardLogoGitHubPages'
import FormLogoGitHubPages from '../../../../svg-assets/FormLogoGitHubPages'
import service                 from './../../../../services/service';

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

class SyncServerDialog extends React.Component{

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
    return (

      <React.Fragment>
        <Grid container  spacing={2}>
          <Grid item xs={6}>
            <Paper
              onClick={()=>{
                this.setState({
                  serverType: 'github',
                  dialogSize: "md",
                })
              }}
              className={classes.paper}
              elevation={5}
            >
              <CardLogoGitHubPages />
            </Paper>
          </Grid>

          <Grid item xs={6}>
            <Paper
              onClick={()=>{
                this.setState({serverType: 'folder',
                  dialogSize: "md",
                })
              }}
              className={classes.paper}
              elevation={5}
            >
              <Box display="flex" alignItems="center"  justifyContent="center" height={63}>
                <FolderIcon fontSize="large" />
              </Box>
              <Box display="flex" alignItems="center"  justifyContent="center" >
                <Typography variant="h5">TO FOLDER</Typography>
              </Box>
            </Paper>
          </Grid>

        </Grid>
      </React.Fragment>
    )
  }

  render(){
    let { open, classes, modAction, serverTitle, closeText } = this.props;
    let content, serverFormLogo = null;
    let saveButtonHidden = true;

    if(this.state.serverType){
      if (this.state.serverType === 'github'){
        serverTitle = "GitHub Pages Server";
        serverFormLogo = <FormLogoGitHubPages className={classes.serverFormLogo} />
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

      else if (this.state.serverType === 'folder'){
        serverTitle = "Folder Export Target";
        serverFormLogo = <FolderIcon />
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
          <Typography variant="h6">{modAction + " " + serverTitle}</Typography>
          {serverFormLogo}
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

export default withStyles(useStyles)(SyncServerDialog);
