import * as React                        from 'react';
import Spinner                           from './../../../../components/Spinner'
import service                           from './../../../../services/service';
import { Dialog, FlatButton, TextField } from 'material-ui-02';
let net = window.require('electron').remote.net;

export default class RegisterDialog extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      username: "",
      email: "",
      username_err: "",
      email_err: "",
      failure: false,
      busy: false,
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

  handleRegisterClick = async (context) => {

    this.setState({
      busy: true
    });

    let promise = service.api.createKeyPairQC();

    promise.then((pubkey)=>{
      this.registerUserPost(this.state.username, this.state.email, pubkey.pubkey, pubkey.pubkey_title);

    }, (e)=>{
      this.setState({
        busy: false
      });
    })
  }

  registerUserPost(username, email, pubkey, pubkey_title){
    var postData = JSON.stringify({username : username, email: email, pubkey: ""+pubkey, pubkey_title: ""+pubkey_title });

    let promise = service.api.registerPogoUser(postData);
    promise.then((userObj)=>{
      if(userObj){
        let promise = service.api.createPogoProfile(userObj);
        promise.then(()=>{
          this.props.onRegisterClick({
            username: this.state.username,
            email: this.state.email
          });
        });
      }
      else{
        this.setState({
          failure: true
        });
      }
      this.setState({
        busy: false
      });

    });

  }

  handleUserNameChange(e){

    let value = e.target.value;

    if(value!==''){

      let url = this.state.pogoboardConn.protocol+"//"+this.state.pogoboardConn.host+":"+this.state.pogoboardConn.port+"/stat/uname/"+value;
      let data='';

      const request = net.request(url);
      request.on('response', (response) => {

        response.on('end', () => {
          let obj = JSON.parse(data);

          if(obj.status !== "free"){
            this.setState({
              username_err: "username is "+obj.status
            });
          }
          else{
            this.setState({
              username_err: ""
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
      username: value,
    });

  }

  handleTryAgain(){
    this.setState({
      username: "",
      email: "",
      busy: false,
      failure: false,
    });

  }
  handleEmailChange(e){
    let value = e.target.value;
    this.setState({
      email: value,
    });

    if(value!==''){
      let url = this.state.pogoboardConn.protocol+"//"+this.state.pogoboardConn.host+":"+this.state.pogoboardConn.port+"/stat/email/"+value;
      let data='';

      const request = net.request(url);
      request.on('response', (response) => {

        response.on('end', () => {
          let obj = JSON.parse(data);

          if(obj.status !== "free"){
            this.setState({
              email_err: "email is "+obj.status
            });
          }
          else{
            this.setState({
              email_err: ""
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

  validate(){
    return !this.state.busy &&
      !this.state.failure &&
      this.state.username_err === '' &&
      this.state.email_err === '' &&
      this.state.username !== '' &&
      this.state.email !== '';
  }
  renderForm(){
    //let valid = this.validate();
    let busy = this.state.busy;
    return (
      <div>
        <TextField disabled={busy} errorText={this.state.username_err} floatingLabelText={'username'} value={this.state.username} onChange={(e)=>{this.handleUserNameChange(e)}} fullWidth />
        <TextField disabled={busy} errorText={this.state.email_err} floatingLabelText={'email address'} value={this.state.email} onChange={(e)=>{this.handleEmailChange(e)}} fullWidth />
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
      label="Sign up"
      primary={true}
      onClick={this.handleRegisterClick}
    />,
    ];

    return (
      <Dialog
      title="Sign up for free publishing with Quiqr Live"
      open={open}
      actions={actions}>

      { failure? this.renderFailure() : this.renderForm() }
      { busy? <Spinner /> : undefined }
    </Dialog>
    );
  }

}
