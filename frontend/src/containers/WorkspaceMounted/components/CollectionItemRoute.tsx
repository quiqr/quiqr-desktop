import { useParams, useLocation } from 'react-router';
import CollectionItem from '../Collection/CollectionItem';

interface CollectionItemRouteProps {
  siteKey: string;
  workspaceKey: string;
  modelRefreshKey: number;
}

function CollectionItemRoute({
  siteKey,
  workspaceKey,
  modelRefreshKey,
}: CollectionItemRouteProps) {
  const { collection, item } = useParams();
  const location = useLocation();

  return (
    <CollectionItem
      key={location.pathname}
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      collectionKey={decodeURIComponent(collection || '')}
      collectionItemKey={decodeURIComponent(item || '')}
      modelRefreshKey={modelRefreshKey}
    />
  );
}

export default CollectionItemRoute;
