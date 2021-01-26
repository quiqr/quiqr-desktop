import { Route } from 'react-router-dom';
import React from 'react';
import service from './../../services/service';
import { snackMessageService } from './../../services/ui-service';
import { RaisedButton } from 'material-ui/';
import {List, ListItem} from 'material-ui/List';
import IconAccountCircle from 'material-ui/svg-icons/action/account-circle';
import IconDomain from 'material-ui/svg-icons/social/domain';
import IconPublish from 'material-ui/svg-icons/editor/publish';

import muiThemeable from 'material-ui/styles/muiThemeable';
import { Wrapper, InfoLine, MessageBlock } from './components/shared';
import CreateSiteDialog from './components/CreateSiteDialog';
import PublishSiteDialog from './components/PublishSiteDialog';
import RegisterDialog from './components/RegisterDialog';
import ClaimDomainDialog from './components/ClaimDomainDialog';
import ConnectDomainDialog from './components/ConnectDomainDialog';
import DisconnectDomainDialog from './components/DisconnectDomainDialog';
import BlockDialog from './components/BlockDialog';
import Spinner from './../../components/Spinner';
import MarkdownIt from 'markdown-it'

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

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
    createSiteDialog: bool,
    publishSiteDialog?: { workspace: WorkspaceConfig, workspaceHeader: WorkspaceHeader, open: bool },
    registerDialog?: { open: bool },
    claimDomainDialog?: { open: bool },
    blockingOperation: ?string //this should be moved to a UI service
}

class Home extends React.Component<HomeProps, HomeState>{

    history: any;

    constructor(props){
        super(props);
        this.state = {
            blockingOperation: null,
            currentSiteKey: null,
            createSiteDialog: false,
            publishSiteDialog: undefined,
            registerDialog: {open: false},
            claimDomainDialog: {open: false},
            username: "",
            pogoAccountStatus: "no_member",
            pogoCustomDomain: "not set",
            oneTimeOnlyUserConfirmed: false,
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
        if(this._ismounted && preProps.poppygoUsername !== this.props.poppygoUsername){
            this.setUser(this.props.poppygoUsername, this.props.poppygoFingerprint);
        }
    }

    componentWillMount(){
        service.registerListener(this);
    }

    componentDidMount(){
        this.checkSiteInProps();
        this._ismounted = true;
        this.setUser(this.props.poppygoUsername, this.props.poppygoFingerprint);
    }

    setUser(username,fingerprint){
        this.setState({username: username, fingerprint: fingerprint});
    }

    checkConvert07(site){
        if(site.hasOwnProperty('publish') && site.publish.length === 1){
            let publ = site.publish[0];
            if(publ.hasOwnProperty('config')
                && publ.config.hasOwnProperty('type') && publ.config.type === 'poppygo'){

                if(!publ.config.hasOwnProperty('path')){
                    service.api.convert07("MUST CONVERT");
                }
            }
        }
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

                //get status of user (pogoboard)
                //get status of website


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

                this.checkConvert07(bundle.site)

                stateUpdate.selectedSiteWorkspaces = bundle.siteWorkspaces;
                stateUpdate.selectedWorkspace = bundle.workspace;
                stateUpdate.selectedWorkspaceDetails = bundle.workspaceDetails;

                this.setState(stateUpdate);

                this.getRemoteUserStatus(false);
                this.getRemoteSiteStatus(false);

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

    /*
    getWorkspaceDetails = (workspace: WorkspaceHeader) => {

        if(this.state.selectedSite==null) throw new Error('Invalid operation.');
        let ret = service.getWorkspaceDetails(this.state.selectedSite.key, workspace.key);
        return ret;
    }
    */

    componentWillUnmount(){
        service.unregisterListener(this);
    }

    handlePublishNow(pressed){
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
        else if(!this.checkLinkedDomain()){
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

    handleRegisterCancelClick(){
        this.setState({registerDialog: {...this.state.registerDialog, open:false}});
    }

    startPendingUpgradePolling(celebrate){
        service.api.logToConsole("site upgrade status poll");
        service.api.logToConsole(this.state.pogoSiteStatus);

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
                    this.history.push('/sites/'+this.state.currentSiteKey+'/workspaces/'+this.state.currentWorkspaceKey+"?key="+Math.random());
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

    handleClaimDomainCancelClick(){
        this.setState({claimDomainDialog: {...this.state.claimDomainDialog, open:false}});
    }
    handleConnectDomainCancelClick(){
        this.setState({connectDomainDialog: {...this.state.connectDomainDialog, open:false}});
    }
    handleDisconnectDomainCancelClick(){
        this.setState({disconnectDomainDialog: {...this.state.disconnectDomainDialog, open:false}});
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
                    service.api.logToConsole("start checking once")
                    this.getRemoteSiteStatus(false);

                    if(this.state.buttonPressed === 'publish'){
                        this.handlePublishNow(false);
                    }
                });

            })

        });
    }
    handleConnectDomainClick(obj){

        service.getConfigurations(true).then((c)=>{

            service.getSiteAndWorkspaceData(this.state.currentSiteKey, this.state.currentWorkspaceKey).then((bundle)=>{
                var stateUpdate  = {};
                stateUpdate.configurations = bundle.configurations;
                stateUpdate.selectedSite = bundle.site;
                stateUpdate.selectedSiteWorkspaces = bundle.siteWorkspaces;
                stateUpdate.selectedWorkspace = bundle.workspace;
                stateUpdate.selectedWorkspaceDetails = bundle.workspaceDetails;

                //stateUpdate.pogoCustomDomain = obj.domain;

                stateUpdate.connectDomainDialog = {...this.state.connectDomainDialog, open:false};

                this.setState(stateUpdate,()=>{
                    service.api.logToConsole("finished connecting domain")
                });

            })

        });
    }


    handleDisconnectDomainClick(){

        service.getConfigurations(true).then((c)=>{

            service.getSiteAndWorkspaceData(this.state.currentSiteKey, this.state.currentWorkspaceKey).then((bundle)=>{
                var stateUpdate  = {};
                stateUpdate.configurations = bundle.configurations;
                stateUpdate.selectedSite = bundle.site;
                stateUpdate.selectedSiteWorkspaces = bundle.siteWorkspaces;
                stateUpdate.selectedWorkspace = bundle.workspace;
                stateUpdate.selectedWorkspaceDetails = bundle.workspaceDetails;

                stateUpdate.pogoCustomDomain = "not set";

                stateUpdate.disconnectDomainDialog = {...this.state.disconnectDomainDialog, open:false};

                this.setState(stateUpdate,()=>{
                    service.api.logToConsole("finished disconnecting domain")
                });

            })

        });
    }

    checkLinkedDomain(){
        let site = this.state.selectedSite;
        if(site.publish.length === 1 && site.publish[0].config.type === 'poppygo' && site.publish[0].config.hasOwnProperty('path')){
            service.api.logToConsole(site.publish[0].config);
            return true;
        }
        return false;
    }

    getRemoteUserStatus(celebrate){

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

                        if(obj.pogoAccountStatus === "confirmed_member" && celebrate){
                            this.setState({oneTimeOnlyUserConfirmed: true});
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

    getRemoteSiteStatus(celebrate){

        service.api.logToConsole("getRemoteSiteStatus")
        if(!this.checkLinkedDomain()){
            service.api.logToConsole("notLinked :(")
            return
        }

        let userVars = {
            username: this.state.username,
            fingerprint: this.state.fingerprint,
            projectPath:  this.state.selectedSite.publish[0].config.path,
        };

        let requestVars =btoa(JSON.stringify(userVars));

        let url = this.state.pogostripeConn.protocol+"//"+
            this.state.pogostripeConn.host+":"+
            this.state.pogostripeConn.port+"/project-status/"+requestVars;



        let data='';


        try {
            const request = net.request(url);
            request.on('error', (err) => {
            });

            request.on('response', (response) => {
                response.on('end', () => {

                    if(response.statusCode === 403){
                        this.setState({pogoSiteStatus: "ownerIncorrect"});
                        service.api.logToConsole("forbidden");
                    }
                    else{
                        let obj = JSON.parse(data);
                        let custom_domain = "not set"
                        service.api.logToConsole(obj);

                        if (obj.hasOwnProperty('pogo_custom_domain')){
                            custom_domain = obj.pogo_custom_domain;
                        }

                        this.setState({
                            pogoSiteStatus: obj.pogo_plan_status,
                            pogoSitePlan: obj.pogo_plan_name,
                            pogoCustomDomain: custom_domain,
                        },function(){

                            if(this.state.pogoSiteStatus === "active" && celebrate){
                                this.setState({oneTimeOnlySiteActive: true});
                            }
                            else if (this.state.pogoSiteStatus === 'pending_subscription'){

                                service.api.logToConsole(this.state.pogoSiteStatus);
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


    handleManageSubscriptions(){

        let userVars = {
            username: this.state.username,
            fingerprint: this.state.fingerprint,
        };

        let requestVars =btoa(JSON.stringify(userVars));

        let url = this.state.pogostripeConn.protocol+"//"+
            this.state.pogostripeConn.host+":"+this.state.pogostripeConn.port+"/myaccount/"+requestVars;
        window.require('electron').shell.openExternal(url);
    }

    handleUpgradeLinkedSite(){

        this.setState({pogoSiteStatus: "pending_subscription"},function(){
            this.startPendingUpgradePolling(true);
        })

        let upgradeVars = {
            username: this.state.username,
            fingerprint: this.state.fingerprint,
            projectPath:  this.state.selectedSite.publish[0].config.path,
            plan: "basic"
        };

        let requestVars =btoa(JSON.stringify(upgradeVars));
        let url = this.state.pogostripeConn.protocol+"//"+ this.state.pogostripeConn.host+":"+this.state.pogostripeConn.port+"/upgrade/"+requestVars;
        window.require('electron').shell.openExternal(url);
    }


    handleResendConfirmationMail(){

        var postData = JSON.stringify({ username: this.state.username, fingerprint: this.state.fingerprint});

        let data='';
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
                let obj = JSON.parse(data);
                service.api.logToConsole( obj)
            });

            response.on("data", chunk => {
                data += chunk;
            });

        })
        request.write(postData)
        request.end()

    }

    handleOpenTerms(){
        window.require('electron').shell.openExternal('https://router.poppygo.app/beta-terms');
    }

    hasActivePlan(pogoSiteStatus){

        if(pogoSiteStatus === "active" || pogoSiteStatus === "expired_soon"){
            return true;
        }
        return false;
    }

    renderUpgadeLink(){

        if(this.state.pogoSiteStatus === "ownerIncorrect"){
            return (
                <span>You're not the owner of this domain.</span>
            )
        }
        else if(this.state.pogoSiteStatus === "no_plan"){
            return (
                <button className="reglink" onClick={()=>{ this.handleUpgradeLinkedSite(); }}>Upgrade to PoppyGo Basic</button>
            )
        }
        else if(this.state.pogoSiteStatus === "pending_subscription"){
            return (
                <span>Upgrade pending. <button className="reglink" onClick={()=>{ this.handleUpgradeLinkedSite(); }}>Finish upgrade in browser.</button></span>
            )
        }
        else if(this.state.pogoSiteStatus === "active"){
            return (
                <span>Plan: {this.state.pogoSitePlan}</span>
            )
        }
        else if(this.state.pogoSiteStatus === "expired_soon"){
            return (
                <span>Plan: {this.state.pogoSitePlan}, will expire soon</span>
            )
        }
        else if(this.state.pogoSiteStatus === "expired"){
            return (
                <span>Plan: {this.state.pogoSitePlan}, subscription has expired<br/>
                <button className="reglink" onClick={()=>{ this.handleUpgradeLinkedSite(); }}>activate subscription PoppyGo Basic</button></span>
            )
        }
        else {

        }
    }

    domainlist(){
        if(! this.hasActivePlan(this.state.pogoSiteStatus)){
            return;
        }

        let site = this.state.selectedSite;
        let autoDomain = "";
        if(site.publish.length === 1 && site.publish[0].config.type === 'poppygo' && site.publish[0].config.hasOwnProperty('path')){
           autoDomain = site.publish[0].config.path + ".pogosite.com";
        }

        return (
            <Table selectable={false} >
                <TableHeader
                displaySelectAll={false}
                adjustForCheckbox={false}
            >
                    <TableRow>
                        <TableHeaderColumn
                        style={{
                            width: '180px',
                        }}
                    >status</TableHeaderColumn>
                    <TableHeaderColumn style="text-align:left" >Domain/URL</TableHeaderColumn>
                </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
                <TableRow>
                    <TableRowColumn
                    style={{
                        width: '180px',
                    }}

                >connected</TableRowColumn>
                <TableRowColumn>{autoDomain}</TableRowColumn>
            </TableRow>
            <TableRow>
                <TableRowColumn>
                    {this.state.pogoCustomDomain == "not set"?
                            <button className="reglink" onClick={()=>{this.handleConnectDomain()}}>connect custom domain</button>
                            :
                            <button className="reglink" onClick={()=>{this.handleDisconnectDomain()}}>disconnect custom domain</button>
                    }
                </TableRowColumn>
                <TableRowColumn>{this.state.pogoCustomDomain}</TableRowColumn>
            </TableRow>
        </TableBody>
    </Table>

        )

    }


    renderSelectedSiteContent(configurations: Configurations, site: SiteConfig ){
        let user = undefined;
        let domain = undefined;
        let published = undefined;

        if(this.state.mustConvert){
            return (
                <Wrapper>
                    <div>&nbsp;&nbsp;Converting data....</div>
                </Wrapper>
            )
        }

        if(this.state.username!==""){

            let accountStatusMsg = ""
            let handleSubscriptions = ""
            let confirmedMailSuccess = ""
            if(this.state.oneTimeOnlyUserConfirmed){
                confirmedMailSuccess = (
                    <span><br/>Well done.. you confirmed you're email address succesfully</span>
                )
            }
            if(this.state.pogoAccountStatus === "unconfirmed_member"){
                accountStatusMsg = (
                    <span><br/>
                        You have not confirmed you're email address. Check you're email for a confirmation mail or
                        <button className="reglink" onClick={()=>{this.handleResendConfirmationMail()}}>Resend confirmation mail</button>
                    </span>
                )
            }
            else if(this.state.pogoAccountStatus === "confirmed_member"){

                if(this.state.stripe_customer_id !== ""){
                    handleSubscriptions = <span><br/><button className="reglink" onClick={()=>{this.handleManageSubscriptions()}}>Manage Subscriptions</button></span>
                }
            }

            user = ( <ListItem leftIcon={<IconAccountCircle color="" style={{}} />} disabled={true} >
                <span style={{fontWeight: "bold", fontSize:"110%"}}>Hi {this.state.username}</span>
                {confirmedMailSuccess}
                {accountStatusMsg}
                {handleSubscriptions}

                </ListItem>
            );
        }
        else{
            user = ( <ListItem leftIcon={<IconAccountCircle color="#49545" style={{}} />} disabled={true} >
                            <span style={{fontWeight: "normal", fontSize:"100%"}}>Create an account for publishing</span> &nbsp;&nbsp;<button className="reglink" onClick={()=>{this.handleRegisterNow()}}>Register now!</button>
                        </ListItem>
            );
        }

        if(this.checkLinkedDomain()){
            domain = (
                <ListItem leftIcon={<IconDomain color="" style={{}} />} disabled={true} >
                    <span style={{fontWeight: "bold", fontSize:"110%"}}>{site.name} is linked to&nbsp;
                        <button className="reglink" style={{fontWeight:"bold"}} onClick={()=>{
                        window.require('electron').shell.openExternal("http://"+site.publish[0].config.defaultDomain);
                        }}>{site.publish[0].config.defaultDomain}</button>
                    </span>
                    <br/>

                    { this.renderUpgadeLink() }
                    { this.domainlist() }


                </ListItem>
            )
        }
        else{
            domain = (
                <ListItem leftIcon={<IconDomain color="" style={{}} />} disabled={true} >
                    <span style={{fontWeight: "normal", fontSize:"100%"}}>Claim a poppygo live URL for {site.name} </span> &nbsp;&nbsp;<button className="reglink" onClick={()=>{this.handleClaimDomainNow(true)}}>claim now!</button>
                </ListItem>
            )
        }

        if(site.hasOwnProperty('lastPublish') && site.lastPublish !== 0){

        let ts;
        if(site.lastPublish === 1){
                ts = "";
            } else
            {
            ts = new Date(site.lastPublish).toString().split("GMT")[0]
            published = (
                <ListItem leftIcon={<IconPublish color="" style={{}} />} disabled={true} >
                    <span style={{fontWeight: "normal", fontSize:"100%"}}>Latest publication {ts}{/* - All work is published!*/}</span>
                </ListItem>
            )
            }
        }
        else{
            published = (
                <ListItem leftIcon={<IconPublish color="" style={{}} />} disabled={true} >
                    <span style={{fontWeight: "normal", fontSize:"100%"}}>{site.name} is not yet published</span> {<button className="reglink" onClick={ ()=>{this.handlePublishNow()} } ></button>}
                </ListItem>
            )
        }


        let publishDisabled=true;
        let config = this.state.selectedWorkspaceDetails;
        publishDisabled = config==null||config.build===null||config.build.length===0||site.publish===null||site.publish.length===0;

        return (
            <Wrapper style={{maxWidth:'1000px'}} key={site.key} title="">

                <InfoLine label="">
                    <h2 style={{padding:0, margin:0}}>{site.name}</h2>
                </InfoLine>

                <div style={{padding: "0px 16px"}}>
                    <List>
                        {user}
                        {domain}
                        {published}

                    </List>

                </div>
                <div style={Object.assign({position : 'relative',padding: "0px 16px 16px 30px", width:'100%', display:'flex'})}>
                    <RaisedButton primary={true} label="Publish" disabled={publishDisabled} onClick={()=>{ this.handlePublishNow(true);}} />
                    <div style={{ border: 'solid 0px green', marginLeft: 'auto', marginTop: 13 }}>
                        <button className="reglink" onClick={()=>{this.handleOpenTerms()}}>Terms and Conditions</button>

                    </div>
                </div>

                { /*this.renderWorkspaces(site, site.key===this.state.currentSiteKey, this.state.selectedSiteWorkspaces) */}

                <div className="markdown"
                style={ styles.creatorMessage }
                dangerouslySetInnerHTML={{__html:this.state.siteCreatorMessage}}></div>

            </Wrapper>
        );
    }

    /*
    handleSelectWorkspaceClick = (e, siteKey, workspace)=> {
        e.stopPropagation();
        this.selectWorkspace(siteKey, workspace);
    };
    */

    /*
    async selectWorkspace(siteKey: string, workspace : WorkspaceHeader ){

        this.setState({currentWorkspaceKey: workspace.key});
        let        select = true;
        if(select){
            await service.api.mountWorkspace(siteKey, workspace.key);
            this.history.push(`/sites/${decodeURIComponent(siteKey)}/workspaces/${decodeURIComponent(workspace.key)}`);
        }
        else{
            this.history.push(`/`);
        }
    }
    */

    handleAddSiteClick(){
        this.setState({createSiteDialog: true});
    }

    handleCreateSiteSubmit = (data)=>{
        this.setState({createSiteDialog:false, blockingOperation:'Creating site...'})

        service.api.createSite(data).then(()=>{
            return service.getConfigurations(true);
        }).then(configurations=>{
            this.setState({configurations});
        }).catch((e)=>{
            alert('Failed to create site');
        }).then(()=>{
            this.setState({ blockingOperation:null})
        });
    }

    handlePublishSiteCancelClick = () => {
        service.api.parentTempUnHideMobilePreview();
        this.setState({publishSiteDialog: {...this.state.publishSiteDialog, open:false}});
    }

    handleBuildAndPublishClick = ({siteKey, workspaceKey, build, publish}) => {
        service.api.parentTempUnHideMobilePreview();

        this.setState({blockingOperation: 'Building site...', publishSiteDialog: undefined});
        service.api.buildWorkspace(siteKey, workspaceKey, build).then(()=>{
            this.setState({blockingOperation: 'Publishing site...'});

            service.api.publishSite(siteKey, publish).then(()=>{
                service.getConfigurations(true).then((c)=>{
                    //snackMessageService.addSnackMessage('Site successfully published.');
                    this.checkSiteInProps();
                });
            });
        }).then(()=>{

        }).catch(()=>{
            snackMessageService.addSnackMessage('Publish failed.');
        }).then(()=>{
            this.setState({blockingOperation: null});
        })
    }

    render(){

        //let { siteKey } = this.props;
        let { selectedSite, configurations, createSiteDialog, publishSiteDialog, registerDialog, claimDomainDialog, connectDomainDialog, disconnectDomainDialog} = this.state;

        let pogoSitePath = "";
        if(selectedSite!=null && selectedSite.hasOwnProperty('publish') && selectedSite.publish.length === 1 && selectedSite.publish[0].config.type === 'poppygo' && selectedSite.publish[0].config.hasOwnProperty('path')){
           pogoSitePath = selectedSite.publish[0].config.path;
        }

        let _configurations = ((configurations: any): Configurations);

        if(configurations==null){
            return <Spinner />
        }

        return (
            <Route render={({history}) => {
                this.history = history;

                let jeeworkspace = null;
                let jeeworkspaceHeader = null;
                if( selectedSite!=null && this.state.publishSiteDialog!=null){
                    jeeworkspace = this.state.publishSiteDialog.workspace;
                    jeeworkspaceHeader = this.state.publishSiteDialog.workspaceHeader;
                }

                return (

                    <div style={ styles.container }>
                        <div style={styles.selectedSiteCol}>
                            { selectedSite==null ? (
                                <Wrapper title="Site Management">
                                    <MessageBlock>Please, select a site.</MessageBlock>
                                </Wrapper>
                            ) : (
                                this.renderSelectedSiteContent(_configurations, selectedSite)
                            ) }
                        </div>

                        <CreateSiteDialog
                            open={createSiteDialog}
                            onCancelClick={()=>this.setState({createSiteDialog:false})}
                            onSubmitClick={this.handleCreateSiteSubmit}
                        />

                        { selectedSite!=null && this.state.publishSiteDialog!=null ? (
                                    <PublishSiteDialog
                                    site={selectedSite}
                                    workspace={jeeworkspace}
                                    workspaceHeader={jeeworkspaceHeader}
                                    onCancelClick={this.handlePublishSiteCancelClick}
                                    onBuildAndPublishClick={this.handleBuildAndPublishClick}
                                    open={publishSiteDialog!=null&&publishSiteDialog.open}
                                />
                        ):(null) }

                        { selectedSite!=null && this.state.registerDialog!=null ? (
                                       <RegisterDialog
                                        onCancelClick={()=>this.handleRegisterCancelClick()}
                                        onRegisterClick={({username, email})=>{
                                            this.handleRegisterClick(username, email)
                                        }}

                                        open={registerDialog!=null&&registerDialog.open}
                                    />
                         ):(null) }

                         { selectedSite!=null && this.state.claimDomainDialog!=null ? (
                                           <ClaimDomainDialog
                                            onCancelClick={()=>this.handleClaimDomainCancelClick()}
                                            onClaimDomainClick={(obj)=>{
                                                this.handleClaimDomainClick(obj)
                                            }}
                                            username={this.state.username}
                                            fingerprint={this.state.fingerprint}

                                            open={claimDomainDialog!=null&&claimDomainDialog.open}
                                        />
                         ):(null) }

                         { selectedSite!=null && this.state.connectDomainDialog!=null ? (
                                           <ConnectDomainDialog
                                            onCancelClick={()=>this.handleConnectDomainCancelClick()}
                                            onConnectDomainClick={(obj)=>{
                                                this.handleConnectDomainClick(obj)
                                            }}
                                            username={this.state.username}
                                            sitePath={pogoSitePath}
                                            fingerprint={this.state.fingerprint}

                                            open={connectDomainDialog!=null&&connectDomainDialog.open}
                                        />
                         ):(null) }

                         { selectedSite!=null && this.state.disconnectDomainDialog!=null ? (
                                           <DisconnectDomainDialog
                                            onCancelClick={()=>this.handleDisconnectDomainCancelClick()}
                                            onDisconnectDomainClick={()=>{ this.handleDisconnectDomainClick() }}
                                            username={this.state.username}
                                            pogoCustomDomain={this.state.pogoCustomDomain}

                                            sitePath={pogoSitePath}
                                            fingerprint={this.state.fingerprint}

                                            open={disconnectDomainDialog!=null&&disconnectDomainDialog.open}
                                        />
                         ):(null) }

                       <BlockDialog open={this.state.blockingOperation!=null}>{this.state.blockingOperation}<span> </span></BlockDialog>
                     </div>
                )
            }}/>

          );
        }

    }

export default muiThemeable()(Home);
