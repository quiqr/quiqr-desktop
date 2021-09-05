import * as React from 'react';
import Spinner from './../../../components/Spinner'
import service from './../../../services/service';
import { Dialog, FlatButton, TextField } from 'material-ui-02';

export default class RemoteSiteDialog extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      newSiteName: ""
    }
  }

  componentDidUpdate(props){
    if(this.props.remoteSiteName){
      let siteName = this.props.remoteSiteName.split("/").pop();
      if(siteName !== this.state.newSiteName){
        //this.setState({ newSiteName: siteName });
      }
    }
  }

  renderForm(){
    let busy = this.state.busy;

    return (
      <div>
        Download <strong>{this.props.remoteSiteName}</strong> to your local computer for editing and previewing
        <TextField
        xdisabled={busy}
        floatingLabelText={this.props.remoteSiteName}
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

  handleNameChange(e){

    service.api.logToConsole(e.target.value);
    let value = e.target.value;
    this.setState({
      newSiteName: value
    });
  }


  handleDownloadClone(){
    //service.api.logToConsole(this.props.configurations);
    //check if localname is not taken
    //clone with publishing info setup
  }

  handleDownloadCopy(){
    //service.api.logToConsole(this.props.configurations);
    let nameExists = this.props.configurations.sites.filter((site)=>{
        return (site.name === this.state.newSiteName);
    });
    service.api.logToConsole(this.state.newSiteName);
    service.api.logToConsole(nameExists);


    //check if localname is not taken
    //clone without publishing info
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
      label="Download for participating"
      primary={true}
      onClick={()=>this.handleDownloadClone()}
    />,
      <FlatButton
      label="Download and copy as new site "
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
