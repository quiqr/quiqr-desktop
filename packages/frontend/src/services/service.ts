import * as apiService from './api-service';
import { serviceSchemas, WorkspaceDetails, Configurations, SiteAndWorkspaceData } from '../../types';
import { validateServiceResponse } from '../utils/validation';

// NOTE: Manual caching removed - TanStack Query handles all caching now
// Use query options from /queries/options.ts with useQuery for cached data fetching

// COMPATIBILITY SHIMS (temporary during migration)
// These methods are deprecated - use TanStack Query hooks instead

/**
 * @deprecated Use useConfigurations() hook from /queries/hooks.ts instead
 */
function getConfigurations(refetch?: boolean): Promise<Configurations> {
  return apiService.api.getConfigurations({ invalidateCache: refetch || false }).then((configurations) => {
    return validateServiceResponse('getConfigurations', serviceSchemas.getConfigurations, configurations);
  });
}

/**
 * @deprecated Use useSiteAndWorkspaceData() hook from /queries/hooks.ts instead
 */
function getSiteAndWorkspaceData(siteKey: string, workspaceKey: string): Promise<SiteAndWorkspaceData> {
  const bundle: Partial<SiteAndWorkspaceData> = {};

  return getConfigurations()
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

      const validated = validateServiceResponse(
        'getSiteAndWorkspaceData',
        serviceSchemas.getSiteAndWorkspaceData,
        bundle
      );

      return validated;
    });
}

/**
 * @deprecated Use queryClient.invalidateQueries() instead
 */
function clearCache(): void {
  console.warn('service.clearCache() is deprecated. Use queryClient.invalidateQueries() instead.');
  // No-op - caching is handled by TanStack Query now
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
  // Composition methods with business logic
  getWorkspaceDetails,
  getSiteCreatorMessage,
  serveWorkspace,
  openWorkspaceDir,
  // Compatibility shims (deprecated - migrate to TanStack Query)
  getConfigurations,
  getSiteAndWorkspaceData,
  clearCache,
};

export default service;
