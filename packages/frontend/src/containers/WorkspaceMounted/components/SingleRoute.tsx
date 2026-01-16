import { useParams, useLocation, useOutletContext } from 'react-router';
import Single from '../Single';
import type { WorkspaceOutletContext } from '../Workspace';
import { parseNestPath } from '../../../utils/nestPath';

interface SingleRouteProps {
  refreshed: boolean;
}

function SingleRoute({ refreshed }: SingleRouteProps) {
  const { single } = useParams();
  const location = useLocation();
  const { siteKey, workspaceKey, modelRefreshKey } = useOutletContext<WorkspaceOutletContext>();
  const nestPath = parseNestPath(location.pathname);

  return (
    <Single
      key={location.pathname}
      siteKey={siteKey}
      refreshed={refreshed}
      workspaceKey={workspaceKey}
      singleKey={decodeURIComponent(single || '')}
      modelRefreshKey={modelRefreshKey}
      nestPath={nestPath}
    />
  );
}

export default SingleRoute;
