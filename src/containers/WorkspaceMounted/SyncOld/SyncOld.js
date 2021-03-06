import { Route }               from 'react-router-dom';
import React                   from 'react';
import service                 from './../../../services/service';
import { snackMessageService } from './../../../services/ui-service';
import { RaisedButton }        from 'material-ui-02/';
import {List, ListItem}        from 'material-ui-02/List';
import IconAccountCircle       from 'material-ui-02/svg-icons/action/account-circle';
import IconDomain              from 'material-ui-02/svg-icons/social/domain';
import IconPublish             from 'material-ui-02/svg-icons/editor/publish';
import ActionThumbUp           from 'material-ui-02/svg-icons/action/thumb-up'
import muiThemeable            from 'material-ui-02/styles/muiThemeable';

import PublishSiteDialog       from './components/PublishSiteDialog';
import RegisterDialog          from './components/RegisterDialog';
import ClaimDomainDialog       from './components/ClaimDomainDialog';
import ConnectDomainDialog     from './components/ConnectDomainDialog';
import EditPlanDialog          from './components/EditPlanDialog';

import BlockDialog             from './../../../components/BlockDialog';
import Spinner                 from './../../../components/Spinner';
import ProgressDialog          from './../../../components/ProgressDialog';
import SnackbarManager         from './../../../components/SnackbarManager';

let net = window.require('electron').remote.net;

const styles = {
  container:{
    display:'flex',
    height: '100%'
  },
  sitesCol: {
    flex: '0 0 280px',
    overflowY:'auto',
    overflowX:'hidden',
    userSelect:'none',
    borderRight: 'solid 1px #e0e0e0',
    background:'#fafafa'
  },
  selectedSiteCol: {
    flex: 'auto',
    overflow: 'auto'
  },
  siteActiveStyle: {
    fontWeight: 'bold',
    backgroundColor: 'white',
    borderBottom: 'solid 1px #e0e0e0',
    borderTop: 'solid 1px #e0e0e0',
    position: 'relative'
  },
  siteInactiveStyle: {
    borderBottom: 'solid 1px transparent',
    borderTop: 'solid 1px transparent'
  },
  creatorMessage: {
    borderBottom: 'solid 1px transparent',
    borderTop: 'solid 1px #ccc',
    padding: '0 20px ',
    fontSize: '80%'
  }
}


function NotificationPanel(props){
  return (
    <div class="notificationPanel row" style={{color: "white", padding: "10px 44px",backgroundColor:"rgb(0, 188, 212)"}}>
      {props.children}
    </div>
  )
}

class Sync extends React.Component{

  history: any;

  constructor(props){
    super(props);
    this.state = {
      blockingOperation: null,
      currentSiteKey: null,
      publishSiteDialog: undefined,
      registerDialog: {open: false},
      editPlanDialog: {open: false},
      claimDomainDialog: {open: false},
      pogostripeConn: {protocol: ''},
      username: "",
      pogoAccountStatus: "",
      pogoCustomDomain: "not set",
      pogoCustomDomainDNSStatus: "unknown", //unknown/reachable/unreachable
      pogoSiteStatus: "",
      pogoPublishStatus: "",
      oneTimeOnlySiteActive: false,
      oneTimeOnlyPublishFinished: false,
      fingerprint: "",
      buttonPressed: "",

      progressDialogConf: {
        title: '',
        message: '',
        percent: 0,
        visible: false,
      },

    };
    this._ismounted = false;
  }

  componentDidUpdate(preProps: HomeProps){
    if(this._ismounted && preProps.siteKey !== this.props.siteKey){
      this.checkSiteInProps();
    }

    if(this._ismounted && preProps.quiqrUsername !== this.props.quiqrUsername){
      this.setUser(this.props.quiqrUsername, this.props.quiqrFingerprint);
    }
  }

  componentWillUnmount(){
    this._ismounted = false;
    [
      'frontEndBusy',
      'setProgressDialogConf',
    ].forEach((channel)=>{
      window.require('electron').ipcRenderer.removeAllListeners(channel);
    });
  }

  componentDidMount(){
    window.require('electron').ipcRenderer.on('frontEndBusy', ()=>{
      this.setState({showSpinner: true});
    });

    window.require('electron').ipcRenderer.on('setProgressDialogConfHome', (event, confObj)=>{
      this.setState({progressDialogConf: confObj});
    });

    this.checkSiteInProps();
    this._ismounted = true;
    this.setUser(this.props.quiqrUsername, this.props.quiqrFingerprint);
  }

  setUser(username,fingerprint){
    this.setState({username: username, fingerprint: fingerprint},function(){
      this.getRemoteSiteStatus(false);
    });
  }

  checkSiteInProps(){

    var { siteKey, workspaceKey } = this.props;

    service.getConfigurations(true).then((c)=>{
      var stateUpdate  = {};
      stateUpdate.pogostripeConn = c.global.pogostripeConn;
      stateUpdate.pogoboardConn = c.global.pogoboardConn;

      this.setState(stateUpdate,function(){
      });
    });

    if(siteKey && workspaceKey){

      if(this.state.currentSiteKey !== siteKey){
        service.api.readConfKey('devDisableAutoHugoServe').then((devDisableAutoHugoServe)=>{
          if(!devDisableAutoHugoServe){
            service.api.serveWorkspace(siteKey, workspaceKey, "Start Hugo from Home");
          }
        });
      }

      this.setState({currentSiteKey: siteKey});
      this.setState({currentWorkspaceKey: workspaceKey});

      service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle)=>{
        var stateUpdate  = {};
        stateUpdate.configurations = bundle.configurations;
        stateUpdate.selectedSite = bundle.site;

        stateUpdate.selectedSiteWorkspaces = bundle.siteWorkspaces;
        stateUpdate.selectedWorkspace = bundle.workspace;
        stateUpdate.selectedWorkspaceDetails = bundle.workspaceDetails;

        this.setState(stateUpdate);

        this.getRemoteUserStatus(false);
        this.getRemoteSiteStatus(false);

        this.getRemotePublishStatus(false);
        //this.getRemoteDomainVerification(false);

      })
    }
    else{
      service.getConfigurations(true).then((c)=>{
        var stateUpdate  = {};
        stateUpdate.configurations = c;
        this.setState(stateUpdate);
      })
    }
  }

  handlePublishNow(pressed){

    if(this.state.pogoSiteStatus === "noAccess"|| this.state.username === ""){
      snackMessageService.addSnackMessage("You're not allowed to publish to this pogocloud-path");
      return;
    }
    //EXAMPLE Snack Message

    let workspace = this.state.selectedWorkspaceDetails;
    let workspaceHeader = this.state.selectedSiteWorkspaces[0];
    service.api.parentTempHideMobilePreview();

    if(pressed){
      this.setState({buttonPressed:"publish"});
    }
    this.setState({requestDialog:"publish"});

    if(this.state.username === ""){
      this.handleRegisterNow();
    }
    else if(!this.checkLinkedPogoCloudPath()){
      this.handleClaimDomainNow(false);
    }
    else{
      this.setState({publishSiteDialog: {workspace, workspaceHeader, open: true}});
    }
  }

  handleRegisterNow(){
    this.setState({requestDialog:"register"});
    service.api.parentTempHideMobilePreview();
    this.setState({registerDialog: { open: true}});
  }

  handleConnectDomain(){
    service.api.parentTempHideMobilePreview();
    this.setState({connectDomainDialog: { open: true}});
  }
  handleDisconnectDomain(){
    service.api.parentTempHideMobilePreview();
    this.setState({disconnectDomainDialog: { open: true}});
  }

  handleEditPlan(){
    service.api.parentTempHideMobilePreview();
    this.setState({editPlanDialog: { open: true}});
  }


  startDomVerificationPolling(celebrate){
    if(this.state.pogoCustomDomainDNSStatus === "reachable"){
      let time=3000;
      this.timeout = setTimeout(() => {
        this.getRemoteDomainVerification(celebrate);
      }, time)
    }
  }

  startPublishPolling(celebrate){
    let site = this.state.selectedSite;
    if(site.hasOwnProperty('publishStatus') && site.publishStatus === 2){
      let time=3000;
      this.timeout = setTimeout(() => {
        this.getRemotePublishStatus(celebrate);
      }, time)
    }
  }

  startPendingUpgradePolling(celebrate){

    if(this.state.pogoSiteStatus === "no_plan"){
      let time=3000;
      this.timeout = setTimeout(() => {
        this.getRemoteSiteStatus(celebrate);
      }, time)
    }
  }

  startUnconfirmedUserPolling(celebrate){

    if(this.state.pogoAccountStatus === "unconfirmed_member"){

      let time=3000;
      this.timeout = setTimeout(() => {
        this.getRemoteUserStatus(celebrate);
      }, time)
    }
  }

  handleRegisterClick(username, email){

    this.setState({
      username: username,
      registerDialog: {...this.state.registerDialog, open:false
      }},()=>{

        this.setState({pogoAccountStatus: "unconfirmed_member"},function(){
          this.startUnconfirmedUserPolling(true);
        })

        if(this.state.buttonPressed === 'publish'){
          this.handlePublishNow(false);
        }
        else if(this.state.buttonPressed === 'claim'){
          this.handleClaimDomainNow(false);
        }
        else{
          this.history.push('/sites/'+this.state.currentSiteKey+'/workspaces/'+this.state.currentWorkspaceKey+"/home/"+Math.random());
        }
      });
  }

  handleClaimDomainNow(pressed){
    this.setState({requestDialog:"claim"});

    if(pressed){
      this.setState({buttonPressed:"claim"});
    }
    if(this.state.username === ""){
      this.handleRegisterNow();
    }
    else{
      service.api.parentTempHideMobilePreview();
      this.setState({claimDomainDialog: { open: true}});
    }
  }

  handleClaimDomainClick(obj){

    service.getConfigurations(true).then((c)=>{

      service.getSiteAndWorkspaceData(this.state.currentSiteKey, this.state.currentWorkspaceKey).then((bundle)=>{
        var stateUpdate  = {};
        stateUpdate.configurations = bundle.configurations;
        stateUpdate.selectedSite = bundle.site;
        stateUpdate.selectedSiteWorkspaces = bundle.siteWorkspaces;
        stateUpdate.selectedWorkspace = bundle.workspace;
        stateUpdate.selectedWorkspaceDetails = bundle.workspaceDetails;

        stateUpdate.claimDomainDialog = {...this.state.claimDomainDialog, open:false};

        this.setState(stateUpdate,()=>{
          snackMessageService.addSnackMessage('You just got yourself a shiny new site in the Quiqr Cloud.');
          this.getRemoteSiteStatus(false);

          if(this.state.buttonPressed === 'publish'){
            this.handlePublishNow(false);
          }
        });
      })
    });
  }

  handleConnectDomainClick(){
    this.history.push('/sites/'+this.state.currentSiteKey+'/workspaces/'+this.state.currentWorkspaceKey+"/home/"+Math.random());
  }

  handleDeleteSiteFromCloudClick(){
    this.history.push('/sites/'+this.state.currentSiteKey+'/workspaces/'+this.state.currentWorkspaceKey+"/home/"+Math.random());
  }

  handleDisconnectDomainClick(){

    this.history.push('/sites/'+this.state.currentSiteKey+'/workspaces/'+this.state.currentWorkspaceKey+"/home/"+Math.random());
  }

  checkLinkedPogoCloudPath(){
    let site = this.state.selectedSite;
    if(site){
      if( site.publish.length === 1
        && site.publish[0].config.type === 'quiqr'
        && site.publish[0].config.hasOwnProperty('path')){

        return true;
      }
    }
    return false;
  }

  getPogoCloudPath(){
    let site = this.state.selectedSite;
    if(this.checkLinkedPogoCloudPath()){
      return site.publish[0].config.path;
    }
    return ""
  }

  getRemoteUserStatus(celebrate){

    if(this.state.pogostripeConn.protocol === "" && this.state.fingerprint === ""){
      return;
    }

    let userVars = {
      username: this.state.username,
      fingerprint: this.state.fingerprint,
    };

    let requestVars =btoa(JSON.stringify(userVars));

    let url = this.state.pogostripeConn.protocol+"//"+
      this.state.pogostripeConn.host+":"+
      this.state.pogostripeConn.port+"/myaccount-status/"+requestVars;

    let data='';

    try {
      const request = net.request(url);
      request.on('error', (err) => {
      });

      request.on('response', (response) => {
        response.on('end', () => {
          let obj = JSON.parse(data);

          this.setState({stripe_customer_id: obj.stripe_customer_id});

          if( obj.hasOwnProperty('pogo_account_status') && obj.pogo_account_status !== ""){
            this.setState({pogoAccountStatus: obj.pogo_account_status});

            if(obj.pogo_account_status === "confirmed_member" && celebrate){
              snackMessageService.addSnackMessage('Well done.. you confirmed you\'re email address succesfully.');
            }
          }
          else if (obj.hasOwnProperty('pogo_email')){
            this.setState({pogoAccountStatus: "unconfirmed_member"})
            this.startUnconfirmedUserPolling(true);
          }
        });
        response.on("data", chunk => {
          data += chunk;
        });
      })
      request.end()

    } catch (e) {
      console.log('catch', e);
    }
  }

  getRemoteDomainVerification(celebrate){


    if(this.state.pogoCustomDomain === "not set"){
      return
    }

    let projectPath = this.state.selectedSite.publish[0].config.path;
    let url = "http://"+this.state.pogoCustomDomain+"/.pogo_with_me"

    let data='';
    const request = net.request(url);

    request.on('error', (err) => {
      this.setState({pogoCustomDomainDNSStatus:"unreachable"});
      this.startDomVerificationPolling(true);
    });

    request.on('response', (response) => {
      response.on('error', (error) => {
      })

      response.on('end', () => {
        let obj = JSON.parse(data);

        if (obj.path === projectPath){
          this.setState({oneTimeOnlyPublishFinished: true});
          this.setState({pogoCustomDomainDNSStatus:"reachable"});
        }
        else{
          this.setState({pogoCustomDomainDNSStatus:"unreachable"});
          this.startDomVerificationPolling(true);
        }
      });
      response.on("close", () => {
      });
      response.on("data", chunk => {
        data += chunk;
      });
    })
    request.end()
  }

  getRemotePublishStatus(celebrate){
    if(!this.state.selectedSite){
      return;
    }

    if(!this.checkLinkedPogoCloudPath()){
      return;
    }

    let projectPath = this.state.selectedSite.publish[0].config.path;
    let url = "http://"+projectPath+".quiqr.cloud/.pogo_with_me"



    try {

      let data='';
      const request = net.request(url);
      request.on('response', (response) => {

        response.on('end', () => {
          let obj = JSON.parse(data);
          service.api.setPublishStatus(1)

          if (obj.path === projectPath){
            this.setState({oneTimeOnlyPublishFinished: true});
          }
          else{
            this.startPublishPolling(true);
          }
        });
        response.on("data", chunk => {
          data += chunk;
        });
      })
      request.end()

    } catch (e) {
    }
  }

  getSitePermissions(){

  }


  getRemoteSiteStatus(celebrate){
    if(!this.state.selectedSite){
      return;
    }



    if(!this.checkLinkedPogoCloudPath()){
      this.setState({
        pogoSiteStatus: "no_pogocloud"
      })

      return
    }

    let userVars = {
      username: this.state.username,
      fingerprint: this.state.fingerprint,
      projectPath:  this.state.selectedSite.publish[0].config.path,
    };

    let requestVars = btoa(JSON.stringify(userVars));

    let url = this.state.pogostripeConn.protocol+"//"+ this.state.pogostripeConn.host+":"+ this.state.pogostripeConn.port+"/project-status/"+requestVars;

    let data='';

    try {
      const request = net.request(url);
      request.on('error', (err) => {
      });

      request.on('response', (response) => {
        response.on('end', () => {

          if(response.statusCode === 403){
            this.setState({pogoSiteStatus: "noAccess"});
          }
          else{
            let obj = JSON.parse(data);

            let custom_domain = "not set"
            let defaultDomain = `${this.getPogoCloudPath()}.quiqr.cloud`;
            if (obj.hasOwnProperty('pogo_custom_domain')){
              custom_domain = obj.pogo_custom_domain;
              defaultDomain = obj.pogo_custom_domain;
            }

            this.setState({
              pogoSiteStatus:     obj.pogo_plan_status,
              pogoStripeSubscrID: obj.pogo_plan_stripe_subscription_id,
              pogoUserRole:       obj.role,
              pogoSitePlan:       obj.pogo_plan_name,
              pogoCustomDomain:   custom_domain,
              defaultDomain:      defaultDomain,
            },function(){


              if(this.state.pogoSiteStatus === "active"){
                if(celebrate) this.setState({oneTimeOnlySiteActive: true});
                this.getRemoteDomainVerification(false);

              }
              else {
                this.startPendingUpgradePolling(true);
              }

            }

            );

            if(this.state.pogoSiteStatus === "active" && celebrate){
              this.setState({oneTimeOnlySiteActive: true});
            }
          }

        });
        response.on("data", chunk => {
          data += chunk;
        });
      })

      request.end()

    } catch (e) {
    }

  }

  handleUnsubscribeClick(){

    this.setState({editPlanDialog: {...this.state.editPlanDialog, open:false}});
    this.setState({
      oneTimeOnlySiteActive: false,
      pogoSiteStatus: "no_plan"
    });
  }

  handleUpgradeLinkedSite(pressed){

    if(this.state.pogoAccountStatus === "unconfirmed_member"){
      snackMessageService.addSnackMessage('You need to confirm your email. Please check your mail.');
    }
    else{
      this.setState({pogoSiteStatus: "no_plan"},function(){
        this.startPendingUpgradePolling(true);
      })

      let upgradeVars = {
        username: this.state.username,
        fingerprint: this.state.fingerprint,
        projectPath:  this.state.selectedSite.publish[0].config.path,
        plan: "Quiqr Pro"
      };

      let requestVars =btoa(JSON.stringify(upgradeVars));
      let url = this.state.pogostripeConn.protocol+"//"+ this.state.pogostripeConn.host+":"+this.state.pogostripeConn.port+"/upgrade/"+requestVars;
      window.require('electron').shell.openExternal(url);
    }
  }

  handleResendConfirmationMail(){
    var postData = JSON.stringify({ username: this.state.username, fingerprint: this.state.fingerprint});
    let promise = service.api.resendConfirmationLinkPogoUser(postData);
    promise.then((result)=>{
      if(result){
        snackMessageService.addSnackMessage('Confirmation mail has been sent.');
      }
    });
  }

  handleOpenCustomDomainDocs(){
    window.require('electron').shell.openExternal('https://book.quiqr.org/docs/03-quiqr-cloud-services/01-quiqr-cloud-hosting/01-custom-domain/');
  }

  handleOpenTerms(){
    window.require('electron').shell.openExternal('https://quiqr.org/terms');
  }

  handleOpenPro(){
    window.require('electron').shell.openExternal('https://quiqr.org/plans/quiqr-pro/');
  }

  hasActivePlan(pogoSiteStatus){

    if(pogoSiteStatus === "active" || pogoSiteStatus === "expired_soon"){
      return true;
    }
    return false;
  }

  handleBuildAndPublishClick = ({siteKey, workspaceKey, build, publish}) => {

    service.api.parentTempUnHideMobilePreview();

    this.setState({blockingOperation: 'Building site...', publishSiteDialog: undefined});

    service.api.buildWorkspace(siteKey, workspaceKey, build).then(()=>{
      this.setState({blockingOperation: 'Publishing site...'});

      service.api.publishSite(siteKey, publish).then(()=>{
        //this.startPublishPolling(true);
      });

    }).then(()=>{

    }).catch(()=>{
      snackMessageService.addSnackMessage('Publish failed.');
    }).then(()=>{
      this.setState({blockingOperation: null});
    })
  }

  renderNotificationPanel(){

    if(this.state.pogoAccountStatus === "no_member") {

      return <NotificationPanel>Register with you email to claim a pogosite domain</NotificationPanel>

    }
    else if(this.state.pogoAccountStatus === "unconfirmed_member"){
      return <NotificationPanel>
        Please confirm your email by clicking the link in the confirmation mail or&nbsp;
        <button className="reglink" onClick={()=>{this.handleResendConfirmationMail()}}>resend confirmation mail</button>
      </NotificationPanel>

    }
    /*
    else if(this.state.pogoSiteStatus === "no_plan"){
      return (
        <NotificationPanel>
          <span style={{color:"white"}}>Upgrade pending. <button className="reglink" onClick={()=>{ this.handleUpgradeLinkedSite(true); }}>Finish upgrade in browser.</button></span>
        </NotificationPanel>
      )
    }
    */
    else if (this.state.oneTimeOnlySiteActive === true) {
      return (
        <NotificationPanel>
          Congratulations, you just upgraded your website to &nbsp;<strong>{this.state.pogoSitePlan}</strong>
        </NotificationPanel>
      )
    } else if (this.state.pogoCustomDomainDNSStatus === "reachable") {
      return (
        <NotificationPanel>
          Congratulations, you succesfully connected to &nbsp;
          <button className="reglink" style={{fontWeight:"bold"}} onClick={()=>{
            window.require('electron').shell.openExternal("http://"+this.state.defaultDomain);
          }}>{this.state.defaultDomain}</button>
        </NotificationPanel>
      )
    }
  }

  renderActionPanel(){
    if(this.state.pogoUserRole === "owner" && this.checkLinkedPogoCloudPath() && this.state.pogoSiteStatus !== ""){

      if(this.state.pogoSiteStatus === "no_plan"){
        return this.renderActionUpgadePanel();
      }
      else if(this.state.pogoSiteStatus === "no_plan"){
        return this.renderActionUpgadePanel();
      }

      else if(this.state.pogoSiteStatus === "active"){

        if(this.state.pogoCustomDomain === "not set") {
          return this.renderActionConnectDomainPanel();
        }
        if (this.state.pogoCustomDomainDNSStatus === "unreachable") {
          return this.renderActionAdviseDNSPanel();
        }
      }
      else if(this.state.pogoSiteStatus === "expired_soon"){
        return this.renderActionExtendPanel();
      }
      else if(this.state.pogoSiteStatus === "expired"){
        return this.renderActionUpgadePanel();
      }
    }
  }

  renderActionUpgadePanel(){
    return (
      <div class="row" style={{color: "white", padding: "0px 24px",backgroundColor:"#b6b6b6"}}>
        <div class="col-12 col-lg-8" style={{padding:"0px"}}>
          <ListItem leftIcon={<ActionThumbUp color="#2f343c" style={{marginTop:"28px"}} />} disabled={true}  >
            <span>
              <h2>Upgrade to Quiqr Pro</h2>
              <ul>
                <li>Use your own domain</li>
                <li>Secure your site hosting</li>
              </ul>
            </span>
            <br/>
          </ListItem>
        </div>
        <div class="col-8 offset-4 offset-lg-0 col-lg-4" style={{padding:"0px"}}>
          <ListItem disabled={true} class="actionpanel"  >
            <h3>???3,- per month</h3>
            <RaisedButton primary={true} label="Upgrade now" disabled={false} onClick={()=>{ this.handleUpgradeLinkedSite(true);}} /><br/>
            <button className="reglink" onClick={()=>{this.handleOpenPro()}}>More information</button>
          </ListItem>
        </div>
      </div>
    )
  }

  renderActionConnectDomainPanel(){
    return (
      <div class="row" style={{color: "white", padding: "0px 24px",backgroundColor:"#b6b6b6"}}>
        <div class="col-12 col-lg-8" style={{padding:"0px"}}>
          <ListItem leftIcon={<IconDomain color="#2f343c" style={{marginTop:"28px"}} />} disabled={true}  >
            <h3>Connect your custom domain</h3>
            <p> With Quiqr Pro now you can </p>
          </ListItem>
        </div>
        <div class="col-8 offset-4 offset-lg-0 col-lg-4" style={{padding:"0px"}}>
          <ListItem disabled={true} class="actionpanel"  >
            <h2> </h2>
            <RaisedButton primary={true} label="Connect now" disabled={false} onClick={()=>{ this.handleConnectDomain();}} /><br/>
            <button className="reglink" onClick={()=>{this.handleOpenCustomDomainDocs()}}>See the documentation</button>
          </ListItem>
        </div>
      </div>
    )
  }

  renderActionAdviseDNSPanel(){
    return (
      <div class="row" style={{color: "white", padding: "0px 24px",backgroundColor:"#b6b6b6"}}>
        <div class="col-12 col-lg-8" style={{padding:"0px"}}>
          <ListItem leftIcon={<ActionThumbUp color="#2f343c" style={{marginTop:"28px"}} />} disabled={true}  >
            <span>
              <h2>You're almost there!</h2><h3>Change your DNS settings </h3>
              <pre>
                A-record        99.81.100.114<br/>
                AAAA-record:    99.81.100.114
              </pre>
            </span>
            <br/>
          </ListItem>
        </div>
        <div class="col-8 offset-4 offset-lg-0 col-lg-4" style={{padding:"0px"}}>
          <ListItem disabled={true} class="actionpanel"  >
            <RaisedButton primary={true} label="Close this panel" disabled={false} onClick={()=>{
              this.setState({pogoCustomDomainDNSStatus:'unknown'});
            }} /><br/>
            <button className="reglink" onClick={()=>{this.handleOpenCustomDomainDocs()}}>More information</button>
          </ListItem>
        </div>
      </div>
    )
  }

  renderActionExtendPanel(){
    return (
      <div class="row" style={{color: "white", padding: "0px 24px",backgroundColor:"#b6b6b6"}}>
        <div class="col-12 col-lg-8" style={{padding:"0px"}}>
          <ListItem leftIcon={<ActionThumbUp color="#2f343c" style={{marginTop:"28px"}} />} disabled={true}  >
            <span>
              <h2>Upgrade to Quiqr Pro</h2>
              <ul>
                <li>Use your own domain</li>
                <li>Secure your site hosting</li>
              </ul>
            </span>
            <br/>
          </ListItem>
        </div>
        <div class="col-8 offset-4 offset-lg-0 col-lg-4" style={{padding:"0px"}}>
          <ListItem disabled={true} class="actionpanel"  >
            <h3>???3,- per month</h3>
            <RaisedButton primary={true} label="Upgrade now" disabled={false} onClick={()=>{ this.handleUpgradeLinkedSite(true);}} /><br/>
            <button className="reglink" onClick={()=>{this.handleOpenPro()}}>More information</button>
          </ListItem>
        </div>
      </div>
    )
  }

  renderUserInfoActions(){
    if(this.state.username!==""){

      let accountStatusMsg = ""

      if(this.state.pogoAccountStatus === "unconfirmed_member"){
        accountStatusMsg = (
          <span><br/>
            Check your email for a confirmation mail or <button className="reglink" onClick={()=>{this.handleResendConfirmationMail()}}>resend confirmation mail</button>
          </span>
        )
      }
      let roleStatus = "";
      if(this.state.pogoUserRole){
        roleStatus = <span><br/>you are {this.state.pogoUserRole} of this site.</span>
      }

      return (
        <ListItem leftIcon={<IconAccountCircle color="" style={{}} />} disabled={true} >
          <span style={{fontWeight: "bold", fontSize:"110%"}}>Hi {this.state.username}</span>
          {roleStatus}
          {accountStatusMsg}
        </ListItem>
      );
    }
    else {
      return (
        <ListItem leftIcon={<IconAccountCircle color="#49545" style={{}} />} disabled={true} >
          <span style={{fontWeight: "normal", fontSize:"100%"}}>Create an account for publishing</span>
          &nbsp;&nbsp;<button className="reglink" onClick={()=>{this.handleRegisterNow()}}>Register now!</button>
        </ListItem>
      )
    }
  }

  renderPublishButton(){
    if(this.state.pogoSiteStatus !== "noAccess" && this.state.username !== ""){
      return (
        <div style={Object.assign({position : 'relative',padding: "0px 16px 16px 30px", width:'100%', display:'flex'})}>
          <RaisedButton primary={true} label="Publish" onClick={()=>{ this.handlePublishNow(true) }} />
          <div style={{ border: 'solid 0px green', marginLeft: 'auto', marginTop: 13 }}>
            <button className="reglink" onClick={()=>{this.handleOpenTerms()}}>Terms and Conditions</button>
          </div>
        </div>
      )
    }
  }

  renderPogoCloudPathInfo(){

    if(this.state.pogoSiteStatus === "no_pogocloud"){
      return  (
        <ListItem leftIcon={<IconDomain color="" style={{}} />} disabled={true} >
          <span style={{fontWeight: "normal", fontSize:"100%"}}>Claim a Quiqr Cloud live URL for {this.state.selectedSite.name} </span>
          &nbsp;&nbsp;<button className="reglink" onClick={()=>{this.handleClaimDomainNow(true)}}>claim now!</button>
        </ListItem>
      )
    }
    else if( this.state.pogoSiteStatus === "noAccess" || this.state.username === "" ){
      return(
        <ListItem leftIcon={<IconDomain color="" style={{}} />} disabled={true} >
          <span style={{fontWeight: "normal", fontSize:"110%"}}>
            You are not allowed to publish to this site in the pogocloud.
          </span>

        </ListItem>
      )
    }
    else if(this.checkLinkedPogoCloudPath()){

      /*
      let disconnectButton = ""
      if( this.state.pogoCustomDomain !== "not set"){
        disconnectButton = <button className="reglink" onClick={()=>{this.handleDisconnectDomain()}}>disconnect custom domain</button>
      }
      */

      let editPlanButton = ""

      if(this.state.pogoUserRole === "owner"){
        editPlanButton = <span style={{marginLeft:"50px"}}><button className="reglink" onClick={()=>{this.handleEditPlan()}}>edit plan</button></span>
      }
      /*
      if(this.state.pogoSiteStatus === "active" && this.state.pogoUserRole === "owner"){
        editPlanButton = <span style={{marginLeft:"50px"}}><button className="reglink" onClick={()=>{this.handleEditPlan()}}>edit plan</button></span>
      }
      */

      /*
      let ownerInfo = ""
      if(this.state.pogoSiteStatus === "noAccess"){
        ownerInfo = <div>This domain is owned by somebody else</div>
      }
      */

      let planInfo = ""
      if(this.state.pogoSiteStatus === "active"){
        planInfo = <span>with <strong>{this.state.pogoSitePlan}</strong></span>
      } else if (this.state.pogoSiteStatus !== "active") {
        planInfo = <strong>as a temporary URL</strong>
      }

      return (
        <ListItem leftIcon={<IconDomain color="" style={{}} />} disabled={true} >
          <span style={{fontWeight: "normal", fontSize:"110%"}}>The site is live at &nbsp;

            <button className="reglink" style={{fontWeight:"bold"}} onClick={()=>{
              window.require('electron').shell.openExternal("http://"+this.state.defaultDomain);
            }}>{this.state.defaultDomain}</button> &nbsp;
            {planInfo}{editPlanButton}
          </span>

        </ListItem>
      )
    }

    else{
      return (null);
    }
  }

  renderPublishInfo(){

    if(this.state.selectedSite.hasOwnProperty('publishStatus') && this.state.selectedSite.publishStatus === 2){

    }

    if(this.state.selectedSite.hasOwnProperty('lastPublish') && this.state.selectedSite.lastPublish !== 0){

      let ts;
      if(this.state.selectedSite.lastPublish === 1){
        ts = "";
      }
      else {
        ts = new Date(this.state.selectedSite.lastPublish).toString().split("GMT")[0]
        return (
          <ListItem leftIcon={<IconPublish color="" style={{}} />} disabled={true} >
            <span style={{fontWeight: "normal", fontSize:"100%"}}>Latest publication {ts}{/* - All work is published!*/}</span>
          </ListItem>
        )
      }
    }
    else{
      return (
        <ListItem leftIcon={<IconPublish color="" style={{}} />} disabled={true} >
          <span style={{fontWeight: "normal", fontSize:"100%"}}>{this.state.selectedSite.name} is not yet published</span>
        </ListItem>
      )
    }
  }

  renderPogoSiteActionsAndInfo(){

    if(this.state.pogoSiteStatus !== ""){
      return(
        <div>
          <div style={{padding: "0px 16px"}}>
            <List>
              {this.renderUserInfoActions()}
              {this.renderPogoCloudPathInfo()}
              {this.renderPublishInfo()}
            </List>
          </div>

          {this.renderPublishButton()}

          { this.renderNotificationPanel() }

        </div>
      )

    }
  }

  render(){

    let { configurations } = this.state;

    if( this.state.showSpinner || configurations == null || this.state.selectedSite == null ){
      return <Spinner />
    }

    let pogoCloudPath = this.getPogoCloudPath();

    return (
      <Route render={({history}) => {
        this.history = history;

        return (
          <div style={ styles.container }>
            <div style={styles.selectedSiteCol}>
              <div style={Object.assign({padding:'16px 0', paddingTop: '16px'})}>
                { this.renderPogoSiteActionsAndInfo() }
                { this.renderActionPanel() }
              </div>
            </div>

            {/* HIDDEN DIALOGS BELOW */}

            <SnackbarManager />

            <BlockDialog open={this.state.blockingOperation != null }> {this.state.blockingOperation} </BlockDialog>

            {this.renderPublishSiteDialog()}

            <RegisterDialog
              onCancelClick={()=>{
                this.setState({registerDialog: {...this.state.registerDialog, open:false}});
                service.api.parentTempUnHideMobilePreview();
              }}
              onRegisterClick={({username, email})=>{ this.handleRegisterClick(username, email) }}
              open={this.state.registerDialog != null && this.state.registerDialog.open}
            />

            <ClaimDomainDialog
              onCancelClick={()=>{
                this.setState({claimDomainDialog: {...this.state.claimDomainDialog, open:false}});
                service.api.parentTempUnHideMobilePreview();
              }}
              onClaimDomainClick={(obj)=>{ this.handleClaimDomainClick(obj) }}
              username={this.state.username}
              fingerprint={this.state.fingerprint}
              open={this.state.claimDomainDialog != null && this.state.claimDomainDialog.open}
            />

            <ConnectDomainDialog
              onCancelClick={()=>{
                this.setState({connectDomainDialog: {...this.state.connectDomainDialog, open:false}});
                service.api.parentTempUnHideMobilePreview();
              }}
              onConnectDomainClick={(obj)=>{ this.handleConnectDomainClick() }}
              username={this.state.username}
              sitePath={pogoCloudPath}
              fingerprint={this.state.fingerprint}
              open={this.state.connectDomainDialog != null && this.state.connectDomainDialog.open}
            />

            <EditPlanDialog
              onCancelClick={()=>{
                this.setState({editPlanDialog: {...this.state.editPlanDialog, open:false}});
                service.api.parentTempUnHideMobilePreview();
              }}
              onDeleteSiteFromCloudClick={()=>{ this.handleDeleteSiteFromCloudClick() }}
              onDisconnectDomainClick={()=>{ this.handleDisconnectDomainClick() }}
              onUnsubscribeClick={()=>{ this.handleUnsubscribeClick() }}
              username={this.state.username}
              pogoCustomDomain={this.state.pogoCustomDomain}
              pogoSiteStatus={this.state.pogoSiteStatus}
              pogoStripeSubscrID={this.state.pogoStripeSubscrID}
              sitePath={pogoCloudPath}
              fingerprint={this.state.fingerprint}
              open={this.state.editPlanDialog!=null&&this.state.editPlanDialog.open}
            />

            <ProgressDialog
              conf={this.state.progressDialogConf}
            />


          </div>
        )
      }}/>

    );
  }

  renderPublishSiteDialog(){
    if ( this.state.publishSiteDialog != null ){
      return (

        <PublishSiteDialog
          site={this.state.selectedSite}
          workspace={this.state.publishSiteDialog.workspace}
          workspaceHeader={this.state.publishSiteDialog.workspaceHeader}
          onCancelClick={()=>{
            this.setState({publishSiteDialog: {...this.state.publishSiteDialog, open:false}});
            service.api.parentTempUnHideMobilePreview();
          }}
          onBuildAndPublishClick={this.handleBuildAndPublishClick}
          open={this.state.publishSiteDialog!=null&&this.state.publishSiteDialog.open}
        />

      )
    }
  }
}

export default muiThemeable()(Sync);
