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
  avatarNoFavicon: {
    backgroundColor: red[500],
  }
});


class SiteListItem extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      favicon: ""
    }
    this._ismounted = false;
  }

  componentDidMount(){
    this._ismounted = true;
    this.getFavicon();
  }

  componentWillUnmount(){
    this._ismounted = false;
  }

  getFavicon(){
      if(this.props.site.etalage && this.props.site.etalage.favicons && this.props.site.etalage.favicons.length > 0){
        service.api.getThumbnailForPath(this.props.site.key, 'source', this.props.site.etalage.favicons[0]).then((img)=>{
        this._ismounted && this.setState({favicon:img});
        })
      }
      else{
        this._ismounted && this.setState({favicon:""});
      }
  }

  componentDidUpdate(preProps){
    if(this._ismounted && preProps.site.key !== this.props.site.key){
      this.getFavicon();
    }
  }

  render(){
    const { classes } = this.props;

    let siteAvatar = ( <Avatar aria-label="recipe"  variant="rounded" className={classes.avatarNoFavicon}>
      {this.props.site.name.charAt(0)}
    </Avatar>
    )

    if(this.state.favicon !== ""){
      siteAvatar = <Avatar aria-label="recipe" variant="rounded" src={this.state.favicon} />
    }
    return (

      <React.Fragment>
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
              this.props.itemMenuButton
            }
          </ListItemSecondaryAction>
          )}

        </ListItem>
        {this.props.itemMenuItems}
      </React.Fragment>
    );
  }

}

export default withStyles(useStyles)(SiteListItem);


