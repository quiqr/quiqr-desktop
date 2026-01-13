import { useOutletContext } from 'react-router';
import Dashboard from '../Dashboard';
import type { WorkspaceOutletContext } from '../Workspace';

function DashboardRoute() {
  const { siteKey, workspaceKey, ssgReady } = useOutletContext<WorkspaceOutletContext>();

  return (
    <Dashboard
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      hugoReady={ssgReady}
    />
  );
}

export default DashboardRoute;
