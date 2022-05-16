import React from 'react';
import ListItem                from '@material-ui/core/ListItem';
import ListItemText            from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemAvatar          from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import { red } from '@material-ui/core/colors';
import service              from '../../../services/service';

import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({
  avatar: {
    backgroundColor: red[500],
  }
});


class SiteListItem extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      favicon: ""
    }
  }
  componentDidMount(){
    this._ismounted = true;
    this.getFavicon();
  }

  getFavicon(){
    if(this.props.site.etalage && this.props.site.etalage.favicons && this.props.site.etalage.favicons.length > 0){
      service.api.logToConsole(this.props.site)
      service.api.getThumbnailForPath(this.props.site.key, 'source', this.props.site.etalage.favicons[0]).then((img)=>{
        this.setState({favicon:img});
      })
    }
    else{
      this.setState({favicon:""});
    }
  }

  componentDidUpdate(preProps){
    if(this._ismounted && preProps.site.key !== this.props.site.key){
      this.getFavicon();
    }
  }

  render(){
    const { classes } = this.props;

    let siteAvatar = ( <Avatar aria-label="recipe" className={classes.avatar}>
      {this.props.site.name.charAt(0)}
    </Avatar>
    )

    if(this.state.favicon !== ""){
      siteAvatar = <Avatar aria-label="recipe" className={classes.avatar} src={this.state.favicon} />
    }
    return (

      <ListItem
        id={"list-siteselectable-"+this.props.site.name}
        key={"sitelistitem-"+this.props.site.key}
        onClick={ this.props.siteClick }
        button={true}>

        <ListItemAvatar>
          {siteAvatar}
        </ListItemAvatar>

        <ListItemText primary={this.props.site.name} />
        {(this.props.site.remote?null:
        <ListItemSecondaryAction>
          {
            this.props.itemMenu
          }
        </ListItemSecondaryAction>
        )}

      </ListItem>
    );
  }

}

export default withStyles(useStyles)(SiteListItem);


