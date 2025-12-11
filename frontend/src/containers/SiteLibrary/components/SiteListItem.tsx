import { useState, useEffect, useRef } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { red } from '@mui/material/colors';
import service from '../../../services/service';
import { SiteConfig } from '../../../../types';

interface SiteListItemProps {
  site: SiteConfig;
  siteClick: () => void;
  itemMenuButton?: React.ReactNode;
  itemMenuItems?: React.ReactNode;
}

function SiteListItem({ site, siteClick, itemMenuButton, itemMenuItems }: SiteListItemProps) {
  const [favicon, setFavicon] = useState('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchFavicon = async () => {
      if (site.etalage?.favicons && site.etalage.favicons.length > 0) {
        const img = await service.api.getThumbnailForPath(site.key, 'source', site.etalage.favicons[0]);
        if (isMountedRef.current) {
          setFavicon(img);
        }
      } else {
        if (isMountedRef.current) {
          setFavicon('');
        }
      }
    };
    fetchFavicon();
  }, [site.key, site.etalage?.favicons]);

  const siteAvatar =
    favicon !== '' ? (
      <Avatar aria-label="recipe" variant="rounded" src={favicon} />
    ) : (
      <Avatar aria-label="recipe" variant="rounded" sx={{ backgroundColor: red[500] }}>
        {site.name.charAt(0)}
      </Avatar>
    );

  return (
    <>
      <ListItem
        id={'list-siteselectable-' + site.name}
        key={'sitelistitem-' + site.key}
        disablePadding
        secondaryAction={
          site.remote ? null : <ListItemSecondaryAction>{itemMenuButton}</ListItemSecondaryAction>
        }
      >
        <ListItemButton onClick={siteClick}>
          <ListItemAvatar>{siteAvatar}</ListItemAvatar>
          <ListItemText primary={site.name} />
        </ListItemButton>
      </ListItem>
      {itemMenuItems}
    </>
  );
}

export default SiteListItem;
