import { useParams, useLocation, useOutletContext } from 'react-router';
import Single from '../Single';
import type { WorkspaceOutletContext } from '../Workspace';

interface SingleRouteProps {
  refreshed: boolean;
}

function SingleRoute({ refreshed }: SingleRouteProps) {
  const { single } = useParams();
  const location = useLocation();
  const { siteKey, workspaceKey, modelRefreshKey } = useOutletContext<WorkspaceOutletContext>();

  return (
    <Single
      key={location.pathname}
      siteKey={siteKey}
      refreshed={refreshed}
      workspaceKey={workspaceKey}
      singleKey={decodeURIComponent(single || '')}
      modelRefreshKey={modelRefreshKey}
    />
  );
}

export default SingleRoute;
