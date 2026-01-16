import { instance as api } from '../api';
import { serviceSchemas } from '../../types';
import { validateServiceResponse } from '../utils/validation';

export { api };

export function getSiteCreatorMessage(siteKey: string, workspaceKey: string): Promise<string> {
  return api.getCreatorMessage(siteKey, workspaceKey).then((message) => {
    return validateServiceResponse('getSiteCreatorMessage', serviceSchemas.getSiteCreatorMessage, message);
  });
}

export function serveWorkspace(siteKey: string, workspaceKey: string, serveKey: string): void {
  api.serveWorkspace(siteKey, workspaceKey, serveKey);
}

export async function openWorkspaceDir(siteKey: string, workspaceKey: string): Promise<void> {
  const workspaces = await api.listWorkspaces(siteKey);
  const workspace = workspaces.find((ws) => ws.key === workspaceKey);

  if (workspace) {
    api.openFileExplorer(workspace.path, false);
  }
}

let configurationsCache: any;
let configurationsCachePromise: Promise<any> | undefined;

export function clearConfigurationsCache(): void {
  configurationsCache = undefined;
  configurationsCachePromise = undefined;
}
