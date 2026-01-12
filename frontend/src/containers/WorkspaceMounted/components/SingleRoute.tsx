import { useParams, useLocation } from 'react-router';
import Single from '../Single';

interface SingleRouteProps {
  siteKey: string;
  workspaceKey: string;
  refreshed: boolean;
  modelRefreshKey: number;
}

function SingleRoute({
  siteKey,
  workspaceKey,
  refreshed,
  modelRefreshKey,
}: SingleRouteProps) {
  const { single } = useParams();
  const location = useLocation();

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
