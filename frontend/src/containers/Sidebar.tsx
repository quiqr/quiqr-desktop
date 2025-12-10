import { useState, ReactNode, Fragment } from 'react';
import { NavLink } from 'react-router';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';

export interface SidebarMenuItem {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  to?: string;
  exact?: boolean;
  active?: boolean;
  icon?: ReactNode;
  secondaryMenu?: ReactNode;
  secondaryButton?: ReactNode;
  childItems?: SidebarMenuItem[];
  spacer?: boolean;
  divider?: boolean;
}

export interface SidebarMenu {
  title?: string;
  key?: string;
  expandable?: boolean;
  items?: SidebarMenuItem[];
}

interface SidebarProps {
  hideItems?: boolean;
  menus: SidebarMenu[];
  menusCollapsed?: string[];
  onMenuExpandToggle?: (menuKey: string) => void;
  statusPanel?: ReactNode;
}

const Sidebar = ({
  hideItems,
  menus,
  menusCollapsed = [],
  onMenuExpandToggle,
  statusPanel,
}: SidebarProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const renderFlatItem = (item: SidebarMenuItem) => {
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

    if (item.to) {
      return (
        <ListItem
          key={'itemFlat' + item.label}
          disablePadding
          secondaryAction={secondaryAction}
        >
          <NavLink
            to={item.to}
            end={item.exact}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
          >
            {({ isActive }) => (
              <ListItemButton selected={isActive} onClick={item.onClick}>
                {icon}
                <ListItemText primary={item.label} />
                {secondaryActionMenu}
              </ListItemButton>
            )}
          </NavLink>
        </ListItem>
      );
    }

    return (
      <ListItem
        key={'itemFlat' + item.label}
        disablePadding
        secondaryAction={secondaryAction}
      >
        <ListItemButton selected={item.selected} onClick={item.onClick}>
          {icon}
          <ListItemText primary={item.label} />
          {secondaryActionMenu}
        </ListItemButton>
      </ListItem>
    );
  };

  const renderNestedItems = (item: SidebarMenuItem, index: number) => {
    let initOpen: boolean | undefined;
    const childItems = item.childItems!.map((itemChild) => {
      if (itemChild.selected) {
        initOpen = true;
      }

      if (itemChild.to) {
        return (
          <ListItem key={'itemNestChild' + itemChild.label} disablePadding>
            <NavLink
              to={itemChild.to}
              end={itemChild.exact}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
            >
              {({ isActive }) => (
                <ListItemButton selected={isActive} onClick={itemChild.onClick} sx={{ pl: 4 }}>
                  <ListItemText primary={itemChild.label} />
                </ListItemButton>
              )}
            </NavLink>
          </ListItem>
        );
      }

      return (
        <ListItem key={'itemNestChild' + itemChild.label} disablePadding>
          <ListItemButton onClick={itemChild.onClick} selected={itemChild.selected} sx={{ pl: 4 }}>
            <ListItemText primary={itemChild.label} />
          </ListItemButton>
        </ListItem>
      );
    });

    const isOpen = initOpen || openIndex === index;

    return (
      <Fragment key={'itemNestOut' + item.label}>
        <ListItem disablePadding>
          <ListItemButton
            selected={item.selected}
            onClick={() => {
              if (openIndex === index) {
                setOpenIndex(null);
              } else {
                setOpenIndex(index);
              }
            }}
          >
            <ListItemText primary={item.label} />
            {isOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {childItems}
          </List>
        </Collapse>
      </Fragment>
    );
  };

  const toggleMenuExpand = (menuKey: string) => {
    onMenuExpandToggle?.(menuKey);
  };

  const menusNodes = menus.map((menu, i) => {
    return (
      <Fragment key={i + (menu.key || '') + (menu.title || '')}>
        {menu.items ? (
          <List
            subheader={
              <ListSubheader component="div" id="nested-list-subheader" disableSticky={true}>
                {menu.title}
                {menu.expandable && (
                  <IconButton
                    edge="end"
                    sx={{ position: 'absolute', top: '6px', right: '12px' }}
                    onClick={() => {
                      if (menu.title) toggleMenuExpand(menu.title);
                    }}
                    size="large"
                  >
                    {menusCollapsed.includes(menu.title || '') ? <ExpandMore /> : <ExpandLess />}
                  </IconButton>
                )}
              </ListSubheader>
            }
          >
            {menusCollapsed.includes(menu.title || '')
              ? null
              : menu.items.map((item, index) => {
                  if (item.spacer) {
                    return <Box key={'menu' + index} py={3} />;
                  }
                  if (item.divider) {
                    return <Divider key={'menu' + index} />;
                  }
                  if (item.childItems) {
                    return renderNestedItems(item, index);
                  }
                  return renderFlatItem(item);
                })}
          </List>
        ) : null}
      </Fragment>
    );
  });

  return (
    <>
      <Box
        sx={{
          width: '280px',
          transition: 'all .2s',
          ...(hideItems && { opacity: 0, pointerEvents: 'none' }),
        }}
      >
        {menusNodes}
      </Box>
      {statusPanel}
    </>
  );
};

export default Sidebar;
