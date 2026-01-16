import { useState, useEffect, useRef } from 'react';
import service from './../../../services/service';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import FolderIcon from '@mui/icons-material/Folder';
import LaunchIcon from '@mui/icons-material/Launch';
import { UserPreferences } from '../../../../types';

interface SiteConfig {
  key?: string;
  name?: string;
  source?: {
    path?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface SiteConfRouteGeneralProps {
  siteKey: string;
  workspaceKey: string;
  modelRefreshKey?: number;
}

function SiteConfRouteGeneral({ siteKey, workspaceKey, modelRefreshKey }: SiteConfRouteGeneralProps) {
  const [siteconf, setSiteconf] = useState<SiteConfig>({});
  const [source, setSource] = useState<{ path?: string; [key: string]: unknown }>({});
  const [customOpenInCommand, setCustomOpenInCommand] = useState('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const prefs = await service.api.readConfKey('prefs') as UserPreferences;
      if (isMountedRef.current) {
        setCustomOpenInCommand(prefs.customOpenInCommand || '');
      }

      const bundle = await service.getSiteAndWorkspaceData(siteKey, workspaceKey);
      if (isMountedRef.current) {
        setSiteconf(bundle.site as SiteConfig);
        if (bundle.site.source) {
          setSource(bundle.site.source as { path?: string; [key: string]: unknown });
        }
      }
    };

    loadData();
  }, [siteKey, workspaceKey, modelRefreshKey]);

  const sitekey = siteconf.key || '';

  return (
    <Box sx={{ padding: '20px', height: '100%' }}>
      <Typography variant="h4">Site: {siteconf.name}</Typography>
      <Typography variant="h5">General Configuration</Typography>
      <Grid container spacing={1} alignItems="flex-end">
        <Grid size={12}>
          <TextField
            id="standard-full-width"
            label="Site key"
            style={{ margin: 8 }}
            value={sitekey}
            fullWidth
            disabled
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            id="standard-full-width"
            label="Site Name"
            style={{ margin: 8 }}
            value={sitekey}
            fullWidth
            disabled
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid size={10}>
          <TextField
            id="standard-full-width"
            label="Source Directory"
            style={{ margin: 8 }}
            value={source.path}
            fullWidth
            disabled
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>

        <Grid size={2}>
          <IconButton
            color="primary"
            sx={{ padding: '10px' }}
            aria-label="directions"
            onClick={() => {
              service.api.openFileInEditor(source.path);
            }}
            size="large"
          >
            <FolderIcon />
          </IconButton>
          {customOpenInCommand && customOpenInCommand.trim() && (
            <IconButton
              color="primary"
              sx={{ padding: '10px' }}
              aria-label="directions"
              onClick={() => {
                service.api.openCustomCommand(
                  customOpenInCommand.replace('%site_path', source.path ?? '').replace('%site_name', siteconf.name ?? '')
                );
              }}
              size="large"
            >
              <LaunchIcon />
            </IconButton>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default SiteConfRouteGeneral;
