import React                   from 'react';
import { withStyles }          from '@material-ui/core/styles';
import Divider                 from '@material-ui/core/Divider';
import List                    from '@material-ui/core/List';
import ListSubheader           from '@material-ui/core/ListSubheader';
import ListItem                from '@material-ui/core/ListItem';
import ListItemIcon            from '@material-ui/core/ListItemIcon';
import ListItemText            from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Box                     from '@material-ui/core/Box';
import Collapse                from '@material-ui/core/Collapse';
import ExpandLess              from '@material-ui/icons/ExpandLess';
import ExpandMore              from '@material-ui/icons/ExpandMore';
import IconButton              from '@material-ui/core/IconButton';

const useStyles = theme => ({
  nested: {
    paddingLeft: theme.spacing(4),
  },
});

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
    const { classes } = this.props;
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
          button className={classes.nested} >
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
                  <IconButton edge="end" style={{position:'absolute',top:'6px', right: '12px'}}
                    onClick={()=>{
                      this.toggleMenuExpand(menu.title);
                    }}
                  >
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

export default withStyles(useStyles)(Sidebar);
