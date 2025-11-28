import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CardItem from './CardItem';
import SiteItemMenu from './SiteItemMenu';
import { SiteConfig } from '../../../../types';

interface SiteGridViewProps {
  sites: SiteConfig[];
  listTitle: string;
  error?: string | null;
  onSiteClick: (site: SiteConfig) => void;
  onMenuAction: (action: string, site: SiteConfig) => void;
}

const SiteGridView = ({ sites, listTitle, error, onSiteClick, onMenuAction }: SiteGridViewProps) => {
  return (
    <Box m={3}>
      <Box my={3}>
        <Typography variant='h6'>{listTitle}</Typography>
      </Box>

      {error}
      <Grid container spacing={3}>
        {sites.map((site, index) => {
          const menu = <SiteItemMenu site={site} onMenuAction={onMenuAction} />;
          return (
            <Grid key={"siteCard" + index} item>
              <CardItem siteClick={() => onSiteClick(site)} site={site} itemMenuButton={menu} itemMenuItems={null} />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default SiteGridView;
