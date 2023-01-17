import * as React           from 'react';
import service              from '../../../services/service';
import { withStyles }       from '@material-ui/core/styles';
import TextField            from '@material-ui/core/TextField';
import Button               from '@material-ui/core/Button';
import Box                  from '@material-ui/core/Box';
import Dialog               from '@material-ui/core/Dialog';
import DialogActions        from '@material-ui/core/DialogActions';
import DialogContent        from '@material-ui/core/DialogContent';
import DialogContentText    from '@material-ui/core/DialogContentText';
import DialogTitle          from '@material-ui/core/DialogTitle';

const useStyles = theme => ({

});


class RemoteSiteDialog extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      remoteSiteName: "",
      execButtonsDisabled: true,
      errorTextSiteName: "",
      busy: false,
      downloading: false,
      finished: false,
      cancelText: "cancel",
      newSiteName: ""
    }
  }

  componentDidUpdate(){

    if(this.props.open !== this.state.open && this.props.remoteSiteName){

      let siteName = this.props.remoteSiteName.split("/").pop();
      this.validateSiteName(siteName);
      this.setState({
        remoteSiteName: this.props.remoteSiteName,
        newSiteName: siteName,
        busy: false,
        open: this.props.open,
        cancelText: "cancel",
        downloading: false,
        finished: false,
        failure: false,

      });
    }
  }

  validateSiteName(newName){
    let errorTextSiteName = "";
    let execButtonsDisabled = false;

    if(this.props.localsites && this.props.localsites.includes(newName)){
      errorTextSiteName = "Name is already used locally."
      execButtonsDisabled = true;
    }
    this.setState({
      execButtonsDisabled: execButtonsDisabled,
      errorTextSiteName: errorTextSiteName
    });
  }

  handleNameChange(e){
    this.validateSiteName(e.target.value);
    this.setState({
      newSiteName: e.target.value
    });
  }

  handleDownloadClone(){
    try{
      this.setState({
        busy: true,
        execButtonsDisabled: true,
        downloading: true,
      });

      service.api.cloneRemoteAsManagedSite(this.props.remoteSiteName, this.state.newSiteName).then((clonedSiteInfo)=>{
        service.api.invalidateCache();
        this.setState({
          busy: false,
          downloading: false,
          finished: true,
          cancelText: "Close",
          newSiteKey: clonedSiteInfo.key,
        });
      });
    }
    catch(e){
      this.setState({
        busy: false,
        cancelText: "Close",
        downloading: false,
        failure: true,
      });
    }
  }

  async handleDownloadCopy(){
    try{
      this.setState({
        busy: true,
        execButtonsDisabled: true,
        downloading: true,
      });

      await service.api.cloneRemoteAsUnmanagedSite(this.props.remoteSiteName, this.state.newSiteName).then((clonedSiteInfo)=>{
        service.api.invalidateCache();
        this.setState({
          busy: false,
          downloading: false,
          finished: true,
          cancelText: "Close",
          newSiteKey: clonedSiteInfo.key,
        });
      });
    }
    catch(e){
      this.setState({
        busy: false,
        downloading: false,
        cancelText: "Close",
        failure: true,
      });
    }
  }

  async handleOpenNewSite(){
    this.setState({
      open: false
    },()=>{
      this.props.mountSite(this.state.newSiteKey)
    });
  }

  renderForm(){
    return (
      <Box>
        <Box my={3}>Download <strong>{this.props.remoteSiteName}</strong> to your local computer for editing and previewing.</Box>

        <TextField
          id="standard-full-width"
          label="Name of local site copy"
          value={this.state.newSiteName}
          onChange={(e)=>{this.handleNameChange(e)}}
          error={(this.state.errorTextSiteName===""?false:true)}
          helperText={this.state.errorTextSiteName}
          />

      </Box>
    )
  }

  renderDownloading(){
    return (
      <div>
        Downloading <strong>{this.props.remoteSiteName}</strong> as {this.state.newName}
      </div>
    )
  }

  renderFinished(){
    return (
      <div>
        Finished downloading. <Button onClick={()=>{this.handleOpenNewSite()}}>Open {this.state.newSiteName} now</Button>.
      </div>
    )
  }

  renderFailure(){
    return (
      <div>
        Something went wrong.
      </div>
    )
  }

  renderBody(){
    if(this.state.finished){
      return this.renderFinished();
    }
    else if(this.state.downloading){
      return this.renderDownloading();
    }
    else{
      return this.renderForm();
    }
  }

  render(){

    let { open } = this.props;
    let failure = this.state.failure;

    const actions = [
      <Button
        key={"menuAction1a"}
        onClick={()=>{
        this.setState({
          open: false
        },()=>{
          this.props.onCancelClick();
        });
      }}>
      {this.state.cancelText}
      </Button>,

      <Button
        key={"menuAction2a"}
        disabled={this.state.execButtonsDisabled} onClick={()=>this.handleDownloadClone()} >
        DOWNLOAD
        </Button>,

      <Button
        key={"menuAction3a"}
        disabled={this.state.execButtonsDisabled} onClick={()=>this.handleDownloadCopy()} >
        DOWNLOAD AND COPY AS NEW SITE
        </Button>,
    ];

    return (
      <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={true}
      maxWidth={"sm"}
    >
        <DialogTitle id="alert-dialog-title">{"Download "+this.props.remoteSiteName+""}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            { failure? this.renderFailure() : this.renderBody() }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {actions}
        </DialogActions>
      </Dialog>
    );
  }
}
export default withStyles(useStyles)(RemoteSiteDialog)
