import { useState, useEffect, useRef } from 'react';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import Avatar from '@mui/material/Avatar';
import { red } from '@mui/material/colors';
import service from '../../../services/service';
import ScreenShotPlaceholder from '../../../img-assets/screenshot-placeholder.png';
import { SiteConfig } from '../../../../types';

interface CardItemProps {
  site: SiteConfig;
  siteClick: () => void;
  itemMenuButton?: React.ReactNode;
  itemMenuItems?: React.ReactNode;
}

function CardItem({ site, siteClick, itemMenuButton, itemMenuItems }: CardItemProps) {
  const [screenshot, setScreenshot] = useState(ScreenShotPlaceholder);
  const [favicon, setFavicon] = useState('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchScreenshot = async () => {
      if (site.screenshotURL) {
        if (isMountedRef.current) {
          setScreenshot(site.screenshotURL);
        }
      } else if (site.etalage?.screenshots && site.etalage.screenshots.length > 0) {
        const img = await service.api.getThumbnailForPath(site.key, 'source', site.etalage.screenshots[0]);
        if (isMountedRef.current) {
          setScreenshot(img);
        }
      } else {
        if (isMountedRef.current) {
          setScreenshot(ScreenShotPlaceholder);
        }
      }
    };
    fetchScreenshot();
  }, [site.key, site.screenshotURL, site.etalage?.screenshots]);

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
      {itemMenuItems}
      <Card elevation={5} sx={{ width: 345 }}>
        <CardHeader
          avatar={siteAvatar}
          action={itemMenuButton}
          title={<div onClick={siteClick}>{site.name}</div>}
          subheader=""
        />
        <CardActionArea>
          <CardMedia
            onClick={siteClick}
            sx={{ height: 0, paddingTop: '56.25%', backgroundColor: '#ccc' }}
            image={screenshot}
            title="Site screenshot"
          />
        </CardActionArea>
      </Card>
    </>
  );
}

export default CardItem;


