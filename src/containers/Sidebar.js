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

  render(){
    const { classes } = this.props;

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
                return (

                  <React.Fragment>
                    <ListItem
                      key={index}
                      button
                      selected={item.selected}
                      onClick={()=>{

                        //item.onClick
                        this.setState({open:(this.state.open?false:true)})
                      }}
                    >
                      <ListItemText primary={item.label} />

                      {this.state.open ? <ExpandLess /> : <ExpandMore />}

                    </ListItem>

                    <Collapse in={this.state.open} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        <ListItem button className={classes.nested} >
                          <ListItemIcon>
                            <StarBorder />
                          </ListItemIcon>
                          <ListItemText primary="Starred" />
                        </ListItem>
                      </List>
                    </Collapse>
                  </React.Fragment>

                );
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
