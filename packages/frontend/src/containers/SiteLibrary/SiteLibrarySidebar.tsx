import { useMemo } from 'react';
import Sidebar from './../Sidebar';
import { useConfigurations } from '../../queries/hooks';

interface SiteLibrarySidebarProps {
  hideItems?: boolean;
  menuIsLocked?: boolean;
  onToggleItemVisibility?: () => void;
  onLockMenuClicked?: () => void;
}

export const SiteLibrarySidebar = (props: SiteLibrarySidebarProps) => {
  // Query: Fetch configurations with cache invalidation
  const { data: configurations } = useConfigurations(true);

  // Derive tags from configurations
  const tags = useMemo(() => {
    if (!configurations?.sites) return [];

    const collectedTags: string[] = [];
    configurations.sites.forEach((site) => {
      if (site.tags) {
        site.tags.forEach((t) => {
          if (!collectedTags.includes(t)) {
            collectedTags.push(t);
          }
        });
      }
    });
    collectedTags.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    return collectedTags;
  }, [configurations]);

  const basePath = `/sites`;

  const tagsMenus = tags.map((tag) => ({
    active: true,
    label: tag,
    to: `${basePath}/tags/${tag}`,
  }));

  const menus = [
    {
      title: 'On this computer',
      items: [
        {
          active: true,
          label: 'All',
          to: `${basePath}/local`,
        },
        {
          active: true,
          label: 'Tags',
          childItems: tagsMenus,
        },
      ],
    },
    {
      title: 'Quiqr Templates',
      items: [
        {
          active: true,
          label: 'Quiqr Community Templates',
          to: `${basePath}/quiqr-community-templates`,
        },
      ],
    },
  ];

  return <Sidebar {...props} menus={menus} />;
};
