import Box from '@mui/material/Box';
import { LAYOUT_CONSTANTS } from '../../theme';
import type { MainToolbarProps } from './AppLayout.types';

/**
 * Main area toolbar component.
 * Displays left, center, and right button groups in a flex layout.
 */
const MainToolbar = ({
  leftItems = [],
  centerItems = [],
  rightItems = [],
}: MainToolbarProps) => {
  const { topBarHeight } = LAYOUT_CONSTANTS;

  return (
    <Box
      sx={{
        height: topBarHeight,
        minHeight: topBarHeight,
        display: 'flex',
        alignItems: 'center',
        borderBottom: (theme) => `1px solid ${theme.palette.toolbar.border}`,
        backgroundColor: (theme) => theme.palette.toolbar.background,
      }}
    >
      {/* Left items */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          flex: 1,
          pl: 1,
        }}
      >
        {leftItems}
      </Box>

      {/* Center items */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        }}
      >
        {centerItems}
      </Box>

      {/* Right items */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 0.5,
          flex: 1,
          pr: 1,
        }}
      >
        {rightItems}
      </Box>
    </Box>
  );
};

export default MainToolbar;
