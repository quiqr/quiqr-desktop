import WorkspaceSidebar from '../WorkspaceSidebar';
import { SyncSidebar } from '../Sync';
import { SiteConfSidebar } from '../SiteConf';
import type { SiteConfig } from '../../../../types';

interface WorkspaceSidebarSelectorProps {
  siteKey: string;
  workspaceKey: string;
  applicationRole?: string;
  modelRefreshKey: number;
  activeSection: 'content' | 'sync' | 'tools';
  site: SiteConfig | null;
  locationKey: string;
  collapsed?: boolean;
}

function WorkspaceSidebarSelector({
  siteKey,
  workspaceKey,
  applicationRole,
  modelRefreshKey,
  activeSection,
  site,
  locationKey,
  collapsed,
}: WorkspaceSidebarSelectorProps) {
  if (activeSection === 'sync' && site) {
    return (
      <SyncSidebar
        site={
          site as SiteConfig & {
            publish: Array<{ key: string; config?: { type?: string; [key: string]: unknown } }>;
          }
        }
        siteKey={siteKey}
        workspaceKey={workspaceKey}
        collapsed={collapsed}
      />
    );
  }

  if (activeSection === 'tools') {
    return <SiteConfSidebar siteKey={siteKey} workspaceKey={workspaceKey} collapsed={collapsed} />;
  }

  // Default: content section
  return (
    <WorkspaceSidebar
      key={locationKey}
      applicationRole={applicationRole}
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      modelRefreshKey={modelRefreshKey}
      collapsed={collapsed}
    />
  );
}

export default WorkspaceSidebarSelector;
