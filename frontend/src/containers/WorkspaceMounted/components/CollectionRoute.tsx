import { useParams, useLocation } from 'react-router';
import Collection from '../Collection';

interface CollectionRouteProps {
  siteKey: string;
  workspaceKey: string;
}

function CollectionRoute({ siteKey, workspaceKey }: CollectionRouteProps) {
  const { collection } = useParams();
  const location = useLocation();

  return (
    <Collection
      key={location.pathname}
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      collectionKey={decodeURIComponent(collection || '')}
    />
  );
}

export default CollectionRoute;
