import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import service from './../../../services/service';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DescriptionIcon from '@mui/icons-material/Description';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import FolderIcon from '@mui/icons-material/Folder';
import BallotIcon from '@mui/icons-material/Ballot';

interface SiteConfig {
  key?: string;
  name?: string;
  source?: {
    path?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface FileItem {
  key?: string;
  filename?: string;
  icon?: React.ReactNode;
  [key: string]: unknown;
}

interface ParseInfo {
  baseFile?: string;
  includeFiles?: FileItem[];
  includeFilesSub?: FileItem[];
  partialFiles?: FileItem[];
  [key: string]: unknown;
}

interface SiteConfRouteModelProps {
  siteKey: string;
  workspaceKey: string;
  modelRefreshKey?: number;
}

const SiteConfRouteModel = ({ siteKey, workspaceKey, modelRefreshKey }: SiteConfRouteModelProps) => {
  const navigate = useNavigate();
  const isMountedRef = useRef(false);

  const [siteconf, setSiteconf] = useState<SiteConfig>({});
  const [source, setSource] = useState<{ path?: string; [key: string]: unknown }>({});
  const [parseInfo, setParseInfo] = useState<ParseInfo>({});

  useEffect(() => {
    isMountedRef.current = true;

    const checkSiteInProps = () => {
      service.api.getWorkspaceModelParseInfo(siteKey, workspaceKey).then((info) => {
        if (isMountedRef.current) {
          setParseInfo(info);
        }
      });

      service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle) => {
        if (isMountedRef.current) {
          setSiteconf(bundle.site as SiteConfig);
          if (bundle.site.source) {
            setSource(bundle.site.source as { path?: string; [key: string]: unknown });
          }
        }
      });
    };

    checkSiteInProps();

    return () => {
      isMountedRef.current = false;
    };
  }, [siteKey, workspaceKey, modelRefreshKey]);

  const basePath = `/sites/${siteKey}/workspaces/${workspaceKey}/siteconf`;

  const renderDogFoodIcon = (item: FileItem) => {
    if (item.filename && item.filename.includes('/quiqr/model/includes/menu.yaml')) {
      return (
        <IconButton
          color="primary"
          sx={{ padding: '10px' }}
          aria-label="directions"
          onClick={() => {
            const fileBaseName = item.filename!.split('/').reverse()[0];
            navigate(`${basePath}/dogfoodIncludesMenu/${fileBaseName}`);
          }}
          size="large"
        >
          {item.icon ? item.icon : <BallotIcon />}
        </IconButton>
      );
    }
    return null;
  };

  const renderSection = (title: string, files: FileItem[]) => {
    if (files.length === 0) return null;

    return (
      <Box m={2}>
        <Typography variant="h6">{title}</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {files.map((item, index) => {
            return (
              <Grid container key={'grid' + index} spacing={1} alignItems="flex-end">
                <Grid size={11}>
                  <TextField
                    id="standard-full-width"
                    label={item.key}
                    style={{ margin: 8 }}
                    value={item.filename}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid size={1}>
                  <IconButton
                    color="primary"
                    sx={{ padding: '10px' }}
                    aria-label="directions"
                    onClick={() => {
                      service.api.openFileInEditor(item.filename);
                    }}
                    size="large"
                  >
                    {item.icon ? item.icon : <DescriptionIcon />}
                  </IconButton>
                  {renderDogFoodIcon(item)}
                </Grid>
              </Grid>
            );
          })}
        </Box>
      </Box>
    );
  };

  const includeFiles: FileItem[] = parseInfo?.includeFiles || [];
  const includeFilesSub: FileItem[] = parseInfo?.includeFilesSub || [];
  const partialFiles: FileItem[] = parseInfo?.partialFiles || [];

  return (
    <Box sx={{ padding: '20px', height: '100%' }}>
      <Typography variant="h4">Site: {siteconf.name}</Typography>
      <Typography variant="h5">Model Configuration</Typography>

      {renderSection('Model Directory', [
        { key: 'directory', filename: source.path + '/quiqr/model', icon: <FolderIcon /> },
      ])}
      {renderSection('Base', [{ key: 'baseFile', filename: parseInfo.baseFile }])}
      {renderSection('Include Files', includeFiles)}
      {renderSection('Include Files Subs', includeFilesSub)}
      {renderSection('Partial Files', partialFiles)}
    </Box>
  );
};

export default SiteConfRouteModel;
