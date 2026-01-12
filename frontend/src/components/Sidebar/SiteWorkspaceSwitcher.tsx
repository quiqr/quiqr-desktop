import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FolderIcon from '@mui/icons-material/Folder';
import CloudIcon from '@mui/icons-material/Cloud';
import service from '../../services/service';
import type { SiteConfig } from '../../../types';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 28,
  height: 28,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  border: `1px solid ${theme.palette.divider}`,
}));

interface SiteWorkspaceSwitcherProps {
  currentSite?: string;
  currentWorkspace?: string;
}

interface SiteItem {
  siteKey: string;
  siteName: string;
  workspaceKey: string;
  workspaceName: string;
  category: 'recent' | 'local' | 'template';
}

function SiteWorkspaceSwitcher({
  currentSite = '',
  currentWorkspace = '',
}: SiteWorkspaceSwitcherProps) {
  const navigate = useNavigate();
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSites = async () => {
      try {
        // Fetch all sites
        const sitesResponse = await service.api.getConfigurations();

        // Fetch recent sites from prefs
        const prefs = await service.api.readConfKey('prefs');
        const recentSites = (prefs.lastOpenedSites as Array<{ siteKey: string }>) || [];

        // Build site items
        const siteItems: SiteItem[] = [];

        // Process each site
        Object.entries(sitesResponse).forEach(([siteKey, siteDataArray]) => {
          // getConfigurations returns arrays, so take first item
          if (!Array.isArray(siteDataArray) || siteDataArray.length === 0) return;

          const site = siteDataArray[0] as SiteConfig;

          // Determine category
          let category: 'recent' | 'local' | 'template' = 'local';
          const isRecent = recentSites.some(
            (recent) => recent.siteKey === siteKey
          );

          if (isRecent) {
            category = 'recent';
          } else if (siteKey.startsWith('quiqr-')) {
            category = 'template';
          }

          // For now, just use 'source' workspace
          // TODO: Support multiple workspaces when backend provides workspace list
          const workspaceKey = 'source';

          siteItems.push({
            siteKey,
            siteName: site.name || siteKey,
            workspaceKey,
            workspaceName: 'Source',
            category,
          });
        });

        // Sort: recent first, then by name
        siteItems.sort((a, b) => {
          if (a.category === 'recent' && b.category !== 'recent') return -1;
          if (a.category !== 'recent' && b.category === 'recent') return 1;
          return a.siteName.localeCompare(b.siteName);
        });

        setSites(siteItems);
      } catch (error) {
        console.error('Failed to load sites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSites();
  }, []);

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;

    if (value === '__new__') {
      // Navigate to "add site" flow
      navigate('/sites/local');
      return;
    }

    const [siteKey, workspaceKey] = value.split('::');
    if (siteKey && workspaceKey) {
      navigate(`/sites/${encodeURIComponent(siteKey)}/workspaces/${encodeURIComponent(workspaceKey)}`);
    }
  };

  const currentValue = `${currentSite}::${currentWorkspace}`;

  // Group sites by category
  const recentSites = sites.filter((s) => s.category === 'recent');
  const localSites = sites.filter((s) => s.category === 'local');
  const templateSites = sites.filter((s) => s.category === 'template');

  return (
    <Select
      value={loading ? '' : currentValue}
      onChange={handleChange}
      displayEmpty
      fullWidth
      size="small"
      sx={{
        '& .MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        },
      }}
    >
      {loading ? (
        <MenuItem value="">
          <ListItemText primary="Loading..." secondary="Please wait" />
        </MenuItem>
      ) : (
        <>
          {recentSites.length > 0 && (
            <>
              <ListSubheader>Recent</ListSubheader>
              {recentSites.map((site) => (
                <MenuItem
                  key={`${site.siteKey}::${site.workspaceKey}`}
                  value={`${site.siteKey}::${site.workspaceKey}`}
                >
                  <StyledAvatar>
                    <FolderIcon sx={{ fontSize: '1rem' }} />
                  </StyledAvatar>
                  <ListItemText
                    primary={site.siteName}
                    secondary={site.workspaceName}
                    sx={{ ml: 1.5 }}
                  />
                </MenuItem>
              ))}
            </>
          )}

          {localSites.length > 0 && (
            <>
              <ListSubheader>Local Sites</ListSubheader>
              {localSites.map((site) => (
                <MenuItem
                  key={`${site.siteKey}::${site.workspaceKey}`}
                  value={`${site.siteKey}::${site.workspaceKey}`}
                >
                  <StyledAvatar>
                    <FolderIcon sx={{ fontSize: '1rem' }} />
                  </StyledAvatar>
                  <ListItemText
                    primary={site.siteName}
                    secondary={site.workspaceName}
                    sx={{ ml: 1.5 }}
                  />
                </MenuItem>
              ))}
            </>
          )}

          {templateSites.length > 0 && (
            <>
              <ListSubheader>Templates</ListSubheader>
              {templateSites.map((site) => (
                <MenuItem
                  key={`${site.siteKey}::${site.workspaceKey}`}
                  value={`${site.siteKey}::${site.workspaceKey}`}
                >
                  <StyledAvatar>
                    <CloudIcon sx={{ fontSize: '1rem' }} />
                  </StyledAvatar>
                  <ListItemText
                    primary={site.siteName}
                    secondary={site.workspaceName}
                    sx={{ ml: 1.5 }}
                  />
                </MenuItem>
              ))}
            </>
          )}

          <Divider sx={{ my: 0.5 }} />
          <MenuItem value="__new__">
            <ListItemIcon>
              <AddRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Add Site" />
          </MenuItem>
        </>
      )}
    </Select>
  );
}

export default SiteWorkspaceSwitcher;
