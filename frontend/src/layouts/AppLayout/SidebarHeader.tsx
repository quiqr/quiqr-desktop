import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LAYOUT_CONSTANTS } from '../../theme';
import type { SidebarHeaderProps } from './AppLayout.types';

/**
 * Sidebar header component displaying title/logo.
 * Fixed 52px height matching the main toolbar.
 */
const SidebarHeader = ({ title }: SidebarHeaderProps) => {
  const { topBarHeight } = LAYOUT_CONSTANTS;

  return (
    <Box
      sx={{
        height: topBarHeight,
        minHeight: topBarHeight,
        display: 'flex',
        alignItems: 'center',
        px: 2,
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
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

export default SidebarHeader;
