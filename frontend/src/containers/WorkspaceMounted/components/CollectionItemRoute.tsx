import { useParams, useLocation, useOutletContext } from 'react-router';
import CollectionItem from '../Collection/CollectionItem';
import type { WorkspaceOutletContext } from '../Workspace';
import { parseNestPath } from '../../../utils/nestPath';

function CollectionItemRoute() {
  const { collection, item } = useParams();
  const location = useLocation();
  const { siteKey, workspaceKey, modelRefreshKey } = useOutletContext<WorkspaceOutletContext>();
  const nestPath = parseNestPath(location.pathname);

  return (
    <CollectionItem
      key={location.pathname}
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      collectionKey={decodeURIComponent(collection || '')}
      collectionItemKey={decodeURIComponent(item || '')}
      modelRefreshKey={modelRefreshKey}
      nestPath={nestPath}
    />
  );
}

export default CollectionItemRoute;
