import * as React            from 'react';
import Spinner               from '../../../components/Spinner'
import service               from '../../../services/service';
import { Dialog, TextField } from 'material-ui-02';
import SharedMaterialStyles  from '../../../shared-material-styles';
import { withStyles }        from '@material-ui/core/styles';
import Button            from '@material-ui/core/Button';

const localStyles = {
}
const styles = {...SharedMaterialStyles, ...localStyles}

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

  componentWillMount(){
    let localsites = [];
    service.getConfigurations(true).then((c)=>{

      c.sites.forEach((site) =>{
        localsites.push(site.name);
      });

      this.setState({
        localsites :localsites
      });
    });
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

    if(this.state.localsites.includes(newName)){
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
      service.api.logToConsole("FE: error cloning");
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
      service.api.logToConsole("FE: error cloning unmanaged");
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
      <div>
        Download <strong>{this.props.remoteSiteName}</strong> to your local computer for editing and previewing
        <TextField
        floatingLabelText="Name of local site copy"
        errorText={this.state.errorTextSiteName}
        onChange={(e)=>{this.handleNameChange(e)}}
        value={this.state.newSiteName}
        fullWidth />
      </div>
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
    let { classes } = this.props;
    return (
      <div>
        Finished downloading. <Button className={classes.primaryFlatButton} onClick={()=>{this.handleOpenNewSite()}}>Open {this.state.newSiteName} now</Button>.
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

    let { open, classes } = this.props;
    let busy = this.state.busy;
    let failure = this.state.failure;

    const actions = [
      <Button className={classes.primaryFlatButton} onClick={()=>{
        this.setState({
          open: false
        },()=>{
          this.props.onCancelClick();
        });
      }}>
      {this.state.cancelText}
      </Button>,

      <Button disabled={this.state.execButtonsDisabled} className={classes.primaryFlatButton} onClick={()=>this.handleDownloadClone()} >
        DOWNLOAD
        </Button>,

      <Button disabled={this.state.execButtonsDisabled} className={classes.primaryFlatButton} onClick={()=>this.handleDownloadCopy()} >
        DOWNLOAD AND COPY AS NEW SITE
        </Button>,
    ];

    return (
      <Dialog
      title={"Download "+this.props.remoteSiteName+""}
      open={open}
      actions={actions}>

      { failure? this.renderFailure() : this.renderBody() }
      { busy? <Spinner /> : undefined }
    </Dialog>
    );
  }
}
export default withStyles(styles)(RemoteSiteDialog)
