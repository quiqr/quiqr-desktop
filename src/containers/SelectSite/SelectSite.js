import { Route } from 'react-router-dom';
import React from 'react';
import service from './../../services/service';
import { snackMessageService } from './../../services/ui-service';
//import FlatButton from 'material-ui/FlatButton';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
//import IconNavigationCheck from 'material-ui/svg-icons/navigation/check';
import IconAdd from 'material-ui/svg-icons/content/add';
//import IconFileFolder from 'material-ui/svg-icons/file/folder';
//import TextField from 'material-ui/TextField';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Wrapper, MessageBlock } from './components/shared';
//import { WorkspacesSimple } from './components/WorkspacesSimple';
import CreateSiteDialog from './components/CreateSiteDialog';
//import PublishSiteDialog from './components/PublishSiteDialog';
import BlockDialog from './components/BlockDialog';
import Spinner from './../../components/Spinner';
//import MarkdownIt from 'markdown-it'

import type { EmptyConfigurations, Configurations, SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../../types';

//const md = new MarkdownIt({html:true});

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

type SelectSiteProps = {
    muiTheme : any,
    siteKey : string,
    workspaceKey : string
}

type SelectSiteState = {
    configurations?: Configurations | EmptyConfigurations,
    selectedSite?: SiteConfig,
    selectedSiteWorkspaces?: Array<any>,
    selectedWorkspace?: WorkspaceHeader,
    selectedWorkspaceDetails?: WorkspaceConfig,
    createSiteDialog: bool,
    publishSiteDialog?: { workspace: WorkspaceConfig, workspaceHeader: WorkspaceHeader, open: bool },
    blockingOperation: ?string //this should be moved to a UI service
}

class SelectSite extends React.Component<SelectSiteProps, SelectSiteState>{


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

    componentWillMount(){
        service.getConfigurations(true).then((c)=>{
            var stateUpdate  = {};
            stateUpdate.configurations = c;
            this.setState(stateUpdate);
        });
    }

    mountSite(site : SiteConfig ){

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

    handleSelectWorkspaceClick = (e, siteKey, workspace)=> {
        e.stopPropagation();
        this.selectWorkspace(siteKey, workspace);
    };

    async selectWorkspace(siteKey: string, workspace : WorkspaceHeader ){

        this.setState({currentWorkspaceKey: workspace.key});

        let select = true;
        if(select){
            await service.api.mountWorkspace(siteKey, workspace.key);
            this.history.push(`/sites/${decodeURIComponent(siteKey)}/workspaces/${decodeURIComponent(workspace.key)}`);
        }
        else{
            this.history.push(`/`);
        }
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
        //let { siteKey } = this.props;
        let { selectedSite, configurations } = this.state;

        let _configurations = ((configurations: any): Configurations);

        if(configurations==null){
            return <Spinner />
        }
        //rightIcon={<IconNavigationCheck color={active?this.props.muiTheme.palette.primary1Color:undefined}  />}
        return (
                <div style={ styles.sitesCol }>
                    <List>
                        <Subheader>All Sites</Subheader>
                        { (_configurations.sites||[]).map((item, index)=>{
                            let selected = item===selectedSite;
                            //let active = selectedSite && siteKey===item.key;
                            return (<ListItem
                                id={"siteselectable-"+item.name}
                                key={index}
                                style={selected? styles.siteActiveStyle : styles.siteInactiveStyle }
                                onClick={ ()=>{ this.mountSite(item); } }
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

        //let { siteKey } = this.props;
        let { configurations, createSiteDialog } = this.state;

        //let _configurations = ((configurations: any): Configurations);

        if(configurations==null){
            return <Spinner />
        }

        return (
            <Route render={({history})=>{

                this.history = history;
                return (

                    <div style={ styles.container }>

                        {this.renderSelectSites()}

                        <div style={styles.selectedSiteCol}>
                            <Wrapper title="Site Management">
                                <MessageBlock>Please, select a site.</MessageBlock>
                            </Wrapper>
                        </div>
                        <CreateSiteDialog
                        open={createSiteDialog}
                        onCancelClick={()=>this.setState({createSiteDialog:false})}
                        onSubmitClick={this.handleCreateSiteSubmit}
                    />

                        {/*this should be moved to a UI service*/}
                        <BlockDialog open={this.state.blockingOperation!=null}>{this.state.blockingOperation}<span> </span></BlockDialog>
                    </div>
                );
            }}
                />
        );
    }

}

export default muiThemeable()(SelectSite);
