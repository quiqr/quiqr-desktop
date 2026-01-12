import { useState, ReactNode, Fragment } from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Box from '@mui/material/Box';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import { SidebarFlatItem, SidebarNestedItem } from '../components/Sidebar';

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
  collapsed?: boolean;
}

const Sidebar = ({
  hideItems,
  menus,
  menusCollapsed = [],
  onMenuExpandToggle,
  statusPanel,
  collapsed = false,
}: SidebarProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleMenuExpand = (menuKey: string) => {
    onMenuExpandToggle?.(menuKey);
  };

  const menusNodes = menus.map((menu, i) => {
    return (
      <Fragment key={i + (menu.key || '') + (menu.title || '')}>
        {menu.items ? (
          <List
            subheader={
              !collapsed ? (
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
              ) : undefined
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
                    return (
                      <SidebarNestedItem
                        key={'itemNest' + index}
                        item={item}
                        index={index}
                        openIndex={openIndex}
                        onToggle={setOpenIndex}
                        collapsed={collapsed}
                      />
                    );
                  }
                  return (
                    <SidebarFlatItem key={'itemFlat' + index} item={item} collapsed={collapsed} />
                  );
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
          width: '100%',
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
