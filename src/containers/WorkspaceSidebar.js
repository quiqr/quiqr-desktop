//@flow

import React from 'react';
import { Route } from 'react-router-dom'
import {List, ListItem } from 'material-ui/List';
import { Divider, Toggle } from 'material-ui';
import IconActionSetting from 'material-ui/svg-icons/action/settings';
import IconOpenBrowser from 'material-ui/svg-icons/action/open-in-browser';
import IconHome from 'material-ui/svg-icons/action/home';
import IconPhone from 'material-ui/svg-icons/hardware/smartphone';
//import IconActionList from 'material-ui/svg-icons/action/list';
//import IconLockMenu from 'material-ui/svg-icons/action/lock-outline';
//import IconMenu from 'material-ui/svg-icons/navigation/menu';
//import IconMore from 'material-ui/svg-icons/navigation/more-vert';
//import IconFileFolder from 'material-ui/svg-icons/file/folder';
//import Border from './../components/Border';
//import { TriggerWithOptions } from './../components/TriggerWithOptions';
import service from './../services/service'
import type { SiteConfig, WorkspaceConfig } from './../types'
import * as Sidebar from './Sidebar';

const translucentColor = 'RGBA(255,255,255,.8)';
//const translucentColorSubtle = 'RGBA(255,255,255,.05)';

/*let MenuBorder = ({ children }) => {
    return <Border style={{margin: '0 16px', borderRadius:3, padding: '1px', borderColor:translucentColor}}>
        {children}
        </Border>;
}
*/

type WorkspaceWidgetProps = {
    onClick : ()=> void,
    siteConfig : ?SiteConfig,
    workspaceConfig : ?WorkspaceConfig
}

class WorkspaceWidget extends React.Component<WorkspaceWidgetProps,any> {

    constructor(props : WorkspaceWidgetProps){
        super(props);
        this.state = {
            hugoRunning: false
        };
    }

    componentDidMount(){
        this._ismounted = true;
    }
    componentWillMount(){
        window.require('electron').ipcRenderer.on('serverLive', this.activatePreview.bind(this));
        window.require('electron').ipcRenderer.on('serverDown', this.disablePreview.bind(this));
        window.require('electron').ipcRenderer.on('disableMobilePreview', this.disableMobilePreview.bind(this));
        window.require('electron').ipcRenderer.on('tempHideMobilePreview', this.tempHideMobilePreview.bind(this));
        window.require('electron').ipcRenderer.on('tempUnHideMobilePreview', this.tempUnHideMobilePreview.bind(this));
    }

    componentWillUnmount(){
        window.require('electron').ipcRenderer.removeListener('serverLive', this.activatePreview.bind(this));
        window.require('electron').ipcRenderer.removeListener('serverDown', this.disablePreview.bind(this));
        window.require('electron').ipcRenderer.removeListener('tempHideMobilePreview', this.tempHideMobilePreview.bind(this));
        window.require('electron').ipcRenderer.removeListener('tempUnHideMobilePreview', this.tempUnHideMobilePreview.bind(this));
        this._ismounted = false;
    }



    handleOpenInBrowser(){
        let {
            siteConfig,
            workspaceConfig,
        } = this.props;

        if(!this.state.hugoRunning){
            service.api.serveWorkspace(siteConfig.key, workspaceConfig.key, "instantly serve at selectWorkspace");
        }
        window.require('electron').shell.openExternal('http://localhost:1313');
    }

    toggleMobilePreview(){
        if(this.state.mobilePreviewActive){
            this.disableMobilePreview();
        } else{
            this.activateMobilePreview();
        }
    }

    activateMobilePreview(){
        service.api.openMobilePreview();
        if(this._ismounted){
            this.setState({mobilePreviewActive: true});
        }
    }

    tempHideMobilePreview(){
        if(this._ismounted){
            if(this.state.mobilePreviewActive){
                service.api.closeMobilePreview();
                this.setState({mobilePreviewTempHidden: true});
            }
        }
    }
    tempUnHideMobilePreview(){
        if(this._ismounted){
            if(this.state.mobilePreviewActive){
                service.api.openMobilePreview();
                this.setState({mobilePreviewTempHidden: false});
            }
        }
    }

    disableMobilePreview(){
        service.api.closeMobilePreview();
        if(this._ismounted){
            this.setState({mobilePreviewActive: false});
        }
    }

    activatePreview(){
        if(this._ismounted){
            this.setState({hugoRunning: true});
        }
    }

    disablePreview(){
        if(this._ismounted){
            this.setState({hugoRunning: false});
        }
    }
    renderSiteMounted(){

        let {
            onClick,
            siteConfig,
        } = this.props;


        //let serverOptions = workspaceConfig != null && workspaceConfig.serve != null ? workspaceConfig.serve.map(x => x.key||'default') : [];

        let mobilePreviewToggle = <Toggle
            toggled={this.state.mobilePreviewActive}
            onToggle={(e,value)=>{ this.toggleMobilePreview() }}
            style={{marginRight: 24}}
            labelPosition='right' />

        return (
                <div style={{paddingLeft:'0px'}}>
                    <List style={{padding: 0}}>
                        <ListItem
                        primaryText={siteConfig.name}
                        secondaryText="Dashboard, publish and help"
                        onClick={onClick}
                        leftIcon={<IconHome color="white" style={{}} />}
                        />
                        <ListItem
                        primaryText="Mobile preview"
                        onClick={(e,value)=>{ this.toggleMobilePreview() }}
                        secondaryText="Open preview panel"
                        rightIcon={mobilePreviewToggle}
                        leftIcon={<IconPhone color="white"  />} />
                        <ListItem
                        primaryText="Browser preview"
                        secondaryText="Preview in default browser"
                        onClick={ ()=>{this.handleOpenInBrowser()} }
                        leftIcon={<IconOpenBrowser color="white" style={{marginRight:0}} />} />
                    </List>
                    <Divider/>
                </div>
        );

        /* activate later
        return (
                <div style={{paddingLeft:'0px'}}>

                    <List style={{padding: 0}} dense={true}>
                        <ListItem secondaryText="Dashboard, options and help" primaryText={siteConfig.name} onClick={onClick} leftIcon={<IconHome color="white" style={{}} />} />
                    </List>

                    <Divider/>

                </div>
        );
        */
    }
    renderSelectSite(){

        let {
            onClick,
        } = this.props;

        return (
            <List>
                <ListItem
                secondaryText={'select a website'}
                onClick={onClick}
                rightIcon={<IconActionSetting color={translucentColor} />}
                />
            </List>
            )
        }

    render(){
        let {
            siteConfig,
            workspaceConfig,
        } = this.props;


        //let serverOptions = workspaceConfig!=null&&workspaceConfig.serve!=null?workspaceConfig.serve.map(x => x.key||'default') : [];

        if(siteConfig!=null && workspaceConfig!=null){
            return this.renderSiteMounted();
        }
        else{
            return this.renderSelectSite();
        }
    }
}

type WorkspaceSidebarProps = {
    siteKey : ?string,
    workspaceKey : ?string,
    history: any,
    onLockMenuClicked: ()=> void,
    onToggleItemVisibility: ()=> void,
    hideItems : bool
}

type WorkspaceSidebarState = {
    site : any,
    workspace : any,
    error: any
}


class WorkspaceSidebar extends React.Component<WorkspaceSidebarProps,WorkspaceSidebarState>{

    constructor(props : WorkspaceSidebarProps){
        super(props);
        this.state = {
            site: null,
            workspace: null,
            error: null
        };
    }

    componentDidMount(){
        this._ismounted = true;
        this.refresh();
    }

    componentDidUpdate(preProps: compProps){

        if(preProps.siteKey){

            if(!this.state.site)
            {
                this.refresh();
            }
        }
    }
    componentWillMount(){
        //window.require('electron').ipcRenderer.on('unselectSite', this.unselectSite.bind(this));
        service.registerListener(this);
    }

    refresh = ()=>{
        let {siteKey, workspaceKey } = this.props;
        if(siteKey && workspaceKey){
            let stateUpdate = {};
            service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle)=>{
                stateUpdate.site = bundle.site;
                stateUpdate.workspace = bundle.workspaceDetails;
                if(this._ismounted){
                    this.setState(stateUpdate);
                }
            }).catch(e=>{
                if(this._ismounted){
                    this.setState({site: null, workspace: null, error: e});
                }
            });
        }
    }

    componentWillUnmount(){
        service.unregisterListener(this);
        //window.require('electron').ipcRenderer.removeListener('unselectSite', this.unselectSite.bind(this));
        this._ismounted = false;
    }

    render(){
        return (<Route render={({history})=>{ return this.renderWithRoute(history) }} />);
    }

    renderWithRoute(history: any){

        let encodedSiteKey = this.props.siteKey ? encodeURIComponent(this.props.siteKey) : '';
        let encodedWorkspaceKey = this.props.workspaceKey ? encodeURIComponent(this.props.workspaceKey) : '';
        let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}`;

        let menus: Array<Sidebar.SidebarMenu> = [];

        //append workspace widget
        menus.push({
            //title: 'Current website',
            widget: (
                <WorkspaceWidget
                siteConfig={this.state.site}
                workspaceConfig={this.state.workspace}
                onClick={()=>{
                    if(this.state.error!=null){
                        history.push('/');
                        this.refresh();
                    }
                    else if(this.state.site!=null){
                        history.push(basePath);
                        this.refresh();
                    }
                }} />
            )
        });

        if(this.state.workspace){

            if("menu" in this.state.workspace){
                this.state.workspace.menu.map((menuslot, index) => {
                    //collections menu
                    menus.push({
                        title: menuslot.title,
                        items: menuslot.menuItems.map((menuitem, index) => {
                            let item = null;
                            let itemType = null;

                            if(this.state.workspace.collections.some(e => e.key === menuitem.key)) {
                                item = this.state.workspace.collections.find(e => e.key === menuitem.key);
                                itemType = "collections";
                            }
                            else if(this.state.workspace.singles.some(e => e.key === menuitem.key)) {
                                item = this.state.workspace.singles.find(e => e.key === menuitem.key);
                                itemType = "singles";
                            }

                            if(item){
                                return {
                                    label: item.title,
                                    onClick: () => {
                                        history.push(`${basePath}/${itemType}/${encodeURIComponent(item.key)}`);
                                        this.refresh();
                                    },
                                    active: false
                                }
                            }
                            else{
                                return {
                                    label: menuitem.key +' (missing)',
                                    active: false
                                }
                            }

                        })
                    });
                    return null;

                });

            }
            else{
                //collections menu
                menus.push({
                    title: 'Items',
                    items: this.state.workspace.collections.map((collection, index) => {
                        return {
                            label: collection.title,
                            onClick: () => {
                                history.push(`${basePath}/collections/${encodeURIComponent(collection.key)}`);
                                this.refresh();
                            },
                            active: false
                        }
                    })
                });

                //singles menu
                menus.push({
                    title: 'Pages',
                    items: this.state.workspace.singles.map((collection, index) => {
                        return {
                            label: collection.title,
                            onClick: () => {
                                history.push(`${basePath}/singles/${encodeURIComponent(collection.key)}`)
                                this.refresh();
                            },
                            active: false
                        }
                    })
                });

            }
        }

        return (<React.Fragment>
            <Sidebar.Sidebar
            hideItems={this.props.hideItems}
            menuIsLocked={this.props.menuIsLocked}
            menus={menus}
            onLockMenuClicked={this.props.onLockMenuClicked}
            onToggleItemVisibility={this.props.onToggleItemVisibility}
        />
                { this.state.error && (<p style={{
                    color: '#EC407A', padding: '10px', margin: '16px',
                    fontSize:'14px', border: 'solid 1px #EC407A',
                    borderRadius:3
                }}>{this.state.error}</p>) }
            </React.Fragment>
        )
    }
}

export default WorkspaceSidebar;
