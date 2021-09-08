import * as React from 'react';
import Spinner from './../../../components/Spinner'
import service from './../../../services/service';
import { Dialog, FlatButton, TextField } from 'material-ui-02';

export default class RemoteSiteDialog extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      remoteSiteName: "",
      execButtonsDisabled: true,
      errorTextSiteName: "",
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
    if(this.props.remoteSiteName !== this.state.remoteSiteName && this.props.remoteSiteName){
      let siteName = this.props.remoteSiteName.split("/").pop();
      this.validateSiteName(siteName);
      this.setState({
        remoteSiteName: this.props.remoteSiteName,
        newSiteName: siteName
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
    //clone with publishing info setup
  }

  handleDownloadCopy(){
    let nameExists = this.props.configurations.sites.filter((site)=>{
      return (site.name === this.state.newSiteName);
    });
    service.api.logToConsole(this.state.newSiteName);
    service.api.logToConsole(nameExists);

    //clone without publishing info
  }

  renderForm(){
    let busy = this.state.busy;

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

  renderFailure(){
    return (
      <div>
        Something went wrong.
      </div>
    )
  }

  render(){
    let { open } = this.props;
    let busy = this.state.busy;
    let failure = this.state.failure;

    const actions = [
      <FlatButton
      label="Cancel"
      primary={false}
      onClick={this.props.onCancelClick}
    />,
      <FlatButton
      label="CHECKOUT AS WORKING COPY"
      disabled={this.state.execButtonsDisabled}
      primary={true}
      onClick={()=>this.handleDownloadClone()}
    />,
      <FlatButton
      label="COPY AS NEW SITE"
      disabled={this.state.execButtonsDisabled}
      primary={true}
      onClick={()=>this.handleDownloadCopy()}
    />,
    ];

    return (
      <Dialog
      title={"Download "+this.props.remoteSiteName+""}
      open={open}
      actions={actions}>

      { failure? this.renderFailure() : this.renderForm() }
      { busy? <Spinner /> : undefined }
    </Dialog>
    );
  }

}
