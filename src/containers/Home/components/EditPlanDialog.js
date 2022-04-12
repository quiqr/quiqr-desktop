import * as React             from 'react';
import Spinner                from './../../../components/Spinner'
import service                from './../../../services/service';
import { Dialog, FlatButton } from 'material-ui-02';
import Button                 from '@material-ui/core/Button';


export default class EditPlanDialog extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      pogoCustomDomain: "",
      pogoCustomDomain_err: "",
      email_err: "",
      failure: false,
      firstdisconnect: false,
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

  handleUnsubscribeClick = async (context) => {
    if(this.props.pogoCustomDomain !== "not set"){
      this.setState({firstdisconnect: true});
    }
    else{
      this.props.onUnsubscribeClick();
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
          service.api.logToConsole('disconnect');
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

    let disconnectButton = ""
    if(this.props.pogoCustomDomain !== "not set"){
      disconnectButton = (
        <Button color="primary" style={{margin:'5px'}}  variant="contained"  onClick={this.handleDisconnectDomainClick} >
          {"Disconnect Custom Domain: " + this.props.pogoCustomDomain}
        </Button>

      )
    }

    return (
      <div>
        {disconnectButton}
        <Button color="secondary" style={{margin:'5px'}} variant="contained"  onClick={this.handleUnsubscribeClick} >
          {"Unsubscribe Plan"}
        </Button>

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

  renderFailure(){
    return (
      <div>
        Something went wrong. Please <button className="reglink" onClick={()=>this.handleTryAgain()}>try again.</button>
      </div>
    )
  }

  render(){
    let { open } = this.props;
    let busy = this.state.busy;
    let failure = this.state.failure;
    let firstdisconnect = this.state.firstdisconnect;

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

        { failure? this.renderFailure() : this.renderForm() }
        { firstdisconnect? this.renderFirstDisconnect() : undefined }
        { busy? <Spinner /> : undefined }
      </Dialog>
    );
  }

}
