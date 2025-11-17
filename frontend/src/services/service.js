import { BaseService } from './base-service';
import * as api from './../api';

class Service extends BaseService {

    api;
    _configurations;
    _configurationsPromise;
    _siteAndWorkspaceDataPromise;

    constructor(){
        super();
        this.api = api.instance;

        this._configurations = undefined;
        this._configurationsPromise = undefined;
        this._siteAndWorkspaceDataPromise = undefined;
    }

    getConfigurations(refetch){
        if(this._configurations){
            if(refetch===true)
                this._configurations = null;
            else
                return Promise.resolve(this._configurations);
        }
        if(!this._configurationsPromise){
            this._configurationsPromise = this.api.getConfigurations({invalidateCache: refetch||false}).then((configurations)=>{
                this._configurations = configurations;
                this._configurationsPromise = null;
                return configurations;
            });
        }
        return this._configurationsPromise;
    }

    getSiteAndWorkspaceData(siteKey, workspaceKey) {

        var bundle = {};

        if(this._siteAndWorkspaceDataPromise == null){

            //let errors = [];
            this._siteAndWorkspaceDataPromise = this.getConfigurations()
            .then((configurations)=>{
                bundle.configurations = configurations;
                bundle.site = configurations.sites.find(site => { return site.key === siteKey });
                return this.api.listWorkspaces(siteKey);
            }).then((workspaces)=>{
                bundle.siteWorkspaces = workspaces;
                bundle.workspace = workspaces.find((workspace) => { return workspace.key === workspaceKey });
            }).then(()=>{
                return this.api.getWorkspaceDetails(siteKey, workspaceKey);
            }).then((workspaceDetails)=>{
                bundle.workspaceDetails = workspaceDetails;
                this._siteAndWorkspaceDataPromise = null;
                return bundle;
            }).catch(error=>{
                this._siteAndWorkspaceDataPromise = null;
                return Promise.reject(error);
            });
        }

        return ( this._siteAndWorkspaceDataPromise);
    }

    getWorkspaceDetails(siteKey, workspaceKey){
        return this.api.getWorkspaceDetails(siteKey, workspaceKey);
    }

    getSiteCreatorMessage(siteKey, workspaceKey){
        return this.api.getCreatorMessage(siteKey, workspaceKey);
    }

    serveWorkspace(siteKey, workspaceKey, serveKey){
        this.api.serveWorkspace(siteKey, workspaceKey, serveKey);
    }

    openWorkspaceDir(siteKey, workspaceKey){
        this.getSiteAndWorkspaceData(siteKey, workspaceKey)
        .then((bundle)=>{
            this.api.openFileExplorer(bundle.workspace.path);
        });
    }
}

export default new Service();
