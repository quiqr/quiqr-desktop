import React                   from 'react';
import { NavLink }             from 'react-router';
import Divider                 from '@mui/material/Divider';
import List                    from '@mui/material/List';
import ListSubheader           from '@mui/material/ListSubheader';
import ListItem                from '@mui/material/ListItem';
import ListItemButton          from '@mui/material/ListItemButton';
import ListItemIcon            from '@mui/material/ListItemIcon';
import ListItemText            from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Box                     from '@mui/material/Box';
import Collapse                from '@mui/material/Collapse';
import ExpandLess              from '@mui/icons-material/ExpandLess';
import ExpandMore              from '@mui/icons-material/ExpandMore';
import IconButton              from '@mui/material/IconButton';

export interface SidebarMenuItem {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  to?: string;               // Route path for NavLink navigation
  exact?: boolean;           // Whether to match exact path only (default: false)
  active?: boolean;
  icon?: React.ReactNode;
  secondaryMenu?: React.ReactNode;
  secondaryButton?: React.ReactNode;
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
  statusPanel?: React.ReactNode;
}

interface SidebarState {
  site: null;
  workspace: null;
  open?: number | null;
}

class Sidebar extends React.Component<SidebarProps, SidebarState>{

  constructor(props: SidebarProps){
    super(props);
    this.state = {
      site: null,
      workspace: null
    };
  }

  renderFlatItem(item: SidebarMenuItem, index: number){
    let icon: React.ReactNode = null;
    let secondaryAction: React.ReactNode = null;
    let secondaryActionMenu: React.ReactNode = null;

    if(item.icon){
      icon = (
          <ListItemIcon>
            {item.icon}
          </ListItemIcon>
      )
    }

    if(item.secondaryMenu){
      secondaryActionMenu = item.secondaryMenu;
      secondaryAction = (
        <ListItemSecondaryAction>
          {item.secondaryButton}
        </ListItemSecondaryAction>
      )
    }

    // If `to` is provided, render as NavLink (also supports onClick for side effects)
    if (item.to) {
      return (
        <ListItem
          key={"itemFlat"+item.label}
          disablePadding
          secondaryAction={secondaryAction}>
          <NavLink to={item.to} end={item.exact} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}>
            {({ isActive }) => (
              <ListItemButton selected={isActive} onClick={item.onClick}>
                {icon}
                <ListItemText primary={item.label} />
                {secondaryActionMenu}
              </ListItemButton>
            )}
          </NavLink>
        </ListItem>
      )
    }

    // Otherwise render with onClick handler
    return (
      <ListItem
        key={"itemFlat"+item.label}
        disablePadding
        secondaryAction={secondaryAction}>
        <ListItemButton
          selected={item.selected}
          onClick={ item.onClick }>
          {icon}
          <ListItemText primary={item.label} />
          {secondaryActionMenu}
        </ListItemButton>
      </ListItem>
    )

  }

  renderNestedItems(item: SidebarMenuItem, index: number){
    let initOpen: boolean | undefined;
    let childItems = item.childItems!.map((itemChild, childIndex)=>{

      if(itemChild.selected){
        initOpen = true;
      }

      // If child item has `to`, render as NavLink (also supports onClick for side effects)
      if (itemChild.to) {
        return (
          <ListItem
            key={"itemNestChild"+itemChild.label}
            disablePadding>
            <NavLink to={itemChild.to} end={itemChild.exact} style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}>
              {({ isActive }) => (
                <ListItemButton selected={isActive} onClick={itemChild.onClick} sx={{ pl: 4 }}>
                  <ListItemText primary={itemChild.label} />
                </ListItemButton>
              )}
            </NavLink>
          </ListItem>
        )
      }

      return (
        <ListItem
          key={"itemNestChild"+itemChild.label}
          disablePadding>
          <ListItemButton
            onClick={ itemChild.onClick }
            selected={itemChild.selected}
            sx={{ pl: 4 }}>
            <ListItemText primary={itemChild.label} />
          </ListItemButton>
        </ListItem>
      )
    })


    return (
      <React.Fragment key={"itemNestOut"+item.label} >
        <ListItem disablePadding>
          <ListItemButton
            selected={item.selected}
            onClick={()=>{
              initOpen = false;
              if(this.state.open === index){
                this.setState({open:null});
              }
              else{
                this.setState({open:index});
              }
            }}
          >
            <ListItemText primary={item.label} />

            {( (initOpen || this.state.open === index) ? <ExpandLess /> : <ExpandMore />)}

          </ListItemButton>
        </ListItem>

        <Collapse in={( (initOpen || this.state.open === index) ? true : false)} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {childItems}
          </List>
        </Collapse>
      </React.Fragment>
    )
  }

  toggleMenuExpand(menuKey: string){
    this.props.onMenuExpandToggle?.(menuKey);
  }

  render(){

    let { hideItems, menus, menusCollapsed } = this.props;
    if(!menusCollapsed){
      menusCollapsed = [];
    }
    let menusNodes = menus.map((menu,i)=>{
      return (
        <React.Fragment key={i+menu.key||i+menu.title}>
          { menu.items ? (
            <List
              subheader={

                <ListSubheader component="div" id="nested-list-subheader" disableSticky={true}>
                  { menu.title }

                  { (menu.expandable ?
                  <IconButton
                    edge="end"
                    style={{position:'absolute',top:'6px', right: '12px'}}
                    onClick={()=>{
                      this.toggleMenuExpand(menu.title);
                    }}
                    size="large">
                    { menusCollapsed.includes(menu.title) ? <ExpandMore/> : <ExpandLess/>}
                  </IconButton>
                  : null )
                  }

                </ListSubheader>
              }>

              { menusCollapsed.includes(menu.title) ?
              null
              :

              menu.items.map((item, index)=>{
                if(item.spacer){
                  return <Box key={"menu"+index} py={3}/>
                }
                if(item.divider){
                  return <Divider key={"menu"+index} />
                }
                else if(item.childItems){
                  return this.renderNestedItems(item, index)
                }
                else{
                  return this.renderFlatItem(item, index)
                }
              }) }


            </List >
          ) : (null) }
        </React.Fragment>
      );
    });

    return (
      <React.Fragment>
        <Box
          style={
            Object.assign({}, { width:'280px', transition: 'all .2s' }, hideItems? { opacity:0, pointerEvents:'none' as const } : { opacity:1 })
          }>
          { menusNodes }
        </Box>

        {this.props.statusPanel}

      </React.Fragment>
    );
  }
}

export default Sidebar;
