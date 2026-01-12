import { ReactNode } from 'react';
import { NavLink } from 'react-router';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Tooltip from '@mui/material/Tooltip';
import type { SidebarMenuItem } from '../../containers/Sidebar';

interface SidebarFlatItemProps {
  item: SidebarMenuItem;
  collapsed?: boolean;
}

function SidebarFlatItem({ item, collapsed = false }: SidebarFlatItemProps) {
  let icon: ReactNode = null;
  let secondaryAction: ReactNode = null;
  let secondaryActionMenu: ReactNode = null;

  if (item.icon) {
    icon = <ListItemIcon>{item.icon}</ListItemIcon>;
  }

  if (item.secondaryMenu) {
    secondaryActionMenu = item.secondaryMenu;
    secondaryAction = (
      <ListItemSecondaryAction>{item.secondaryButton}</ListItemSecondaryAction>
    );
  }

  // Render content for the button
  const renderButtonContent = () => (
    <>
      {icon}
      {!collapsed && <ListItemText primary={item.label} />}
      {secondaryActionMenu}
    </>
  );

  // Render with NavLink if `to` prop is provided
  if (item.to) {
    const buttonElement = (
      <ListItem
        key={'itemFlat' + item.label}
        disablePadding
        secondaryAction={secondaryAction}
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
            <ListItemButton selected={isActive} onClick={item.onClick}>
              {renderButtonContent()}
            </ListItemButton>
          )}
        </NavLink>
      </ListItem>
    );

    // Wrap in Tooltip when collapsed
    if (collapsed) {
      return (
        <Tooltip title={item.label} placement="right">
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
      secondaryAction={secondaryAction}
    >
      <ListItemButton selected={item.selected} onClick={item.onClick}>
        {renderButtonContent()}
      </ListItemButton>
    </ListItem>
  );

  // Wrap in Tooltip when collapsed
  if (collapsed) {
    return (
      <Tooltip title={item.label} placement="right">
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
}

export default SidebarFlatItem;
