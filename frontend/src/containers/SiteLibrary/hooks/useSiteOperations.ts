import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import service from '../../../services/service';
import { SiteConfig, Workspace } from '../../../../types';

export function useSiteOperations() {
  const navigate = useNavigate();

  const selectWorkspace = useCallback(async (siteKey: string, workspace: Workspace) => {
    await service.api.mountWorkspace(siteKey, workspace.key);
    navigate(
      `/sites/${decodeURIComponent(siteKey)}/workspaces/${decodeURIComponent(workspace.key)}/home/init`
    );
  }, [navigate]);

  const mountSite = useCallback((site: SiteConfig) => {
    service.api.listWorkspaces(site.key).then((workspaces) => {
      if (workspaces.length === 1) {
        selectWorkspace(site.key, workspaces[0]);
      }
    });
  }, [selectWorkspace]);

  const mountSiteByKey = useCallback((siteKey: string) => {
    service.getConfigurations(true).then((c) => {
      const site = c.sites.find((x) => x.key === siteKey);
      if (site) {
        mountSite(site);
      }
    });
  }, [mountSite]);

  return {
    mountSiteByKey,
    selectWorkspace,
    mountSite
  };
}
