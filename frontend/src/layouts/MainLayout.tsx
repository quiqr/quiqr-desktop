import * as React from 'react';
import Box from '@mui/material/Box';
import TopToolbarLeft from '../containers/TopToolbarLeft';

interface MainLayoutProps {
  toolbarRight: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  menuIsLocked: boolean;
  forceShowMenu: boolean;
  skipMenuTransition: boolean;
  onContentClick: () => void;
}

const MainLayout = ({
  toolbarRight,
  sidebar,
  children,
  menuIsLocked,
  forceShowMenu,
  skipMenuTransition,
  onContentClick,
}: MainLayoutProps) => {
  return (
    <Box sx={{ marginRight: 0 }}>
      {/* Top Toolbar */}
      <Box
        sx={{
          borderTop: (theme) => `solid 1px ${theme.palette.toolbar.border}`,
          borderBottom: (theme) => `solid 1px ${theme.palette.toolbar.border}`,
          top: 0,
          position: 'absolute',
          display: 'flex',
          width: '100%',
          backgroundColor: (theme) => theme.palette.toolbar.background,
        }}
      >
        {/* Toolbar Left */}
        <Box
          sx={{
            flex: '0 0 280px',
            borderRight: (theme) => `solid 1px ${theme.palette.toolbar.border}`,
            overflowY: 'hidden',
            overflowX: 'hidden',
            height: '50px',
          }}
        >
          <TopToolbarLeft title='Site Library' />
        </Box>

        {/* Toolbar Right */}
        <Box sx={{ flex: 'auto', height: '50px', overflow: 'hidden' }}>
          {toolbarRight}
        </Box>
      </Box>

      {/* Main Container */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          height: 'calc(100vh - 52px)',
          marginTop: '52px',
          overflowX: 'hidden',
        }}
      >
        {/* Sidebar/Menu */}
        <Box
          className="hideScrollbar"
          sx={{
            flex: '0 0 280px',
            overflowY: 'auto',
            overflowX: 'hidden',
            userSelect: 'none',
            background: (theme) => theme.palette.sidebar.background,
            // Dynamic: unlocked menu behavior
            ...(menuIsLocked
              ? {}
              : {
                  position: 'absolute',
                  zIndex: 2,
                  height: '100%',
                  width: '280px',
                  transform: forceShowMenu
                    ? 'translateX(0px)'
                    : 'translateX(-214px)',
                  transition: skipMenuTransition
                    ? 'none'
                    : 'all ease-in-out 0.3s',
                }),
          }}
        >
          {sidebar}
        </Box>

        {/* Content */}
        <Box
          key='main-content'
          onClick={onContentClick}
          sx={{
            flex: 'auto',
            userSelect: 'none',
            overflow: 'auto',
            overflowX: 'hidden',
            // Dynamic: unlocked menu content shift
            ...(menuIsLocked
              ? {}
              : {
                  display: 'block',
                  paddingLeft: '66px',
                  transform: forceShowMenu
                    ? 'translateX(214px)'
                    : 'translateX(0px)',
                  transition: skipMenuTransition
                    ? 'none'
                    : 'all ease-in-out 0.3s',
                }),
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
