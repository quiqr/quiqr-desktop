import React                   from 'react';
import Divider                 from '@mui/material/Divider';
import List                    from '@mui/material/List';
import ListSubheader           from '@mui/material/ListSubheader';
import ListItem                from '@mui/material/ListItem';
import ListItemIcon            from '@mui/material/ListItemIcon';
import ListItemText            from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Box                     from '@mui/material/Box';
import Collapse                from '@mui/material/Collapse';
import ExpandLess              from '@mui/icons-material/ExpandLess';
import ExpandMore              from '@mui/icons-material/ExpandMore';
import IconButton              from '@mui/material/IconButton';

class Sidebar extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      site: null,
      workspace: null
    };
  }

  renderFlatItem(item, index){
    let icon = null;
    let secondaryAction = null;
    let secondaryActionMenu = null;

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

    return (
      <ListItem
        key={"itemFlat"+item.label}
        selected={item.selected}
        onClick={ item.onClick }
        button>
        {icon}
        <ListItemText primary={item.label} />
        {secondaryActionMenu}
        {secondaryAction}


      </ListItem>
    )

  }

  renderNetstedItems(item, index){
    let initOpen;
    let childItems = item.childItems.map((itemChild, index)=>{

      if(itemChild.selected){
        initOpen = true;
      }

      return (
        <ListItem
          key={"itemNestChild"+itemChild.label}
          onClick={ itemChild.onClick }
          selected={itemChild.selected}
          button sx={{ pl: 4 }} >
          <ListItemText primary={itemChild.label} />
        </ListItem>
      )
    })


    return (
      <React.Fragment key={"itemNestOut"+item.label} >
        <ListItem
          button
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

        </ListItem>

        <Collapse in={( (initOpen || this.state.open === index) ? true : false)} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {childItems}
          </List>
        </Collapse>
      </React.Fragment>
    )
  }

  toggleMenuExpand(menuKey){
    this.props.onMenuExpandToggle(menuKey);
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
                  return this.renderNetstedItems(item, index)
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
            Object.assign({}, { width:'280px', transition: 'all .2s' }, hideItems? { opacity:0, pointerEvents:'none' } : { opacity:1 })
          }>
          { menusNodes }
        </Box>

        {this.props.statusPanel}

      </React.Fragment>
    );
  }
}

export default Sidebar;
