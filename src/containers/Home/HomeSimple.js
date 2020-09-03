//@flow

//import invariant from 'assert';
import { Route } from 'react-router-dom';
import React from 'react';
import service from './../../services/service';
import { snackMessageService } from './../../services/ui-service';
import FlatButton from 'material-ui/FlatButton';
//import RaisedButton from 'material-ui/RaisedButton';
//import Paper from 'material-ui/Paper';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import IconNavigationCheck from 'material-ui/svg-icons/navigation/check';
import IconAdd from 'material-ui/svg-icons/content/add';
import IconFileFolder from 'material-ui/svg-icons/file/folder';
//import {Accordion,AccordionItem} from './../../components/Accordion';
//import DangerButton from './../../components/DangerButton';
import TextField from 'material-ui/TextField';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Wrapper, InfoLine, InfoBlock, MessageBlock } from './components/shared';
import { WorkspacesSimple } from './components/WorkspacesSimple';
import CreateSiteDialog from './components/CreateSiteDialog';
import PublishSiteDialog from './components/PublishSiteDialog';
import BlockDialog from './components/BlockDialog';
import Spinner from './../../components/Spinner';
import MarkdownIt from 'markdown-it'

import type { EmptyConfigurations, Configurations, SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../../types';

const md = new MarkdownIt({html:true});

//$FlowFixMe
//const Fragment = React.Fragment;

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
            siteCreatorMessage: null
        };
    }

    componentDidUpdate(preProps: HomeProps){
        if(this._ismounted && preProps.siteKey !== this.props.siteKey){
            this.checkSiteInProps();
            //service.api.serveWorkspace(this.props.siteKey, this.props.workspaceKey, "instantly serve at selectWorkspace"/*serveKey*/);
        }
    }

    componentWillMount(){
        window.require('electron').ipcRenderer.on('refreshSites', this.checkSiteInProps.bind(this));
        window.require('electron').ipcRenderer.on('unselectSite', this.unselectSite.bind(this));
        service.registerListener(this);
    }

    componentDidMount(){
        this.checkSiteInProps();
        this._ismounted = true;
    }

    unselectSite(){
        this.setState({currentSiteKey: null});
        this.setState({selectedSite: null, selectedSiteWorkspaces:[]});

        service.getConfigurations(true).then((c)=>{
            var stateUpdate  = {};
            stateUpdate.configurations = c;
            this.setState(stateUpdate);
        });
    }

    checkSiteInProps(){
        var { siteKey, workspaceKey } = this.props;
        if(siteKey && workspaceKey){

            if(this.state.currentSiteKey != siteKey){
                service.api.logToConsole("one time only?");
                // Serve the workspace at selection of the workspace right after mounting the workspace
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
                return service.getWorkspaceDetails(siteKey, workspaceKey);
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

    selectSite(site : SiteConfig ){

        //this.setState({selectedSite: null, selectedSiteWorkspaces:[]});
        this.setState({selectedSite: site, selectedSiteWorkspaces:[]});
        this.setState({currentSiteKey: site.key});

        //load all site configuration to enforce validation
        service.api.listWorkspaces(site.key).then((workspaces)=>{

            this.setState({selectedSiteWorkspaces: workspaces});
            if(workspaces.length === 1){
                this.selectWorkspace(site.key, workspaces[0]);
            }


        });
    }

    getWorkspaceDetails = (workspace: WorkspaceHeader)=> {
        if(this.state.selectedSite==null) throw new Error('Invalid operation.');
        return service.getWorkspaceDetails(this.state.selectedSite.key, workspace.key);
    }

    componentWillUnmount(){
        service.unregisterListener(this);
    }

    renderSelectedSiteContent(configurations: Configurations, site: SiteConfig ){


        return (
            <Wrapper style={{maxWidth:'1000px'}} key={site.key} title="Site Information">

                <InfoLine label="Name">{site.name}</InfoLine>

                { this.renderWorkspaces(site, site.key===this.state.currentSiteKey, this.state.selectedSiteWorkspaces) }

                <div className="markdown"
                style={ styles.creatorMessage }
                dangerouslySetInnerHTML={{__html:this.state.siteCreatorMessage}}></div>

            </Wrapper>
        );
    }

    handleSelectWorkspaceClick = (e, siteKey, workspace)=> {
        e.stopPropagation();
        this.selectWorkspace(siteKey, workspace);
    };

    async selectWorkspace(siteKey: string, workspace : WorkspaceHeader ){


        //let activeWorkspaceKey = this.state.currentWorkspaceKey;
        this.setState({currentWorkspaceKey: workspace.key});

        //      let select = (
            //            activeWorkspaceKey==null ||
            //            activeWorkspaceKey!==workspace.key
        //        );
        let        select = true;

            //    activeSiteKey!==siteKey
            //            activeSiteKey==null ||
        if(select){
            await service.api.mountWorkspace(siteKey, workspace.key);
            this.history.push(`/sites/${decodeURIComponent(siteKey)}/workspaces/${decodeURIComponent(workspace.key)}`);


            // Open a new window with the served site.
            //window.require('electron').shell.openExternal('http://localhost:1313');
        }
        else{
            this.history.push(`/`);
        }
    }

    renderWorkspaces(site: SiteConfig, selectedSiteActive : bool , workspaces : ?Array<WorkspaceHeader>){

        //        service.api.logToConsole("workspace:"+thiscurrentWorkspaceKey);
        return (
            <Route render={({history})=>{

                this.history = history; //ugly

                if(this.state.currentWorkspaceKey==null)
                    return (<Wrapper></Wrapper>);

                //                service.api.logToConsole("currentWorkspaceKey: "+this.state.currentSiteKey);
                //service.api.logToConsole("currentWorkspaceKey: "+this.state.currentWorkspaceKey);
                return (
                    <WorkspacesSimple
                        getWorkspaceDetails={this.getWorkspaceDetails}
                        workspaces={workspaces}
                        activeSiteKey={this.state.currentSiteKey}
                        activeWorkspaceKey={this.state.currentWorkspaceKey}
                        onLocationClick={(location)=>{
                            service.api.openFileExplorer(location)
                        }}
                        onPublishClick={(workspaceHeader, workspace)=>{
                            service.api.parentTempHideMobilePreview();
                            this.setState({publishSiteDialog: {workspace, workspaceHeader, open: true}});
                        }}
                        onStartServerClick={ (workspace, serveKey)=> { service.api.serveWorkspace(site.key, workspace.key, serveKey) } }
                        onSelectWorkspaceClick={ this.handleSelectWorkspaceClick }
                        site={site}
                    />
                )
            }} />
        );
    }

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
            return service.api.publishSite(siteKey, publish);
        }).then(()=>{
            snackMessageService.addSnackMessage('Site successfully published.');
        }).catch(()=>{
            snackMessageService.addSnackMessage('Publish failed.');
        }).then(()=>{
            this.setState({blockingOperation: null});
        })
    }

    renderSelectSites(){
        let { siteKey } = this.props;
        let { selectedSite, configurations, createSiteDialog, publishSiteDialog } = this.state;

        let _configurations = ((configurations: any): Configurations);

        if(configurations==null){
            return <Spinner />
        }
        return (
                <div style={ styles.sitesCol }>
                    <List>
                        <Subheader>All Sites</Subheader>
                        { (_configurations.sites||[]).map((item, index)=>{
                            let selected = item===selectedSite;
                            let active = selectedSite && siteKey===item.key;
                            return (<ListItem
                                key={index}
                                style={selected? styles.siteActiveStyle : styles.siteInactiveStyle }
                                rightIcon={<IconNavigationCheck color={active?this.props.muiTheme.palette.primary1Color:undefined}  />}
                                onClick={ ()=>{ this.selectSite(item); } }
                                primaryText={ item.name }
                            />);
                        })}
                        { configurations.empty || _configurations.global.siteManagementEnabled ? (
                            <ListItem
                                key="add-site"
                                style={ styles.siteInactiveStyle }
                                rightIcon={<IconAdd />}
                                onClick={ this.handleAddSiteClick.bind(this) }
                                primaryText="New"
                            />
                        ) : ( null ) }
                    </List>
                </div>
        );

    }

    render(){

        let { siteKey } = this.props;
        //let { selectedSite, selectedWorkspace, configurations, createSiteDialog, publishSiteDialog } = this.state;
        let { selectedSite, configurations, createSiteDialog, publishSiteDialog } = this.state;

        let _configurations = ((configurations: any): Configurations);

        if(configurations==null){
            return <Spinner />
        }

        return (
            <div style={ styles.container }>

                {this.state.currentSiteKey ? (null) : this.renderSelectSites() }


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
                        workspace={this.state.publishSiteDialog.workspace}
                        workspaceHeader={this.state.publishSiteDialog.workspaceHeader}
                        onCancelClick={this.handlePublishSiteCancelClick}
                        onBuildAndPublishClick={this.handleBuildAndPublishClick}
                        open={publishSiteDialog!=null&&publishSiteDialog.open}
                    />
                ):(null) }

                {/*this should be moved to a UI service*/}
                <BlockDialog open={this.state.blockingOperation!=null}>{this.state.blockingOperation}<span> </span></BlockDialog>
            </div>
        );
    }

}

export default muiThemeable()(Home);
