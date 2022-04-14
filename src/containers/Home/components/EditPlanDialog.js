import * as React             from 'react';
import Spinner                from './../../../components/Spinner'
import service                from './../../../services/service';
import { Dialog, FlatButton } from 'material-ui-02';
import Button                 from '@material-ui/core/Button';
let net = window.require('electron').remote.net;


export default class EditPlanDialog extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      pogoCustomDomain: "",
      pogoCustomDomain_err: "",
      email_err: "",
      failure: false,
      firstdisconnect: false,
      firstunsubscribe: false,
      busy: false,
      username: this.props.username,
      fingerprint: this.props.fingerprint
    }
  }
  componentDidMount(){
    service.getConfigurations().then((c)=>{
      var stateUpdate  = {};
      stateUpdate.pogostripeConn = c.global.pogostripeConn;
      stateUpdate.pogoboardConn = c.global.pogoboardConn;
      this.setState(stateUpdate);
    })
  }

  handleCancelClick = () => {
    this.props.onCancelClick();
  }

  handleUnsubscribeClick = async (context) => {
    if(this.props.pogoCustomDomain !== "not set"){
      this.setState({firstdisconnect: true});
      this.setState({firstunsubscribe: false});
    }
    else{

      let unsubVars = {
        username: this.props.username,
        fingerprint: this.props.fingerprint,
        projectPath:  this.props.sitePath,
      };

      let requestVars =btoa(JSON.stringify(unsubVars));
      let url = this.state.pogostripeConn.protocol+"//"+ this.state.pogostripeConn.host+":"+this.state.pogostripeConn.port+"/unsubscribe/"+requestVars;

      let data='';
      const request = net.request(url);
      request.on('response', (response) => {
        response.on('end', () => {
          let obj = JSON.parse(data);
          if(obj.status === 'canceled'){
            this.props.onUnsubscribeClick();
          }
          else {
            this.setState({
              failure: true
            });
          }
        });
        response.on("data", chunk => {
          data += chunk;
        });
      })
      request.end()

    }
  }

  handleDeleteSiteClick = async (context) => {
    if(this.props.pogoSiteStatus === "active"){
      this.setState({firstdisconnect: false});
      this.setState({firstunsubscribe: true});
    }
    else{
      this.setState({
        busy: true
      });

      if(!this.props.username||!this.props.sitePath||!this.props.fingerprint){
        this.setState({
          failure: true
        });

        this.setState({ busy: false });
        return
      }

      var postData = JSON.stringify({sitePath : this.props.sitePath, username: this.props.username, fingerprint: this.props.fingerprint});

      let promise = service.api.deleteSiteFromCloud(postData);
      promise.then((result)=>{
        if(result){
          this.props.onDeleteSiteFromCloudClick();
        }
        else{
          this.setState({
            failure: true
          });
        }
        this.setState({ busy: false });
      });


      this.setState({
        busy: false
      });
    }
  }

  handleDisconnectDomainClick = async (context) => {

    this.setState({
      busy: true
    });

    this.disconnectDomain(this.props.sitePath, this.props.username, this.props.fingerprint, this.props.pogoCustomDomain);
  }

  disconnectDomain(sitePath, username, fingerprint, disconnectDomainString){
    if(username===""){
      this.setState({
        failure: true
      });

      this.setState({ busy: false });
      return
    }

    var postData = JSON.stringify({sitePath : sitePath, username: username, fingerprint: fingerprint, disconnectDomainString: disconnectDomainString});

    let promise = service.api.disconnectPogoDomain(postData);
    promise.then((result)=>{
      if(result){
        let promise2 = service.api.createPogoDomainConf(sitePath, sitePath+".quiqr.cloud");
        promise2.then(()=>{
          //service.api.logToConsole('disconnect');
          this.props.onDisconnectDomainClick();
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

  handleTryAgain(){
    this.setState({
      pogoCustomDomain: "",
      busy: false,
      failure: false,
    });
  }

  renderForm(){
    let deleteSiteButton = ""
    deleteSiteButton = (
      <Button color="primary" style={{margin:'5px'}}  variant="contained"  onClick={this.handleDeleteSiteClick} >
        {"Delete Site from Cloud"}
      </Button>
    )

    let disconnectButton = ""
    if(this.props.pogoCustomDomain !== "not set"){
      disconnectButton = (
        <Button color="primary" style={{margin:'5px'}}  variant="contained"  onClick={this.handleDisconnectDomainClick} >
          {"Disconnect Custom Domain: " + this.props.pogoCustomDomain}
        </Button>
      )
    }

    let unsubscribeButton = ""
    if(this.props.pogoSiteStatus === "active"){
      unsubscribeButton = (
        <Button color="primary" style={{margin:'5px'}} variant="contained"  onClick={this.handleUnsubscribeClick} >
          {"Unsubscribe Plan"}
        </Button>
      )
    }

    return (
      <div>
        {disconnectButton}
        {unsubscribeButton}
        {deleteSiteButton}
      </div>
    )
  }

  renderFirstDisconnect(){
    return (
      <div style={{marginTop: "5px;"}}>
        Before you can unsubscribe you need to disconnect the domain {this.props.pogoCustomDomain} first.
      </div>
    )
  }


  renderFirstUnsubscribe(){
    return (
      <div style={{marginTop: "5px;"}}>
        Before you can delete your site from the Quiqr Cloud your need to unsubscribe the paid plan first.
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

    const actions = [
      <FlatButton
        label="Close"
        primary={false}
        onClick={this.handleCancelClick.bind(this)}
      />,
    ];

    return (
      <Dialog
        title="Edit plan"
        open={open}
        actions={actions}>

        { this.state.failure? this.renderFailure() : this.renderForm() }
        { this.state.firstdisconnect? this.renderFirstDisconnect() : undefined }
        { this.state.firstunsubscribe? this.renderFirstUnsubscribe() : undefined }
        { this.state.busy? <Spinner /> : undefined }
      </Dialog>
    );
  }

}
