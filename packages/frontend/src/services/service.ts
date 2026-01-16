import * as apiService from './api-service';
import { serviceSchemas, Configurations, SiteAndWorkspaceData, WorkspaceDetails } from '../../types';
import { validateServiceResponse } from '../utils/validation';

let configurationsCache: Configurations | undefined;
let configurationsCachePromise: Promise<Configurations> | undefined;
let siteAndWorkspaceDataPromise: Promise<SiteAndWorkspaceData> | undefined;

function clearCache(): void {
  configurationsCache = undefined;
  configurationsCachePromise = undefined;
  siteAndWorkspaceDataPromise = undefined;
}

function getConfigurations(refetch?: boolean): Promise<Configurations> {
  if (configurationsCache) {
    if (refetch === true) {
      configurationsCache = undefined;
    } else {
      return Promise.resolve(configurationsCache);
    }
  }
  if (!configurationsCachePromise) {
    configurationsCachePromise = apiService.api
      .getConfigurations({ invalidateCache: refetch || false })
      .then((configurations) => {
        const validated = validateServiceResponse(
          'getConfigurations',
          serviceSchemas.getConfigurations,
          configurations
        );
        configurationsCache = validated;
        configurationsCachePromise = undefined;
        return validated;
      });
  }
  return configurationsCachePromise;
}

function getSiteAndWorkspaceData(siteKey: string, workspaceKey: string): Promise<SiteAndWorkspaceData> {
  if (siteAndWorkspaceDataPromise == null) {
    const bundle: Partial<SiteAndWorkspaceData> = {};

    siteAndWorkspaceDataPromise = getConfigurations()
      .then((configurations) => {
        bundle.configurations = configurations;
        bundle.site = configurations.sites.find((site) => site.key === siteKey);
        return apiService.api.listWorkspaces(siteKey);
      })
      .then((workspaces) => {
        bundle.siteWorkspaces = workspaces;
        bundle.workspace = workspaces.find((workspace) => workspace.key === workspaceKey);
        return apiService.api.getWorkspaceDetails(siteKey, workspaceKey);
      })
      .then((workspaceDetails) => {
        bundle.workspaceDetails = workspaceDetails;
        siteAndWorkspaceDataPromise = undefined;

        const validated = validateServiceResponse(
          'getSiteAndWorkspaceData',
          serviceSchemas.getSiteAndWorkspaceData,
          bundle
        );

        return validated;
      })
      .catch((error) => {
        siteAndWorkspaceDataPromise = undefined;
        return Promise.reject(error);
      });
  }

  return siteAndWorkspaceDataPromise;
}

function getWorkspaceDetails(siteKey: string, workspaceKey: string): Promise<WorkspaceDetails> {
  return apiService.api.getWorkspaceDetails(siteKey, workspaceKey).then((details) => {
    return validateServiceResponse('getWorkspaceDetails', serviceSchemas.getWorkspaceDetails, details);
  });
}

function getSiteCreatorMessage(siteKey: string, workspaceKey: string): Promise<string> {
  return apiService.getSiteCreatorMessage(siteKey, workspaceKey);
}

function serveWorkspace(siteKey: string, workspaceKey: string, serveKey: string): void {
  apiService.serveWorkspace(siteKey, workspaceKey, serveKey);
}

function openWorkspaceDir(siteKey: string, workspaceKey: string): void {
  apiService.openWorkspaceDir(siteKey, workspaceKey);
}

const service = {
  api: apiService.api,
  clearCache,
  getConfigurations,
  getSiteAndWorkspaceData,
  getWorkspaceDetails,
  getSiteCreatorMessage,
  serveWorkspace,
  openWorkspaceDir,
};

export default service;
