import { useState, ReactNode, ReactElement, cloneElement, isValidElement } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { LAYOUT_CONSTANTS } from '../../theme';
import { SiteWorkspaceSwitcher } from '../../components/Sidebar';

interface CollapsibleSidebarProps {
  /** Sidebar content (menu items) */
  children: ReactNode;
  /** Title displayed in the sidebar header */
  title: string;
  /** Optional site key for context */
  siteKey?: string;
  /** Optional workspace key for context */
  workspaceKey?: string;
  /** Whether to show the site/workspace switcher dropdown */
  showSwitcher?: boolean;
}

/**
 * Collapsible sidebar wrapper that manages collapse/expand state.
 * Width: 280px (expanded) / 60px (collapsed)
 * State persists in localStorage.
 */
const CollapsibleSidebar = ({
  children,
  title,
  siteKey,
  workspaceKey,
  showSwitcher = false,
}: CollapsibleSidebarProps) => {
  const { sidebarWidth, sidebarCollapsedWidth } = LAYOUT_CONSTANTS;

  // Load collapsed state from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar:collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    try {
      localStorage.setItem('sidebar:collapsed', String(newState));
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
    }
  };

  const currentWidth = collapsed ? sidebarCollapsedWidth : sidebarWidth;

  return (
    <Box
      sx={{
        width: currentWidth,
        minWidth: currentWidth,
        transition: 'width 0.2s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: (theme) => theme.palette.sidebar.background,
        borderRight: (theme) => `1px solid ${theme.palette.sidebar.border}`,
      }}
    >
      {/* Header with collapse button */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          px: collapsed ? 1 : 2,
          py: 1.5,
          borderBottom: (theme) => `1px solid ${theme.palette.sidebar.border}`,
          transition: 'padding 0.2s ease-in-out',
        }}
      >
        {/* Title and collapse button row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            mb: showSwitcher && !collapsed ? 1 : 0,
          }}
        >
          {!collapsed && (
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </Typography>
          )}

          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <IconButton
              onClick={toggleCollapse}
              size="small"
              sx={{
                ml: collapsed ? 0 : 1,
              }}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Site/workspace switcher (only shown when expanded) */}
        {showSwitcher && !collapsed && siteKey && workspaceKey && (
          <SiteWorkspaceSwitcher currentSite={siteKey} currentWorkspace={workspaceKey} />
        )}
      </Box>

      {/* Scrollable content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          overflowX: 'hidden',
          // Hide scrollbar
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {/* Pass collapsed state to sidebar components via cloneElement */}
        {isValidElement(children)
          ? cloneElement(children as ReactElement<{ collapsed?: boolean }>, { collapsed })
          : children}
      </Box>
    </Box>
  );
};

export default CollapsibleSidebar;
