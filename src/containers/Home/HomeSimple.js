import { Route } from 'react-router-dom';
import React from 'react';
import service from './../../services/service';
import { snackMessageService } from './../../services/ui-service';
import { RaisedButton } from 'material-ui-02/';
import {List, ListItem} from 'material-ui-02/List';
import IconAccountCircle from 'material-ui-02/svg-icons/action/account-circle';
import IconDomain from 'material-ui-02/svg-icons/social/domain';
import IconPublish from 'material-ui-02/svg-icons/editor/publish';
import ActionThumbUp from 'material-ui-02/svg-icons/action/thumb-up'
import muiThemeable from 'material-ui-02/styles/muiThemeable';
import { Wrapper, InfoLine } from './components/shared';
import PublishSiteDialog from './components/PublishSiteDialog';
import RegisterDialog from './components/RegisterDialog';
import ClaimDomainDialog from './components/ClaimDomainDialog';
import ConnectDomainDialog from './components/ConnectDomainDialog';
import DisconnectDomainDialog from './components/DisconnectDomainDialog';
import EditPlanDialog from './components/EditPlanDialog';
import BlockDialog from './components/BlockDialog';
import Spinner from './../../components/Spinner';
import SnackbarManager from './../../components/SnackbarManager';
import MarkdownIt from 'markdown-it'

import type { EmptyConfigurations, Configurations, SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../../types';

const md = new MarkdownIt({html:true});
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

type HomeProps = {
    muiTheme : any,
    siteKey : string,
    workspaceKey : string
}

type HomeState = {
    configurations?: Configurations | EmptyConfigurations,
    selectedSite?: SiteConfig,
    selectedSiteWorkspaces?: Array<any>,
    selectedWorkspace?: WorkspaceHeader,
    selectedWorkspaceDetails?: WorkspaceConfig,
    publishSiteDialog?: { workspace: WorkspaceConfig, workspaceHeader: WorkspaceHeader, open: bool },
    registerDialog?: { open: bool },
    claimDomainDialog?: { open: bool },
    blockingOperation: ?string //this should be moved to a UI service
}

function NotificationPanel(props){
    return (
        <div class="notificationPanel row" style={{color: "white", padding: "10px 44px",backgroundColor:"rgb(0, 188, 212)"}}>
           {props.children}
        </div>
    )
}

class Home extends React.Component<HomeProps, HomeState>{

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
            siteCreatorMessage: null
        };
    }

    componentDidUpdate(preProps: HomeProps){
        if(this._ismounted && preProps.siteKey !== this.props.siteKey){
            this.checkSiteInProps();
        }

        if(this._ismounted && preProps.poppygoUsername !== this.props.poppygoUsername){
            this.setUser(this.props.poppygoUsername, this.props.poppygoFingerprint);
        }
    }

    /*
    componentWillMount(){
        service.registerListener(this);
    }

    componentWillUnmount(){
        service.unregisterListener(this);
    }
    */

    componentDidMount(){
        this.checkSiteInProps();
        this._ismounted = true;
        this.setUser(this.props.poppygoUsername, this.props.poppygoFingerprint);
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
                service.api.serveWorkspace(siteKey, workspaceKey, "instantly serve at selectWorkspace"/*serveKey*/);
            }

            this.setState({currentSiteKey: siteKey});
            this.setState({currentWorkspaceKey: workspaceKey});

            service.getSiteCreatorMessage(siteKey, workspaceKey).then((message)=>{
                let siteCreatorMessage = md.render(message);
                this.setState({siteCreatorMessage:siteCreatorMessage});
            });

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

        if(this.state.pogoSiteStatus === "ownerIncorrect"){
            snackMessageService.addSnackMessage("You're not allowed to publish to this PoppyPot");
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
        service.api.logToConsole("domainVerification status poll");
        if(this.state.pogoCustomDomainDNSStatus === "reachable"){
            let time=3000;
            this.timeout = setTimeout(() => {
                this.getRemoteDomainVerification(celebrate);
            }, time)
        }
    }

    startPublishPolling(celebrate){
        service.api.logToConsole("site publish status poll");
        let site = this.state.selectedSite;
        if(site.hasOwnProperty('publishStatus') && site.publishStatus === 2){
            let time=3000;
            this.timeout = setTimeout(() => {
                this.getRemotePublishStatus(celebrate);
            }, time)
        }
    }

    startPendingUpgradePolling(celebrate){
        service.api.logToConsole("site upgrade status poll");

        if(this.state.pogoSiteStatus === "pending_subscription"){
            let time=3000;
            this.timeout = setTimeout(() => {
                this.getRemoteSiteStatus(celebrate);
            }, time)
        }
    }

    startUnconfirmedUserPolling(celebrate){
        service.api.logToConsole("user status poll");

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
                    snackMessageService.addSnackMessage('You just got yourself a shiny new site in the PoppyGo Cloud.');
                    service.api.logToConsole("start checking once")
                    this.getRemoteSiteStatus(false);

                    if(this.state.buttonPressed === 'publish'){
                        this.handlePublishNow(false);
                    }
                });
            })
        });
    }

    handleConnectDomainClick(){
        var stateUpdate  = {};
        stateUpdate.connectDomainDialog = {...this.state.connectDomainDialog, open:false};
        this.setState(stateUpdate,()=>{
            service.api.logToConsole("finished connecting domain")
            this.history.push('/sites/'+this.state.currentSiteKey+'/workspaces/'+this.state.currentWorkspaceKey+"/home/"+Math.random());
            //this.setState({oneTimeConnectClick:"Success"});
        });
    }

    handleDisconnectDomainClick(){
        var stateUpdate  = {};
        stateUpdate.disconnectDomainDialog = {...this.state.disconnectDomainDialog, open:false};
        stateUpdate.pogoCustomDomain = "not set";
        this.setState(stateUpdate,()=>{
            service.api.logToConsole("finished disconnecting domain")
            this.history.push('/sites/'+this.state.currentSiteKey+'/workspaces/'+this.state.currentWorkspaceKey+"/home/"+Math.random());
        });
    }

    checkLinkedPogoCloudPath(){
        let site = this.state.selectedSite;
        if(site){
            if( site.publish.length === 1
                && site.publish[0].config.type === 'poppygo' 
                && site.publish[0].config.hasOwnProperty('path')){

                return true;
            }
            else{
                service.api.logToConsole("site has no PoppyPot")
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
                    console.log(data);
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

        service.api.logToConsole("getRemoteVerificationStatus")

        if(this.state.pogoCustomDomain === "not set"){
            service.api.logToConsole("nocustomdomain")
            return
        }

        let projectPath = this.state.selectedSite.publish[0].config.path;
        let url = "http://"+this.state.pogoCustomDomain+"/.pogo_with_me"

        service.api.logToConsole(url);

            let data='';
            const request = net.request(url);

            request.on('error', (err) => {
                    service.api.logToConsole("eerrrr");
                this.setState({pogoCustomDomainDNSStatus:"unreachable"});
                this.startDomVerificationPolling(true);
            });

            request.on('response', (response) => {
                response.on('error', (error) => {
                    service.api.logToConsole("eerrrr");
                })

                response.on('end', () => {
                    let obj = JSON.parse(data);

                    if (obj.path === projectPath){
                        service.api.logToConsole( obj);
                        this.setState({oneTimeOnlyPublishFinished: true});
                        this.setState({pogoCustomDomainDNSStatus:"reachable"});
                    }
                    else{
                        this.setState({pogoCustomDomainDNSStatus:"unreachable"});
                        this.startDomVerificationPolling(true);
                    }
                });
                response.on("close", () => {
                    service.api.logToConsole("close");
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

        service.api.logToConsole("getRemotePublishStatus")
        if(!this.checkLinkedPogoCloudPath()){
            return;
        }

        let projectPath = this.state.selectedSite.publish[0].config.path;
        let url = "http://"+projectPath+".pogosite.com/.pogo_with_me"

        service.api.logToConsole(url);


        try {

            let data='';
            const request = net.request(url);
            request.on('response', (response) => {

                response.on('end', () => {
                    let obj = JSON.parse(data);
                    service.api.setPublishStatus(1)

                    if (obj.path === projectPath){
                        service.api.logToConsole( obj);
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
            service.api.logToConsole('catch');
        }

    }

    getRemoteSiteStatus(celebrate){
        if(!this.state.selectedSite){
            return;
        }

        service.api.logToConsole("getRemoteSiteStatus")
        if(this.state.fingerprint ==="" || !this.checkLinkedPogoCloudPath()){
            return
        }

        let userVars = {
            username: this.state.username,
            fingerprint: this.state.fingerprint,
            projectPath:  this.state.selectedSite.publish[0].config.path,
        };

        let requestVars =btoa(JSON.stringify(userVars));
        //service.api.logToConsole(userVars)

        let url = this.state.pogostripeConn.protocol+"//"+ this.state.pogostripeConn.host+":"+ this.state.pogostripeConn.port+"/project-status/"+requestVars;
        service.api.logToConsole(url)

        let data='';

        try {
            const request = net.request(url);
            request.on('error', (err) => {
            });

            request.on('response', (response) => {
                response.on('end', () => {

                    if(response.statusCode === 403){
                        service.api.logToConsole("ownerIncorrect")
                        this.setState({pogoSiteStatus: "ownerIncorrect"});
                    }
                    else{
                        let obj = JSON.parse(data);
                        let custom_domain = "not set"

                        if (obj.hasOwnProperty('pogo_custom_domain')){
                            custom_domain = obj.pogo_custom_domain;
                        }


                        this.setState({
                            pogoSiteStatus: obj.pogo_plan_status,
                            pogoSitePlan: obj.pogo_plan_name,
                            pogoCustomDomain: custom_domain,
                        },function(){

                            if(this.state.pogoSiteStatus === "active"){
                                if(celebrate) this.setState({oneTimeOnlySiteActive: true});
                                this.getRemoteDomainVerification(false);

                            }
                            else if (this.state.pogoSiteStatus === 'pending_subscription'){

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
            service.api.logToConsole.log('catch', e);
        }

    }

    handleUnsubscribeClick(){
        this.setState({editPlanDialog: {...this.state.editPlanDialog, open:false}});
        service.api.parentTempUnHideMobilePreview();

        let userVars = {
            username: this.state.username,
            fingerprint: this.state.fingerprint,
        };

        let requestVars =btoa(JSON.stringify(userVars));

        let url = this.state.pogostripeConn.protocol+"//"+
            this.state.pogostripeConn.host+":"+this.state.pogostripeConn.port+"/myaccount/"+requestVars;
        window.require('electron').shell.openExternal(url);
    }

    handleUpgradeLinkedSite(pressed){

        let site = this.state.selectedSite;
        service.api.logToConsole(site);

        if(this.state.pogoAccountStatus === "unconfirmed_member"){
            snackMessageService.addSnackMessage('You need to confirm your email. Please check your mail.');
        }
        else{
            this.setState({pogoSiteStatus: "pending_subscription"},function(){
                this.startPendingUpgradePolling(true);
            })

            let upgradeVars = {
                username: this.state.username,
                fingerprint: this.state.fingerprint,
                projectPath:  this.state.selectedSite.publish[0].config.path,
                plan: "PoppyGo Pro"
            };

            let requestVars =btoa(JSON.stringify(upgradeVars));
            let url = this.state.pogostripeConn.protocol+"//"+ this.state.pogostripeConn.host+":"+this.state.pogostripeConn.port+"/upgrade/"+requestVars;
            window.require('electron').shell.openExternal(url);
        }
    }

    handleResendConfirmationMail(){

        var postData = JSON.stringify({ username: this.state.username, fingerprint: this.state.fingerprint});

        let request = net.request({
            method: 'POST',
            protocol: this.state.pogoboardConn.protocol,
            hostname: this.state.pogoboardConn.host,
            port: this.state.pogoboardConn.port,
            path: '/resend-confirmation-link',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        })

        request.on('response', (response) => {
            response.on('end', () => {
                snackMessageService.addSnackMessage('Confirmation mail has been sent.');
            });
            response.on("data", chunk => {
            });
        })
        request.write(postData)
        request.end()

    }

    handleOpenCustomDomainDocs(){
      window.require('electron').shell.openExternal('https://poppygo.io/documentation/custom-domain/');
    }

    handleOpenTerms(){
        window.require('electron').shell.openExternal('https://router.poppygo.app/beta-terms');
    }

    handleOpenPro(){
        window.require('electron').shell.openExternal('https://poppygo.io/plans/poppygo-pro/');
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
                this.startPublishPolling(true);
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
        else if(this.state.pogoSiteStatus === "pending_subscription"){
            return (
                <NotificationPanel>
                    <span style={{color:"white"}}>Upgrade pending. <button className="reglink" onClick={()=>{ this.handleUpgradeLinkedSite(true); }}>Finish upgrade in browser.</button></span>
                </NotificationPanel>
            )
        }
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
                        window.require('electron').shell.openExternal("http://"+this.state.selectedSite.publish[0].config.defaultDomain);
                    }}>{this.state.selectedSite.publish[0].config.defaultDomain}</button>
                </NotificationPanel>
            )
        }
    }

    renderActionPanel(){
        if(this.checkLinkedPogoCloudPath() && this.state.pogoSiteStatus !== ""){

            if(this.state.pogoSiteStatus === "no_plan"){
                return this.renderActionUpgadePanel();
            }
            else if(this.state.pogoSiteStatus === "pending_subscription"){
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
                            <h2>Upgrade to PoppyGo Pro</h2>
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
                        <h3>€3,- per month</h3>
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
                        <p> With PoppyGo Pro now you can </p>
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
                                A-record        54.155.245.139<br/>
                                AAAA-record:    54.155.245.139
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
                            <h2>Upgrade to PoppyGo Pro</h2>
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
                        <h3>€3,- per month</h3>
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

            return (
                <ListItem leftIcon={<IconAccountCircle color="" style={{}} />} disabled={true} >
                    <span style={{fontWeight: "bold", fontSize:"110%"}}>Hi {this.state.username}</span>
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

    renderPogoCloudPathInfo(){

        if(this.checkLinkedPogoCloudPath()){

            let disconnectButton = ""
            if( this.state.pogoCustomDomain !== "not set"){
                disconnectButton = <button className="reglink" onClick={()=>{this.handleDisconnectDomain()}}>disconnect custom domain</button>
            }

            let editPlanButton = ""
            if(this.state.pogoSiteStatus === "active"){
                editPlanButton = <span style={{marginLeft:"50px"}}><button className="reglink" onClick={()=>{this.handleEditPlan()}}>edit plan</button></span>
            }

            let ownerInfo = ""
            if(this.state.pogoSiteStatus === "ownerIncorrect"){
                ownerInfo = <div>This domain is owned by somebody else</div>
            }

            let planInfo = ""
            if(this.state.pogoSiteStatus === "active"){
                planInfo = <span>with <strong>{this.state.pogoSitePlan}</strong></span>
            } else if (this.state.pogoSiteStatus !== "active") {
                planInfo = <strong>as a temporary URL</strong>
            }


            return (
                <ListItem leftIcon={<IconDomain color="" style={{}} />} disabled={true} >
                    <span style={{fontWeight: "normal", fontSize:"110%"}}>Your site is live at &nbsp;
                        <button className="reglink" style={{fontWeight:"bold"}} onClick={()=>{
                            window.require('electron').shell.openExternal("http://"+this.state.selectedSite.publish[0].config.defaultDomain);
                        }}>{this.state.selectedSite.publish[0].config.defaultDomain}</button> &nbsp;
                        {planInfo}{editPlanButton}
                    </span>

                </ListItem>
            )
        }
        else{
            return  (
                <ListItem leftIcon={<IconDomain color="" style={{}} />} disabled={true} >
                    <span style={{fontWeight: "normal", fontSize:"100%"}}>Claim a poppygo live URL for {this.state.selectedSite.name} </span>
                    &nbsp;&nbsp;<button className="reglink" onClick={()=>{this.handleClaimDomainNow(true)}}>claim now!</button>
                </ListItem>
            )
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

    render(){

        let { configurations } = this.state;

        if( configurations == null || this.state.selectedSite == null ){
            return <Spinner />
        }

        let pogoCloudPath = this.getPogoCloudPath();

        return (
            <Route render={({history}) => {
                this.history = history;

                return (
                    <div style={ styles.container }>

                        <div style={styles.selectedSiteCol}>
                            <Wrapper key={this.state.selectedSite.key}>
                                <InfoLine label="">
                                    <h2 style={{padding:0, margin:0}}>{this.state.selectedSite.name}</h2>
                                </InfoLine>

                                <div style={{padding: "0px 16px"}}>
                                    <List>
                                        {this.renderUserInfoActions()}
                                        {this.renderPogoCloudPathInfo()}
                                        {this.renderPublishInfo()}
                                    </List>
                                </div>

                                <div style={Object.assign({position : 'relative',padding: "0px 16px 16px 30px", width:'100%', display:'flex'})}>
                                    <RaisedButton primary={true} label="Publish" onClick={()=>{ this.handlePublishNow(true) }} />
                                    <div style={{ border: 'solid 0px green', marginLeft: 'auto', marginTop: 13 }}>
                                        <button className="reglink" onClick={()=>{this.handleOpenTerms()}}>Terms and Conditions</button>
                                    </div>
                                </div>

                                { this.renderNotificationPanel() }
                                { this.renderActionPanel() }

                                <div className="markdown" style={ styles.creatorMessage } dangerouslySetInnerHTML={{__html:this.state.siteCreatorMessage}} />

                            </Wrapper>
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

                        <DisconnectDomainDialog
                            onCancelClick={
                                ()=>{
                                    this.setState({disconnectDomainDialog: {...this.state.disconnectDomainDialog, open:false}});
                                    service.api.parentTempUnHideMobilePreview();
                                }
                            }
                            onDisconnectDomainClick={()=>{ this.handleDisconnectDomainClick() }}
                            username={this.state.username}
                            pogoCustomDomain={this.state.pogoCustomDomain}
                            sitePath={pogoCloudPath}
                            fingerprint={this.state.fingerprint}
                            open={this.state.disconnectDomainDialog != null && this.state.disconnectDomainDialog.open}
                        />

                        <EditPlanDialog
                            onCancelClick={()=>{
                                this.setState({editPlanDialog: {...this.state.editPlanDialog, open:false}});
                                service.api.parentTempUnHideMobilePreview();
                            }}
                            onDisconnectDomainClick={()=>{ this.handleDisconnectDomainClick() }}
                            onUnsubscribeClick={()=>{ this.handleUnsubscribeClick() }}
                            username={this.state.username}
                            pogoCustomDomain={this.state.pogoCustomDomain}
                            sitePath={pogoCloudPath}
                            fingerprint={this.state.fingerprint}
                            open={this.state.editPlanDialog!=null&&this.state.editPlanDialog.open}
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

export default muiThemeable()(Home);
