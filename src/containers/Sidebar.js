import React from 'react';

import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
//import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import baseTheme from 'material-ui-02/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui-02/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui-02/styles/getMuiTheme';

const Fragment = React.Fragment;

export type SidebarMenu = {
    title: string,
    key?: string,
    widget?: any,
    items?: Array<{
        active: bool,
        label: string,
        onClick: ()=>void
    }>
}

export type SidebarProps = {
    menus: Array<SidebarMenu>,
    onLockMenuClicked: ()=> void,
    hideItems : bool
}

type SidebarState = {

}

export class Sidebar extends React.Component<SidebarProps,SidebarState>{

    constructor(props : SidebarProps){
        super(props);
        this.state = {
            site: null,
            workspace: null
        };
    }

    render(){

        let { hideItems, menus } = this.props;
        let menusNodes = menus.map((menu,i)=>{
        return (
            <Fragment key={i+menu.key||i+menu.title}>
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

                              <ListItem
                                key={index}
                                button
                                selected={item.selected}
                                onClick={item.onClick}
                              >
                                <ListItemText primary={item.label} />
                              </ListItem>

                            );
                        }) }
                    </List >
             ) : (null) }
            </Fragment>
        );
    });

      return (
        <MuiThemeProvider muiTheme={getMuiTheme(baseTheme)}>
          <React.Fragment>
            <div className={'slideFadeInRight animated'}  style={{position:'relative', opacity: 1}}>

              <div style={ Object.assign({},
                { width:'280px', transition: 'all .2s' },
                hideItems? { opacity:0, pointerEvents:'none' } : { opacity:1 }
              )}>

                { menusNodes }

                <br />
              </div>
            </div>
          </React.Fragment>
        </MuiThemeProvider>
    );
  }
}
