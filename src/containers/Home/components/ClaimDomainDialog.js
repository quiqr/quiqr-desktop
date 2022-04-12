import * as React from 'react';
import Spinner from './../../../components/Spinner'
import service from './../../../services/service';
import { Dialog, FlatButton, TextField } from 'material-ui-02';
import IconHttps from 'material-ui-02/svg-icons/action/https';
import Paper from 'material-ui-02/Paper';
let net = window.require('electron').remote.net;

export default class ClaimDomainDialog extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      pogourl: "",
      pogourl_err: "",
      email_err: "",
      failure: false,
      busy: false,
      username: this.props.username,
      fingerprint: this.props.fingerprint
    }
  }
  componentDidMount(){
    service.getConfigurations().then((c)=>{
      var stateUpdate  = {};
      stateUpdate.pogoboardConn = c.global.pogoboardConn;
      this.setState(stateUpdate);
    })
  }

  handleCancelClick = () => {
    this.props.onCancelClick();
  }

  handleDomainClaimClick = async (context) => {

    this.setState({
      busy: true
    });

    this.registerDomain(this.state.pogourl, this.props.username, this.props.fingerprint);
  }

  registerDomain(pogourl, username, fingerprint){
    if(username===""){
      this.setState({
        failure: true
      });

      this.setState({ busy: false });
      return
    }
    var postData = JSON.stringify({sitename : pogourl, username: username, fingerprint: fingerprint});

    let promise = service.api.registerPogoDomain(postData);
    promise.then((path)=>{
      service.api.logToConsole(path);

      if(path){

        let promise = service.api.createPogoDomainConf(path, path+".quiqr.cloud");
        promise.then((path2)=>{
          this.props.onClaimDomainClick({ pogourl: path2 });
        });
      }
      else{
        this.setState({
          failure: true
        });
      }

      this.setState({ busy: false });

    });
  }

  handlepogourlChange(e){

    let value = e.target.value;

    if(value!==''){

      let url = this.state.pogoboardConn.protocol+"//"+this.state.pogoboardConn.host+":"+this.state.pogoboardConn.port+"/stat/site/"+value;
      let data='';
      const request = net.request(url);
      request.on('response', (response) => {

        response.on('end', () => {
          let obj = JSON.parse(data);

          if(obj.status !== "free"){
            this.setState({
              pogourl_err: "pogourl is "+obj.status
            });
          }
          else{
            this.setState({
              pogourl_err: ""
            });
          }

        });
        response.on("data", chunk => {
          data += chunk;
        });
      })
      request.end()
    }

    this.setState({
      pogourl: value,
    });

  }

  handleTryAgain(){
    this.setState({
      pogourl: "",
      busy: false,
      failure: false,
    });

  }

  validate(){
    return !this.state.busy &&
      !this.state.failure &&
      this.state.pogourl_err === '' &&
      this.state.pogourl !== ''
  }

  renderForm(){
    //let valid = this.validate();
    let busy = this.state.busy;
    let previewUrl = this.state.pogourl.replace(/\./g,"-");
    return (
      <div>
        <TextField disabled={busy} errorText={this.state.pogourl_err} floatingLabelText={'Quiqr URL'} value={this.state.pogourl} onChange={(e)=>{this.handlepogourlChange(e)}} fullWidth />
        <Paper style={{margin:10,padding:"0 7px 7px 7px"}}>
          <IconHttps viewBox="-5 0 35 10" color="#666" /><span>https://</span><span style={{color:"green"}}>{previewUrl}</span><span>.quiqr.cloud</span>
        </Paper>
      </div>
    )

  }

  renderFailure(){
    return (
      <div>
        Something went wrong. Please <button className="reglink" onClick={()=>this.handleTryAgain()}>try again.</button>
      </div>
    )
  }

  render(){
    let { open } = this.props;
    let valid = this.validate();
    let busy = this.state.busy;
    let failure = this.state.failure;

    const actions = [
      <FlatButton
        label="Cancel"
        primary={false}
        onClick={this.handleCancelClick.bind(this)}
      />,
      <FlatButton
        disabled={!valid}
        label="Claim domain"
        primary={true}
        onClick={this.handleDomainClaimClick}
      />,
    ];

    return (
      <Dialog
        title="Claim your Quiqr URL for easy publishing to the web"
        open={open}
        actions={actions}>

        { failure? this.renderFailure() : this.renderForm() }
        { busy? <Spinner /> : undefined }
      </Dialog>
    );
  }

}
