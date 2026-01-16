import { useState, useEffect, useRef } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Single from '../Single';
import service from './../../../services/service';

interface SiteConfig {
  key?: string;
  name?: string;
  source?: {
    path?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface SiteConfRouteDogFoodSingleProps {
  siteKey: string;
  workspaceKey: string;
  singleKey: string;
  fileOverride?: string;
  title?: string;
  modelRefreshKey?: number;
}

function SiteConfRouteDogFoodSingle({
  siteKey,
  workspaceKey,
  singleKey,
  fileOverride,
  title,
  modelRefreshKey,
}: SiteConfRouteDogFoodSingleProps) {
  const [siteconf, setSiteconf] = useState<SiteConfig>({});
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const bundle = await service.getSiteAndWorkspaceData(siteKey, workspaceKey);
      if (isMountedRef.current) {
        setSiteconf(bundle.site as SiteConfig);
      }
    };

    loadData();
  }, [siteKey, workspaceKey, modelRefreshKey]);

  return (
    <Box sx={{ padding: '20px', height: '100%' }}>
      <Typography variant="h4">Site: {siteconf.name}</Typography>
      <Typography variant="h5">{title}</Typography>
      <Single
        key={singleKey}
        siteKey={siteKey}
        refreshed={false}
        workspaceKey={workspaceKey}
        singleKey={singleKey}
        fileOverride={typeof fileOverride === 'string' ? fileOverride : null}
        modelRefreshKey={modelRefreshKey}
      />
    </Box>
  );
}

export default SiteConfRouteDogFoodSingle;
