import { useParams, useLocation, useOutletContext } from 'react-router';
import CollectionItem from '../Collection/CollectionItem';
import type { WorkspaceOutletContext } from '../Workspace';

function CollectionItemRoute() {
  const { collection, item } = useParams();
  const location = useLocation();
  const { siteKey, workspaceKey, modelRefreshKey } = useOutletContext<WorkspaceOutletContext>();

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
