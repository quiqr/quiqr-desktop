import { useLocation, useParams } from 'react-router';
import { parseNestPath, getBasePath } from '../../utils/nestPath';

export interface Breadcrumb {
  label: string;
  path?: string; // undefined for current page (last breadcrumb)
}

/**
 * Formats a breadcrumb label by converting underscores/hyphens to spaces
 * and capitalizing each word.
 *
 * Examples:
 * - "project_items" → "Project Items"
 * - "blog-posts" → "Blog Posts"
 * - "index.md" → "Index"
 */
function formatBreadcrumbLabel(raw: string): string {
  // Remove file extension if present
  let label = raw.replace(/\.(md|markdown|html)$/i, '');

  // Remove trailing /index if present (for collection items like "project1/index.md")
  label = label.replace(/\/index$/i, '');

  // Replace underscores and hyphens with spaces
  label = label.replace(/[_-]/g, ' ');

  // Capitalize each word
  label = label
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return label;
}

/**
 * Add breadcrumb segments for a nested field path.
 * @param breadcrumbs - Array to append to
 * @param nestPath - Dot-separated nest path (e.g., "author.address")
 * @param basePath - Base URL path without /nest/*
 */
function addNestBreadcrumbs(breadcrumbs: Breadcrumb[], nestPath: string, basePath: string): void {
  const segments = nestPath.split('.');
  let accumulatedPath = '';

  segments.forEach((segment, index) => {
    accumulatedPath = accumulatedPath ? `${accumulatedPath}.${segment}` : segment;
    const isLast = index === segments.length - 1;

    breadcrumbs.push({
      label: formatBreadcrumbLabel(segment),
      path: isLast ? undefined : `${basePath}/nest/${encodeURIComponent(accumulatedPath)}`,
    });
  });
}

/**
 * Hook to generate breadcrumbs from current route.
 * Parses route segments and builds a breadcrumb trail.
 *
 * Examples:
 * - /sites/my-site/workspaces/main → ["Site Library", "My Site", "Main"]
 * - /sites/my-site/workspaces/main/collections/posts/post1 → ["Site Library", "My Site", "Main", "Posts", "Post1"]
 * - /sites/my-site/workspaces/main/singles/about → ["Site Library", "My Site", "Main", "About"]
 * - /prefs/general → ["Preferences", "General"]
 */
function useBreadcrumbs(): Breadcrumb[] {
  const location = useLocation();
  const params = useParams();

  const breadcrumbs: Breadcrumb[] = [];

  // Parse /sites/* routes
  if (location.pathname.startsWith('/sites/')) {
    const { site, workspace, collection, single, item } = params as {
      site?: string;
      workspace?: string;
      collection?: string;
      single?: string;
      item?: string;
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
            const collectionName = decodeURIComponent(collection);

            if (item) {
              // Viewing a specific item - make collection name clickable
              const itemName = decodeURIComponent(item);
              const nestPath = parseNestPath(location.pathname);
              const basePath = getBasePath(location.pathname);

              // Make collection name clickable (links to collection list)
              breadcrumbs.push({
                label: formatBreadcrumbLabel(collectionName),
                path: `/sites/${site}/workspaces/${workspace}/collections/${collection}`,
              });

              if (nestPath) {
                // Collection item with nested view - make item clickable
                breadcrumbs.push({
                  label: formatBreadcrumbLabel(itemName),
                  path: basePath,
                });
                // Add nest path segments
                addNestBreadcrumbs(breadcrumbs, nestPath, basePath);
              } else {
                // Add item as final breadcrumb
                breadcrumbs.push({
                  label: formatBreadcrumbLabel(itemName)
                });
              }
            } else {
              // Collection list view, collection is the final breadcrumb
              breadcrumbs.push({
                label: formatBreadcrumbLabel(collectionName)
              });
            }
          } else if (single) {
            const nestPath = parseNestPath(location.pathname);
            const basePath = getBasePath(location.pathname);

            if (nestPath) {
              // Single with nested view - make single clickable
              breadcrumbs.push({
                label: formatBreadcrumbLabel(decodeURIComponent(single)),
                path: basePath,
              });
              // Add nest path segments
              addNestBreadcrumbs(breadcrumbs, nestPath, basePath);
            } else {
              // Single page - add as final breadcrumb
              breadcrumbs.push({
                label: formatBreadcrumbLabel(decodeURIComponent(single))
              });
            }
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
