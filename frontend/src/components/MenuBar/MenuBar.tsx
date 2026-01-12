import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckIcon from '@mui/icons-material/Check';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { WebMenuState, WebMenuDefinition, WebMenuItemDefinition } from '@quiqr/types';

interface MenuBarProps {
  menuState: WebMenuState;
  onMenuAction: (action: string, data?: unknown) => void;
}

/**
 * MenuBar - Full-width menu bar component for standalone mode
 *
 * Inspired by Google Sheets, provides a browser-based menu bar that replaces
 * Electron's native OS menus in client/server mode.
 */
const MenuBar = ({ menuState, onMenuAction }: MenuBarProps) => {
  const [anchorEl, setAnchorEl] = useState<{[key: string]: HTMLElement | null}>({});
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<{[key: string]: HTMLElement | null}>({});

  const handleMenuClick = (menuId: string, event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl({ ...anchorEl, [menuId]: event.currentTarget });
  };

  const handleMenuClose = (menuId: string) => {
    setAnchorEl({ ...anchorEl, [menuId]: null });
    // Close all submenus when main menu closes
    setSubmenuAnchorEl({});
  };

  const handleItemClick = (menuId: string, item: WebMenuItemDefinition) => {
    if (item.action && item.enabled !== false) {
      onMenuAction(item.action);
    }
    handleMenuClose(menuId);
  };

  const handleSubmenuOpen = (itemId: string, event: React.MouseEvent<HTMLElement>) => {
    setSubmenuAnchorEl({ ...submenuAnchorEl, [itemId]: event.currentTarget });
  };

  const handleSubmenuClose = (itemId: string) => {
    setSubmenuAnchorEl({ ...submenuAnchorEl, [itemId]: null });
  };

  const renderMenuItem = (menuId: string, item: WebMenuItemDefinition) => {
    if (item.type === 'separator') {
      return <Divider key={item.id} />;
    }

    if (item.type === 'submenu' && item.submenu) {
      const submenuId = `${menuId}-${item.id}`;
      return (
        <Box key={item.id}>
          <MenuItem
            onMouseEnter={(e) => handleSubmenuOpen(submenuId, e)}
            disabled={item.enabled === false}
            sx={{
              minHeight: 32,
              px: 2,
            }}
          >
            <ListItemText>{item.label}</ListItemText>
            <ChevronRightIcon fontSize="small" sx={{ ml: 1 }} />
          </MenuItem>
          <Menu
            anchorEl={submenuAnchorEl[submenuId]}
            open={Boolean(submenuAnchorEl[submenuId])}
            onClose={() => handleSubmenuClose(submenuId)}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            slotProps={{
              paper: {
                onMouseLeave: () => handleSubmenuClose(submenuId),
              },
            }}
          >
            {item.submenu.map((subItem: WebMenuItemDefinition) => renderMenuItem(menuId, subItem))}
          </Menu>
        </Box>
      );
    }

    return (
      <MenuItem
        key={item.id}
        onClick={() => handleItemClick(menuId, item)}
        disabled={item.enabled === false}
        sx={{
          minHeight: 32,
          px: 2,
        }}
      >
        {item.type === 'checkbox' && (
          <ListItemIcon sx={{ minWidth: 32 }}>
            {item.checked && <CheckIcon fontSize="small" />}
          </ListItemIcon>
        )}
        <ListItemText>{item.label}</ListItemText>
      </MenuItem>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%', // FULL WIDTH
        height: 36,
        minHeight: 36,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.background.paper,
        px: 1,
        alignItems: 'center',
        flexShrink: 0, // Prevent shrinking
      }}
    >
      {menuState.menus.map((menu: WebMenuDefinition) => (
        <Box key={menu.id}>
          <Button
            size="small"
            onClick={(e) => handleMenuClick(menu.id, e)}
            sx={{
              textTransform: 'none',
              color: 'text.primary',
              minWidth: 'auto',
              px: 1.5,
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            {menu.label}
          </Button>

          <Menu
            anchorEl={anchorEl[menu.id]}
            open={Boolean(anchorEl[menu.id])}
            onClose={() => handleMenuClose(menu.id)}
            MenuListProps={{
              dense: true,
              sx: { py: 0.5 },
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            {menu.items.map((item: WebMenuItemDefinition) => renderMenuItem(menu.id, item))}
          </Menu>
        </Box>
      ))}
    </Box>
  );
};

export default MenuBar;
