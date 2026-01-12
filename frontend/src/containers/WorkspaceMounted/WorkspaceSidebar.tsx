import { useState, useEffect, useCallback, useRef } from 'react';
import service from './../../services/service';
import Sidebar, { SidebarMenu } from '../Sidebar';
import { UserPreferences } from '../../../types';

interface SiteConfig {
  key: string;
  [key: string]: unknown;
}

interface WorkspaceCollection {
  key: string;
  title?: string;
  [key: string]: unknown;
}

interface WorkspaceSingle {
  key: string;
  title?: string;
  [key: string]: unknown;
}

interface WorkspaceMenuItem {
  key: string;
  disabled?: boolean;
  [key: string]: unknown;
}

interface WorkspaceMenu {
  title: string;
  disabled?: boolean;
  matchRole?: string;
  menuItems: WorkspaceMenuItem[];
}

interface WorkspaceDetails {
  collections: WorkspaceCollection[];
  singles: WorkspaceSingle[];
  menu?: WorkspaceMenu[];
}

interface WorkspaceSidebarProps {
  siteKey: string;
  workspaceKey: string;
  hideItems?: boolean;
  menuIsLocked?: boolean;
  onLockMenuClicked?: () => void;
  onToggleItemVisibility?: () => void;
  applicationRole?: string;
  modelRefreshKey?: number;
  collapsed?: boolean;
}

const WorkspaceSidebar = ({
  siteKey,
  workspaceKey,
  hideItems,
  applicationRole,
  modelRefreshKey,
  collapsed,
}: WorkspaceSidebarProps) => {
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceDetails | null>(null);
  const [menusCollapsed, setMenusCollapsed] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showEmpty, setShowEmpty] = useState(false);
  const isMountedRef = useRef(true);

  const refresh = useCallback(() => {
    if (siteKey && workspaceKey) {
      service
        .getSiteAndWorkspaceData(siteKey, workspaceKey)
        .then((bundle) => {
          if (isMountedRef.current) {
            setSite(bundle.site);
            setWorkspace(bundle.workspaceDetails);
            setError(null);
          }
        })
        .catch((e: Error | string) => {
          if (isMountedRef.current) {
            const errorMessage = typeof e === 'string' ? e : e.message;
            setSite(null);
            setWorkspace(null);
            setError(errorMessage);
          }
        });
    }
  }, [siteKey, workspaceKey]);

  useEffect(() => {
    isMountedRef.current = true;
    refresh();

    service.api.readConfKey('prefs').then((value: UserPreferences) => {
      const collapsedMenusKey = siteKey + ':collapsedMenus';
      if (collapsedMenusKey in value && Array.isArray(value[collapsedMenusKey])) {
        setMenusCollapsed(value[collapsedMenusKey] as string[]);
      } else {
        setMenusCollapsed([]);
      }
    });

    return () => {
      isMountedRef.current = false;
    };
  }, [siteKey, workspaceKey, refresh, modelRefreshKey]);

  // Refresh if site becomes null after initial load
  useEffect(() => {
    if (siteKey && !site) {
      refresh();
    }
  }, [siteKey, site, refresh]);

  const matchRole = (menuslot: WorkspaceMenu) => {
    if (
      typeof menuslot.matchRole === 'undefined' ||
      menuslot.matchRole === '' ||
      menuslot.matchRole === 'all' ||
      applicationRole === menuslot.matchRole
    ) {
      return true;
    }
    return false;
  };

  const handleMenuExpandToggle = (menuKey: string) => {
    const collapseList = [...menusCollapsed];
    if (collapseList.includes(menuKey)) {
      const index = collapseList.indexOf(menuKey);
      if (index !== -1) {
        collapseList.splice(index, 1);
      }
    } else {
      collapseList.push(menuKey);
    }

    service.api.saveConfPrefKey(siteKey + ':collapsedMenus', collapseList);
    setMenusCollapsed(collapseList);
  };

  if (showEmpty) {
    return <div />;
  }

  const encodedSiteKey = siteKey ? encodeURIComponent(siteKey) : '';
  const encodedWorkspaceKey = workspaceKey ? encodeURIComponent(workspaceKey) : '';
  const basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}`;

  const menus: SidebarMenu[] = [];

  if (workspace) {
    if (workspace.menu) {
      workspace.menu.forEach((menuslot) => {
        if (matchRole(menuslot) && menuslot.disabled !== true) {
          menus.push({
            title: menuslot.title,
            expandable: true,
            items: menuslot.menuItems
              .filter((item) => item.disabled !== true)
              .map((menuitem) => {
                let item = null;
                let itemType = null;

                if (workspace?.collections?.some((e) => e.key === menuitem.key)) {
                  item = workspace.collections.find((e) => e.key === menuitem.key);
                  itemType = 'collections';
                } else if (workspace?.singles?.some((e) => e.key === menuitem.key)) {
                  item = workspace.singles.find((e) => e.key === menuitem.key);
                  itemType = 'singles';
                }

                if (item) {
                  return {
                    label: item.title || item.key,
                    to: `${basePath}/${itemType}/${encodeURIComponent(item.key)}`,
                    onClick: () => {
                      refresh();
                    },
                    active: false,
                  };
                }
                return {
                  label: menuitem.key + ' (missing)',
                  active: false,
                };
              }),
          });
        }
      });
    } else {
      // COLLECTIONS MENU
      if (workspace.collections.length > 0) {
        menus.push({
          title: 'Collections',
          items: workspace.collections.map((collection) => ({
            label: collection.title || collection.key,
            to: `${basePath}/collections/${encodeURIComponent(collection.key)}`,
            onClick: () => {
              refresh();
            },
            active: false,
          })),
        });
      }

      // SINGLES MENU
      if (workspace.singles.length > 0) {
        menus.push({
          title: 'Singles',
          items: workspace.singles.map((single) => ({
            label: single.title || single.key,
            to: `${basePath}/singles/${encodeURIComponent(single.key)}`,
            onClick: () => {
              refresh();
            },
            active: false,
          })),
        });
      }
    }
  }

  return (
    <>
      <Sidebar
        hideItems={hideItems}
        menus={menus}
        menusCollapsed={menusCollapsed}
        onMenuExpandToggle={handleMenuExpandToggle}
        collapsed={collapsed}
      />
      {error && (
        <p
          style={{
            color: '#EC407A',
            padding: '10px',
            margin: '16px',
            fontSize: '14px',
            border: 'solid 1px #EC407A',
            borderRadius: 3,
          }}
        >
          {error}
        </p>
      )}
    </>
  );
};

export default WorkspaceSidebar;
