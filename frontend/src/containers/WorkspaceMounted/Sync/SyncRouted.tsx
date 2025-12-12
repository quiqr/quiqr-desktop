import { Routes, Route, useParams } from "react-router";
import SyncRouteGeneral from "./SyncRouteGeneral";
import { SiteConfig } from "../../../../types";

interface WorkspaceConfig {
  [key: string]: unknown;
}

interface SyncRoutedProps {
  site: SiteConfig | null;
  workspace: WorkspaceConfig | null;
  siteKey: string;
  workspaceKey: string;
  modelRefreshKey?: number;
}

// Wrapper for add/:refresh route
const SyncAddRefreshRoute = (props: SyncRoutedProps) => {
  const { refresh } = useParams();
  return <SyncRouteGeneral {...props} addRefresh={decodeURIComponent(refresh || '')} />;
};

// Wrapper for list/:syncConfKey route
const SyncListRoute = (props: SyncRoutedProps) => {
  const { syncConfKey } = useParams();
  return <SyncRouteGeneral {...props} syncConfKey={decodeURIComponent(syncConfKey || '')} />;
};

export const SyncRouted = (props: SyncRoutedProps) => {
  return (
    <Routes>
      <Route path="add/:refresh" element={<SyncAddRefreshRoute {...props} />} />
      <Route path="list/:syncConfKey" element={<SyncListRoute {...props} />} />
      <Route path="/" element={<SyncRouteGeneral {...props} />} />
      <Route path="*" element={<SyncRouteGeneral {...props} />} />
    </Routes>
  );
};
