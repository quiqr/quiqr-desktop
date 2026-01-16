import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SiteWorkspaceSwitcher } from '../../components/Sidebar';
import type { SidebarHeaderProps } from './AppLayout.types';

/**
 * Sidebar header component displaying title/logo.
 * Can optionally display a site/workspace switcher below the title.
 * Height: 52px (default) or 110px (with switcher).
 */
const SidebarHeader = ({ title, siteKey, workspaceKey, showSwitcher }: SidebarHeaderProps) => {

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: 2,
        py: 1.5,
        borderBottom: (theme) => `1px solid ${theme.palette.sidebar.border}`,
      }}
    >
      <Typography
        variant="h6"
        noWrap
        sx={{
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          mb: showSwitcher ? 1 : 0,
        }}
      >
        {title}
      </Typography>

      {showSwitcher && siteKey && workspaceKey && (
        <SiteWorkspaceSwitcher
          currentSite={siteKey}
          currentWorkspace={workspaceKey}
        />
      )}
    </Box>
  );
};

export default SidebarHeader;
