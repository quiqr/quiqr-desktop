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
}

function WorkspaceSidebarSelector({
  siteKey,
  workspaceKey,
  applicationRole,
  modelRefreshKey,
  activeSection,
  site,
  locationKey,
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
      />
    );
  }

  if (activeSection === 'tools') {
    return <SiteConfSidebar siteKey={siteKey} workspaceKey={workspaceKey} />;
  }

  // Default: content section
  return (
    <WorkspaceSidebar
      key={locationKey}
      applicationRole={applicationRole}
      siteKey={siteKey}
      workspaceKey={workspaceKey}
      modelRefreshKey={modelRefreshKey}
    />
  );
}

export default WorkspaceSidebarSelector;
