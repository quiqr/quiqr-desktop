import { Routes, Route } from 'react-router';
import Dashboard from '../Dashboard';
import { SyncRouted } from '../Sync';
import { SiteConfRouted } from '../SiteConf';
import CollectionRoute from './CollectionRoute';
import CollectionItemRoute from './CollectionItemRoute';
import SingleRoute from './SingleRoute';
import type { SiteConfig } from '../../../../types';

interface WorkspaceConfig {
  serve?: Array<{
    hugoHidePreviewSite?: boolean;
    [key: string]: unknown;
  }>;
  ssgType?: string;
  ssgVersion?: string;
  hugover?: string;
  [key: string]: unknown;
}

interface WorkspaceContentRouterProps {
  siteKey: string;
  workspaceKey: string;
  site: SiteConfig | null;
  workspace: WorkspaceConfig | null;
  modelRefreshKey: number;
  ssgReady: boolean;
}

function WorkspaceContentRouter({
  siteKey,
  workspaceKey,
  site,
  workspace,
  modelRefreshKey,
  ssgReady,
}: WorkspaceContentRouterProps) {
  if (!ssgReady) return null;

  return (
    <Routes>
      <Route
        path="/"
        element={<Dashboard siteKey={siteKey} workspaceKey={workspaceKey} hugoReady={ssgReady} />}
      />
      <Route
        path="home/:refresh"
        element={<Dashboard siteKey={siteKey} workspaceKey={workspaceKey} hugoReady={ssgReady} />}
      />
      <Route
        path="sync/*"
        element={
          <SyncRouted
            site={site}
            workspace={workspace}
            siteKey={siteKey}
            workspaceKey={workspaceKey}
            modelRefreshKey={modelRefreshKey}
          />
        }
      />
      <Route
        path="siteconf/*"
        element={<SiteConfRouted siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />}
      />
      <Route path="collections/:collection" element={<CollectionRoute siteKey={siteKey} workspaceKey={workspaceKey} />} />
      <Route
        path="collections/:collection/:item/:refresh"
        element={<CollectionItemRoute siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />}
      />
      <Route
        path="collections/:collection/:item"
        element={<CollectionItemRoute siteKey={siteKey} workspaceKey={workspaceKey} modelRefreshKey={modelRefreshKey} />}
      />
      <Route
        path="singles/:single/:refresh"
        element={<SingleRoute siteKey={siteKey} workspaceKey={workspaceKey} refreshed={true} modelRefreshKey={modelRefreshKey} />}
      />
      <Route
        path="singles/:single"
        element={<SingleRoute siteKey={siteKey} workspaceKey={workspaceKey} refreshed={false} modelRefreshKey={modelRefreshKey} />}
      />
    </Routes>
  );
}

export default WorkspaceContentRouter;
