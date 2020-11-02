import { Route } from 'react-router-dom';
import React from 'react';
import service from './../../services/service';
import { snackMessageService } from './../../services/ui-service';
import { RaisedButton } from 'material-ui/';
import {List, ListItem} from 'material-ui/List';
//import Subheader from 'material-ui/Subheader';
import IconAccountCircle from 'material-ui/svg-icons/action/account-circle';
import IconDomain from 'material-ui/svg-icons/social/domain';
import IconPublish from 'material-ui/svg-icons/editor/publish';

import muiThemeable from 'material-ui/styles/muiThemeable';
import { Wrapper, InfoLine, MessageBlock } from './components/shared';
import CreateSiteDialog from './components/CreateSiteDialog';
import PublishSiteDialog from './components/PublishSiteDialog';
import RegisterDialog from './components/RegisterDialog';
import ClaimDomainDialog from './components/ClaimDomainDialog';
import BlockDialog from './components/BlockDialog';
import Spinner from './../../components/Spinner';
import MarkdownIt from 'markdown-it'

import type { EmptyConfigurations, Configurations, SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../../types';

const md = new MarkdownIt({html:true});

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
            siteCreatorMessage: null
        };
    }

    componentDidUpdate(preProps: HomeProps){
        if(this._ismounted && preProps.siteKey !== this.props.siteKey){
            this.checkSiteInProps();
        }

        if(this._ismounted && preProps.poppygoUsername !== this.props.poppygoUsername){
            this.setUserName(this.props.poppygoUsername);
        }
    }

    componentWillMount(){
        //TODO remove when pogopublisher has been rewritten
        window.require('electron').ipcRenderer.on('lastPublishedChanged', ()=>{
            this.setState({'mustConvert':false});
            service.getConfigurations(true).then((c)=>{
                this.checkSiteInProps();
                this.history.push('/sites/'+this.state.currentSiteKey+'/workspaces/'+this.state.currentWorkspaceKey+"?key="+Math.random());

            });
        });
        service.registerListener(this);
    }

    componentDidMount(){
        this.checkSiteInProps();
        this._ismounted = true;
        this.setUserName(this.props.poppygoUsername);
    }

    setUserName(username){
        this.setState({username: username});
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

                this.checkConvert07(bundle.site)

                stateUpdate.selectedSiteWorkspaces = bundle.siteWorkspaces;
                stateUpdate.selectedWorkspace = bundle.workspace;
                stateUpdate.selectedWorkspaceDetails = bundle.workspaceDetails;

                this.setState(stateUpdate);
                //let details = service.getWorkspaceDetails(siteKey, workspaceKey);

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

    handlePublishNow(){
        let workspace = this.state.selectedWorkspaceDetails;
        let workspaceHeader = this.state.selectedSiteWorkspaces[0];
        service.api.parentTempHideMobilePreview();

        this.setState({requestDialog:"publish"});

        if(this.state.username === ""){
            this.handleRegisterNow();
        }
        else if(!this.checkLinkedDomain()){
            this.handleClaimDomainNow();
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

    handleRegisterCancelClick(){
        this.setState({registerDialog: {...this.state.registerDialog, open:false}});
    }

    handleRegisterClick(username, email){
        this.setState({registerDialog: {...this.state.registerDialog, open:false}});
        this.history.push('/sites/'+this.state.currentSiteKey+'/workspaces/'+this.state.currentWorkspaceKey+"?key="+Math.random());
        /*

        this.setState({username:username},()=>{
            if(this.state.requestDialog=="claim"){
                this.handleClaimDomainNow();
            }
            else if(this.state.registerDialog=='publish' && !this.checkLinkedDomain()){
                this.handleClaimDomainNow();
            }
            else if(this.state.registerDialog=='publish' && this.checkLinkedDomain()){
                this.handlePublishNow();
            }
            else{
            }

        });
        */
    }

    handleClaimDomainNow(){
        this.setState({requestDialog:"claim"});
        service.api.parentTempHideMobilePreview();
        this.setState({claimDomainDialog: { open: true}});
    }

    handleClaimDomainCancelClick(){
        this.setState({claimDomainDialog: {...this.state.claimDomainDialog, open:false}});
    }

    handleClaimDomainClick(obj){
        service.getConfigurations(true).then((c)=>{
            this.checkSiteInProps();
        });
        this.setState({claimDomainDialog: {...this.state.claimDomainDialog, open:false}});
    }

    checkLinkedDomain(){
        let site = this.state.selectedSite;
        if(site.publish.length === 1 && site.publish[0].config.type === 'poppygo' && site.publish[0].config.hasOwnProperty('path')){
            return true;
        }
        return false;

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
            user = ( <ListItem leftIcon={<IconAccountCircle color="" style={{}} />} disabled={true} >
                <span style={{fontWeight: "bold", fontSize:"110%"}}>Hi {this.state.username}</span>
                </ListItem>
            );
        }
        else{
            user = ( <ListItem leftIcon={<IconAccountCircle color="" style={{}} />} disabled={true} >
                            <span style={{fontWeight: "bold", fontSize:"110%"}}>You are using Poppygo anonymously</span> &nbsp;&nbsp;<button className="reglink" onClick={()=>{this.handleRegisterNow()}}>register now!</button>
                        </ListItem>
            );
        }

        if(this.checkLinkedDomain()){
            domain = (
                <ListItem leftIcon={<IconDomain color="" style={{}} />} disabled={true} >
                    <span style={{fontWeight: "bold", fontSize:"110%"}}>This site is linked to <button className="reglink" style={{fontWeight:"bold"}} onClick={()=>{
                        window.require('electron').shell.openExternal("http://"+site.publish[0].config.defaultDomain);
                    }}>{site.publish[0].config.defaultDomain}</button></span>
                </ListItem>
            )
        }
        else{
            domain = (
                <ListItem leftIcon={<IconDomain color="" style={{}} />} disabled={true} >
                    <span style={{fontWeight: "bold", fontSize:"110%"}}>You haven’t linked your site {site.name} to a poppygo Domain</span> &nbsp;&nbsp;<button className="reglink" onClick={()=>{this.handleClaimDomainNow()}}>claim domain!</button>
                </ListItem>
            )
        }

        if(site.hasOwnProperty('lastPublish') && site.lastPublish !== 0){

            let ts;
            if(site.lastPublish === 1){
                ts = "not registered";

            } else
            {
                ts = new Date(site.lastPublish).toString().split("GMT")[0]
            }

            published = (
                <ListItem leftIcon={<IconPublish color="" style={{}} />} disabled={true} >
                    <span style={{fontWeight: "bold", fontSize:"110%"}}>Latest publication {ts}{/* - All work is published!*/}</span>
                </ListItem>
            )
        }
        else{
            published = (
                <ListItem leftIcon={<IconPublish color="" style={{}} />} disabled={true} >
                    <span style={{fontWeight: "bold", fontSize:"110%"}}>Your site {site.name} is not yet published</span> {<button className="reglink" onClick={ ()=>{this.handlePublishNow()} } >publish now!</button>}
                </ListItem>
            )
        }


        let publishDisabled=true;
        let config = this.state.selectedWorkspaceDetails;
        publishDisabled = config==null||config.build===null||config.build.length===0||site.publish===null||site.publish.length===0;

        return (
            <Wrapper style={{maxWidth:'1000px'}} key={site.key} title="">

                <InfoLine label="Site name">
                    <h2 style={{padding:0, margin:0}}>{site.name}</h2>
                </InfoLine>

                <div style={{padding: "0px 16px"}}>
                    <List>
                        {user}
                        {domain}
                        {published}

                    </List>

                </div>
                <div style={{padding: "0px 16px 16px 30px"}}>
                    <RaisedButton primary={true} label="Publish" disabled={publishDisabled} onClick={()=>{ this.handlePublishNow();}} />
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
        let { selectedSite, configurations, createSiteDialog, publishSiteDialog, registerDialog, claimDomainDialog} = this.state;

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
                                            onCancelClick={()=>this.handleClaimDomainClick()}
                                            onClaimDomainClick={(obj)=>{
                                                this.handleClaimDomainClick(obj)
                                            }}
                                            username={this.state.username}

                                            open={claimDomainDialog!=null&&claimDomainDialog.open}
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
