import { Fragment } from 'react';
import { NavLink } from 'react-router';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import Collapse from '@mui/material/Collapse';
import Tooltip from '@mui/material/Tooltip';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import type { SidebarMenuItem } from '../../containers/Sidebar';

interface SidebarNestedItemProps {
  item: SidebarMenuItem;
  index: number;
  openIndex: number | null;
  onToggle: (index: number | null) => void;
  collapsed?: boolean;
}

function SidebarNestedItem({
  item,
  index,
  openIndex,
  onToggle,
  collapsed = false,
}: SidebarNestedItemProps) {
  // Determine if this nested item should be initially open
  let initOpen: boolean | undefined;
  const childItems = item.childItems!.map((itemChild) => {
    if (itemChild.selected) {
      initOpen = true;
    }

    // Child item with NavLink
    if (itemChild.to) {
      return (
        <ListItem key={'itemNestChild' + itemChild.label} disablePadding>
          <NavLink
            to={itemChild.to}
            end={itemChild.exact}
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
                onClick={itemChild.onClick}
                sx={{ pl: collapsed ? 2 : 4 }}
              >
                {!collapsed && <ListItemText primary={itemChild.label} />}
              </ListItemButton>
            )}
          </NavLink>
        </ListItem>
      );
    }

    // Child item with onClick
    return (
      <ListItem key={'itemNestChild' + itemChild.label} disablePadding>
        <ListItemButton
          onClick={itemChild.onClick}
          selected={itemChild.selected}
          sx={{ pl: collapsed ? 2 : 4 }}
        >
          {!collapsed && <ListItemText primary={itemChild.label} />}
        </ListItemButton>
      </ListItem>
    );
  });

  const isOpen = initOpen || openIndex === index;

  const handleToggle = () => {
    if (openIndex === index) {
      onToggle(null);
    } else {
      onToggle(index);
    }
  };

  const parentButton = (
    <Fragment key={'itemNestOut' + item.label}>
      <ListItem disablePadding>
        <ListItemButton selected={item.selected} onClick={handleToggle}>
          {!collapsed && <ListItemText primary={item.label} />}
          {!collapsed && (isOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>

      <Collapse in={isOpen && !collapsed} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {childItems}
        </List>
      </Collapse>
    </Fragment>
  );

  // Wrap in Tooltip when collapsed
  if (collapsed) {
    return (
      <Tooltip title={item.label} placement="right">
        {parentButton}
      </Tooltip>
    );
  }

  return parentButton;
}

export default SidebarNestedItem;
