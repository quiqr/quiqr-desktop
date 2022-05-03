import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';


/*
import baseTheme from 'material-ui-02/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui-02/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui-02/styles/getMuiTheme';
*/

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
    return (
      <ListItem
        key={index}
        selected={item.selected}
        onClick={ item.onClick }
        button >
        <ListItemText primary={item.label} />
      </ListItem>
    )

  }

  renderNetstedItems(item, index){
    const { classes } = this.props;
    return (
      <React.Fragment>
        <ListItem
          key={index}
          button
          selected={item.selected}
          onClick={()=>{
            if(this.state.open === index){
              this.setState({open:null});
            }
            else{
              this.setState({open:index});
            }
          }}
        >
          <ListItemText primary={item.label} />

          {(this.state.open === index ? <ExpandLess /> : <ExpandMore />)}

        </ListItem>

        <Collapse in={(this.state.open === index ? true : false)} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            { item.childItems.map((itemChild, index)=>{

              return (
                <ListItem
                  onClick={ itemChild.onClick }
                  selected={itemChild.selected}
                  button className={classes.nested} >
                  <ListItemText primary={itemChild.label} />
                </ListItem>
              )


            })}

          </List>
        </Collapse>
      </React.Fragment>
    )


  }

  render(){

    let { hideItems, menus } = this.props;
    let menusNodes = menus.map((menu,i)=>{
      return (
        <React.Fragment key={i+menu.key||i+menu.title}>
          { menu.widget ? (menu.widget) : (null) }
          { menu.items ? (
            <List
              style={{padding: 0}}
              subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                  { menu.title }
                </ListSubheader>
              }>
              { menu.items.map((item, index)=>{
                if(item.childItems){
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
      </React.Fragment>
    );
  }
}

export default withStyles(useStyles)(Sidebar);
