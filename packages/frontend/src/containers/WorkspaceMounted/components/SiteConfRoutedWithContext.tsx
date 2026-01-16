import { useOutletContext } from 'react-router';
import { SiteConfRouted } from '../SiteConf';
import type { WorkspaceOutletContext } from '../Workspace';

function SiteConfRoutedWithContext() {
  const { siteKey, workspaceKey, modelRefreshKey } = useOutletContext<WorkspaceOutletContext>();

  return (
    <SiteConfRouted
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      modelRefreshKey={modelRefreshKey}
    />
  );
}

export default SiteConfRoutedWithContext;
