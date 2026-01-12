import { useLocation, useParams } from 'react-router';

export interface Breadcrumb {
  label: string;
  path?: string; // undefined for current page (last breadcrumb)
}

/**
 * Hook to generate breadcrumbs from current route.
 * Parses route segments and builds a breadcrumb trail.
 *
 * Examples:
 * - /sites/my-site/workspaces/main → ["Site Library", "My Site", "Main"]
 * - /sites/my-site/workspaces/main/collections/posts → ["My Site", "Main", "Collections", "Posts"]
 * - /prefs/general → ["Preferences", "General"]
 */
function useBreadcrumbs(): Breadcrumb[] {
  const location = useLocation();
  const params = useParams();

  const breadcrumbs: Breadcrumb[] = [];

  // Parse /sites/* routes
  if (location.pathname.startsWith('/sites/')) {
    const { site, workspace, collection, single } = params as {
      site?: string;
      workspace?: string;
      collection?: string;
      single?: string;
    };

    // Add "Site Library" as root
    breadcrumbs.push({ label: 'Site Library', path: '/sites/last' });

    // Add site name if available
    if (site) {
      const siteName = decodeURIComponent(site);

      // Add workspace if available
      if (workspace) {
        // When in workspace context, make site breadcrumb non-clickable
        // Users can use the workspace switcher dropdown to change sites/workspaces
        breadcrumbs.push({
          label: siteName,
          // No path - not clickable
        });
        const workspaceName = decodeURIComponent(workspace);

        // Check if we're deeper in the route
        if (collection || single || location.pathname.includes('/sync') || location.pathname.includes('/siteconf')) {
          // Add workspace as a link (not the last breadcrumb)
          breadcrumbs.push({
            label: workspaceName,
            path: `/sites/${site}/workspaces/${workspace}`,
          });

          // Add section-specific breadcrumbs
          if (collection) {
            breadcrumbs.push({
              label: 'Collections',
              path: `/sites/${site}/workspaces/${workspace}`,
            });
            breadcrumbs.push({ label: decodeURIComponent(collection) });

            // Add item name if viewing specific item
            const pathParts = location.pathname.split('/');
            const collectionIndex = pathParts.indexOf(collection);
            if (collectionIndex > 0 && pathParts[collectionIndex + 1]) {
              const item = pathParts[collectionIndex + 1];
              // Only add if it's not a refresh token
              if (item !== 'refresh' && !item.startsWith(':')) {
                breadcrumbs.push({ label: decodeURIComponent(item) });
              }
            }
          } else if (single) {
            breadcrumbs.push({
              label: 'Singles',
              path: `/sites/${site}/workspaces/${workspace}`,
            });
            breadcrumbs.push({ label: decodeURIComponent(single) });
          } else if (location.pathname.includes('/sync')) {
            breadcrumbs.push({ label: 'Sync' });
          } else if (location.pathname.includes('/siteconf')) {
            breadcrumbs.push({ label: 'Site Configuration' });
          }
        } else {
          // Workspace is the final breadcrumb
          breadcrumbs.push({ label: workspaceName });
        }
      } else {
        // Site without workspace (rare case, maybe workspace selection screen)
        // Make non-clickable since we don't have a default workspace to navigate to
        breadcrumbs.push({
          label: siteName,
          // No path - not clickable
        });
      }
    }
  }
  // Parse /prefs/* routes
  else if (location.pathname.startsWith('/prefs')) {
    breadcrumbs.push({ label: 'Preferences', path: '/prefs' });

    // Add sub-page if exists
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 1) {
      const subPage = pathParts[1];
      // Capitalize first letter
      const subPageLabel = subPage.charAt(0).toUpperCase() + subPage.slice(1);
      breadcrumbs.push({ label: subPageLabel });
    }
  }

  return breadcrumbs;
}

export default useBreadcrumbs;
