import { useOutletContext } from 'react-router';
import { SyncRouted } from '../Sync';
import type { WorkspaceOutletContext } from '../Workspace';

function SyncRoutedWithContext() {
  const { site, workspace, siteKey, workspaceKey, modelRefreshKey } = useOutletContext<WorkspaceOutletContext>();

  return (
    <SyncRouted
      site={site}
      workspace={workspace}
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      modelRefreshKey={modelRefreshKey}
    />
  );
}

export default SyncRoutedWithContext;
