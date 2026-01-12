import { useParams, useLocation, useOutletContext } from 'react-router';
import Collection from '../Collection';
import type { WorkspaceOutletContext } from '../Workspace';

function CollectionRoute() {
  const { collection } = useParams();
  const location = useLocation();
  const { siteKey, workspaceKey } = useOutletContext<WorkspaceOutletContext>();

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
