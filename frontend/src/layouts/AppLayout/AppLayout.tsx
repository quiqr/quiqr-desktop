import Box from '@mui/material/Box';
import { LAYOUT_CONSTANTS } from '../../theme';
import SidebarHeader from './SidebarHeader';
import MainToolbar from './MainToolbar';
import type { AppLayoutProps } from './AppLayout.types';

/**
 * Main application layout using pure flexbox.
 *
 * Structure:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ SIDEBAR (280px)    │  MAIN AREA (flex)                      │
 * │ ┌────────────────┐ │ ┌─────────────────────────────────────┐│
 * │ │ Title/Logo     │ │ │ Toolbar: [Left] [Center] [Right]   ││
 * │ │ (52px header)  │ │ └─────────────────────────────────────┘│
 * │ ├────────────────┤ │ ┌─────────────────────────────────────┐│
 * │ │                │ │ │                                     ││
 * │ │ Menu Items     │ │ │  Scrollable Content                 ││
 * │ │                │ │ │                                     ││
 * │ └────────────────┘ │ └─────────────────────────────────────┘│
 * └─────────────────────────────────────────────────────────────┘
 *
 * No fixed positioning or margin hacks - pure flexbox layout.
 */
const AppLayout = ({
  title,
  siteKey,
  workspaceKey,
  sidebar,
  toolbar,
  children,
}: AppLayoutProps) => {
  const { sidebarWidth } = LAYOUT_CONSTANTS;

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar - fixed width, full height */}
      <Box
        sx={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: (theme) => theme.palette.sidebar.background,
          borderRight: (theme) => `1px solid ${theme.palette.sidebar.border}`,
        }}
      >
        <SidebarHeader
          title={title}
          siteKey={siteKey}
          workspaceKey={workspaceKey}
        />
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
          {sidebar}
        </Box>
      </Box>

      {/* Main Area - flex grow */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0, // Prevent flex item from overflowing
        }}
      >
        {toolbar && (
          <MainToolbar
            leftItems={toolbar.leftItems}
            centerItems={toolbar.centerItems}
            rightItems={toolbar.rightItems}
          />
        )}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            overflowX: 'hidden',
            userSelect: 'none',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
