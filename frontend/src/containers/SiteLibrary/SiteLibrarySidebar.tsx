import { useState, useEffect } from 'react';
import Sidebar from './../Sidebar';
import service from './../../services/service';

interface SiteLibrarySidebarProps {
  hideItems?: boolean;
  menuIsLocked?: boolean;
  onToggleItemVisibility?: () => void;
  onLockMenuClicked?: () => void;
}

export const SiteLibrarySidebar = (props: SiteLibrarySidebarProps) => {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const loadTags = async () => {
      const c = await service.getConfigurations(true);
      const collectedTags: string[] = [];
      c.sites.forEach((site) => {
        if (site.tags) {
          site.tags.forEach((t) => {
            if (!collectedTags.includes(t)) {
              collectedTags.push(t);
            }
          });
        }
      });
      collectedTags.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      setTags(collectedTags);
    };
    loadTags();
  }, []);

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
