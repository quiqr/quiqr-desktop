import { ReactNode } from 'react';
import { NavLink } from 'react-router';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import type { SidebarMenuItem } from '../../containers/Sidebar';

interface SidebarFlatItemProps {
  item: SidebarMenuItem;
  collapsed?: boolean;
}

/**
 * Get abbreviated text (first 1-2 characters) for collapsed state
 */
function getAbbreviation(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return '';

  // Take first 2 characters, or 1 if it's a short word
  return trimmed.length === 1 ? trimmed[0] : trimmed.substring(0, 2);
}

function SidebarFlatItem({ item, collapsed = false }: SidebarFlatItemProps) {
  let icon: ReactNode = null;
  let secondaryAction: ReactNode = null;
  let secondaryActionMenu: ReactNode = null;

  if (item.icon) {
    icon = <ListItemIcon sx={{ minWidth: collapsed ? 36 : 40 }}>{item.icon}</ListItemIcon>;
  }

  if (item.secondaryMenu && !collapsed) {
    secondaryActionMenu = item.secondaryMenu;
    secondaryAction = (
      <ListItemSecondaryAction>{item.secondaryButton}</ListItemSecondaryAction>
    );
  }

  // Render content for the button
  const renderButtonContent = () => (
    <>
      {icon}
      {collapsed ? (
        <Box
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            color: 'text.secondary',
            ml: -1,
          }}
        >
          {getAbbreviation(item.label)}
        </Box>
      ) : (
        <ListItemText primary={item.label} />
      )}
      {!collapsed && secondaryActionMenu}
    </>
  );

  // Render with NavLink if `to` prop is provided
  if (item.to) {
    const buttonElement = (
      <ListItem
        key={'itemFlat' + item.label}
        disablePadding
        secondaryAction={!collapsed ? secondaryAction : undefined}
      >
        <NavLink
          to={item.to}
          end={item.exact}
          style={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
            width: '100%',
          }}
        >
          {({ isActive }) => (
            <ListItemButton
              selected={isActive}
              onClick={item.onClick}
              sx={{
                px: collapsed ? 1 : 2,
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              {renderButtonContent()}
            </ListItemButton>
          )}
        </NavLink>
      </ListItem>
    );

    // Wrap in Tooltip when collapsed
    if (collapsed) {
      return (
        <Tooltip title={item.label} placement="right" arrow>
          {buttonElement}
        </Tooltip>
      );
    }

    return buttonElement;
  }

  // Render with onClick if no `to` prop
  const buttonElement = (
    <ListItem
      key={'itemFlat' + item.label}
      disablePadding
      secondaryAction={!collapsed ? secondaryAction : undefined}
    >
      <ListItemButton
        selected={item.selected}
        onClick={item.onClick}
        sx={{
          px: collapsed ? 1 : 2,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        {renderButtonContent()}
      </ListItemButton>
    </ListItem>
  );

  // Wrap in Tooltip when collapsed
  if (collapsed) {
    return (
      <Tooltip title={item.label} placement="right" arrow>
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
}

export default SidebarFlatItem;
