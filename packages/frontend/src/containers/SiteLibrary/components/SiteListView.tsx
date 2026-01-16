import React from 'react';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import SiteListItem from './SiteListItem';
import SiteItemMenu from './SiteItemMenu';
import { SiteConfig } from '../../../../types';

interface SiteListViewProps {
  sites: SiteConfig[];
  listTitle: string;
  onSiteClick: (site: SiteConfig) => void;
  onMenuAction: (action: string, site: SiteConfig) => void;
}

const SiteListView = ({ sites, listTitle, onSiteClick, onMenuAction }: SiteListViewProps) => {
  return (
    <List
      style={{ padding: 0 }}
      subheader={
        <ListSubheader component='div' id='nested-list-subheader'>
          {listTitle}
        </ListSubheader>
      }>
      {sites.map((site, index) => {
        const menu = <SiteItemMenu site={site} onMenuAction={onMenuAction} />;
        return <SiteListItem key={"sitelistitem" + index} siteClick={() => onSiteClick(site)} site={site} itemMenuButton={menu} itemMenuItems={null} />;
      })}
    </List>
  );
};

export default SiteListView;
