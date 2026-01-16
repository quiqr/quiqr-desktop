// Re-export all API functions for direct import
export * from '../api';

import * as apiModule from '../api';
import { serviceSchemas } from '../../types';
import { validateServiceResponse } from '../utils/validation';

// Create api object for backward compatibility with service.api.method() pattern
export const api = apiModule;

export function getSiteCreatorMessage(siteKey: string, workspaceKey: string): Promise<string> {
  return apiModule.getCreatorMessage(siteKey, workspaceKey).then((message) => {
    return validateServiceResponse('getSiteCreatorMessage', serviceSchemas.getSiteCreatorMessage, message);
  });
}

export function serveWorkspace(siteKey: string, workspaceKey: string, serveKey: string): void {
  apiModule.serveWorkspace(siteKey, workspaceKey, serveKey);
}

export async function openWorkspaceDir(siteKey: string, workspaceKey: string): Promise<void> {
  const workspaces = await apiModule.listWorkspaces(siteKey);
  const workspace = workspaces.find((ws) => ws.key === workspaceKey);

  if (workspace) {
    apiModule.openFileExplorer(workspace.path, false);
  }
}

let configurationsCache: any;
let configurationsCachePromise: Promise<any> | undefined;

export function clearConfigurationsCache(): void {
  configurationsCache = undefined;
  configurationsCachePromise = undefined;
}
