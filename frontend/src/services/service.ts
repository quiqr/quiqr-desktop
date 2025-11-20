import { BaseService } from './base-service';
import * as api from './../api';
import {
    serviceSchemas,
    Configurations,
    SiteAndWorkspaceData,
    WorkspaceDetails
} from '../../types';

class Service extends BaseService {

    api: typeof api.instance;
    _configurations: Configurations | undefined;
    _configurationsPromise: Promise<Configurations> | undefined;
    _siteAndWorkspaceDataPromise: Promise<SiteAndWorkspaceData> | undefined;

    constructor() {
        super();
        this.api = api.instance;

        this._configurations = undefined;
        this._configurationsPromise = undefined;
        this._siteAndWorkspaceDataPromise = undefined;
    }

    getConfigurations(refetch?: boolean): Promise<Configurations> {
        if (this._configurations) {
            if (refetch === true)
                this._configurations = undefined;
            else
                return Promise.resolve(this._configurations);
        }
        if (!this._configurationsPromise) {
            this._configurationsPromise = this.api.getConfigurations({ invalidateCache: refetch || false }).then((configurations) => {
                // Validate the response
                const validated = this._validateResponse(
                    'getConfigurations',
                    configurations,
                    serviceSchemas.getConfigurations
                );
                this._configurations = validated;
                this._configurationsPromise = undefined;
                return validated;
            });
        }
        return this._configurationsPromise;
    }

    getSiteAndWorkspaceData(siteKey: string, workspaceKey: string): Promise<SiteAndWorkspaceData> {

        if (this._siteAndWorkspaceDataPromise == null) {

            const bundle: Partial<SiteAndWorkspaceData> = {};

            this._siteAndWorkspaceDataPromise = this.getConfigurations()
                .then((configurations) => {
                    bundle.configurations = configurations;
                    bundle.site = configurations.sites.find(site => { return site.key === siteKey });
                    return this.api.listWorkspaces(siteKey);
                }).then((workspaces) => {
                    bundle.siteWorkspaces = workspaces;
                    bundle.workspace = workspaces.find((workspace) => { return workspace.key === workspaceKey });
                    return this.api.getWorkspaceDetails(siteKey, workspaceKey);
                }).then((workspaceDetails) => {
                    bundle.workspaceDetails = workspaceDetails;
                    this._siteAndWorkspaceDataPromise = undefined;

                    console.log('WORKSPACE DATA·BUNDLE!');
                    console.log(bundle);

                    // Validate the complete bundle before returning
                    const validated = this._validateResponse(
                        'getSiteAndWorkspaceData',
                        bundle,
                        serviceSchemas.getSiteAndWorkspaceData
                    );

                    return validated;
                }).catch(error => {
                    this._siteAndWorkspaceDataPromise = undefined;
                    return Promise.reject(error);
                });
        }

        return this._siteAndWorkspaceDataPromise;
    }

    getWorkspaceDetails(siteKey: string, workspaceKey: string): Promise<WorkspaceDetails> {
        return this.api.getWorkspaceDetails(siteKey, workspaceKey).then((details) => {
            // Validate the response
            return this._validateResponse(
                'getWorkspaceDetails',
                details,
                serviceSchemas.getWorkspaceDetails
            );
        });
    }

    getSiteCreatorMessage(siteKey: string, workspaceKey: string): Promise<string> {
        return this.api.getCreatorMessage(siteKey, workspaceKey).then((message) => {
            // Validate the response
            return this._validateResponse(
                'getSiteCreatorMessage',
                message,
                serviceSchemas.getSiteCreatorMessage
            );
        });
    }

    serveWorkspace(siteKey: string, workspaceKey: string, serveKey: string): void {
        this.api.serveWorkspace(siteKey, workspaceKey, serveKey);
    }

    openWorkspaceDir(siteKey: string, workspaceKey: string): void {
        this.getSiteAndWorkspaceData(siteKey, workspaceKey)
            .then((bundle) => {
                this.api.openFileExplorer(bundle.workspace.path);
            });
    }
}

export default new Service();
