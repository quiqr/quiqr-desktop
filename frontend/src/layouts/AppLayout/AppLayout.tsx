import Box from '@mui/material/Box';
import CollapsibleSidebar from './CollapsibleSidebar';
import MainToolbar from './MainToolbar';
import { AppBreadcrumbs } from '../../components/Breadcrumbs';
import MenuBar from '../../components/MenuBar';
import InfoDialog from '../../components/InfoDialog';
import { useMenuState } from '../../hooks/useMenuState';
import type { AppLayoutProps } from './AppLayout.types';

/**
 * Main application layout using pure flexbox.
 *
 * Structure (with MenuBar in standalone mode):
 * ┌─────────────────────────────────────────────────────────────┐
 * │ MENU BAR (36px) - FULL WIDTH                                │
 * ├─────────────────────────────────────────────────────────────┤
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
  showSwitcher = false,
  sidebar,
  toolbar,
  children,
}: AppLayoutProps) => {
  const { menuState, executeMenuAction, infoDialog, closeInfoDialog } = useMenuState();
  const hasMenus = menuState.menus.length > 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Menu Bar - FULL WIDTH at top (only in standalone mode) */}
      {hasMenus && (
        <MenuBar menuState={menuState} onMenuAction={executeMenuAction} />
      )}

      {/* Horizontal layout: Sidebar + Main Area */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Collapsible Sidebar */}
        <CollapsibleSidebar
          title={title}
          siteKey={siteKey}
          workspaceKey={workspaceKey}
          showSwitcher={showSwitcher}
        >
          {sidebar}
        </CollapsibleSidebar>

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

          {/* Breadcrumbs */}
          <Box
            sx={{
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              backgroundColor: (theme) => theme.palette.background.paper,
            }}
          >
            <AppBreadcrumbs />
          </Box>

          {/* Main content */}
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

      {/* Info Dialog for menu actions (version info, etc.) */}
      <InfoDialog
        open={infoDialog.open}
        title={infoDialog.title}
        message={infoDialog.message}
        onClose={closeInfoDialog}
      />
    </Box>
  );
};

export default AppLayout;
