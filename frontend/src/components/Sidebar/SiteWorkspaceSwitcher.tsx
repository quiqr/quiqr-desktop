import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import FolderIcon from '@mui/icons-material/Folder';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import service from '../../services/service';
import type { Workspace } from '../../../types';

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

/**
 * Workspace switcher for the current site.
 * Shows all workspaces available for the current site.
 */
function SiteWorkspaceSwitcher({
  currentSite = '',
  currentWorkspace = '',
}: SiteWorkspaceSwitcherProps) {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkspaces = async () => {
      if (!currentSite) {
        setLoading(false);
        return;
      }

      try {
        // Fetch workspaces for the current site
        const workspaceList = await service.api.listWorkspaces(currentSite);
        setWorkspaces(workspaceList);
      } catch (error) {
        console.error('Failed to load workspaces:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkspaces();
  }, [currentSite]);

  const handleChange = (event: SelectChangeEvent) => {
    const workspaceKey = event.target.value;
    if (workspaceKey && currentSite) {
      navigate(`/sites/${encodeURIComponent(currentSite)}/workspaces/${encodeURIComponent(workspaceKey)}`);
    }
  };

  if (loading) {
    return (
      <Select value="" displayEmpty fullWidth size="small" disabled>
        <MenuItem value="">
          <ListItemText primary="Loading..." />
        </MenuItem>
      </Select>
    );
  }

  if (workspaces.length === 0) {
    return (
      <Select value="" displayEmpty fullWidth size="small" disabled>
        <MenuItem value="">
          <ListItemText primary="No workspaces" />
        </MenuItem>
      </Select>
    );
  }

  return (
    <Select
      value={currentWorkspace}
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
      {workspaces.map((workspace) => (
        <MenuItem key={workspace.key} value={workspace.key}>
          <StyledAvatar>
            <FolderIcon sx={{ fontSize: '1rem' }} />
          </StyledAvatar>
          <ListItemText
            primary={workspace.key}
            // secondary={workspace.path}
            sx={{ ml: 1.5 }}
          />
        </MenuItem>
      ))}
    </Select>
  );
}

export default SiteWorkspaceSwitcher;
