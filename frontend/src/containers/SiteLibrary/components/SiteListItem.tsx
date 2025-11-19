import React from 'react';
import ListItem                from '@mui/material/ListItem';
import ListItemText            from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemAvatar          from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { red } from '@mui/material/colors';
import service              from '../../../services/service';

interface SiteConfig {
  key: string;
  name: string;
  remote?: boolean;
  etalage?: {
    favicons?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface SiteListItemProps {
  site: SiteConfig;
  siteClick: () => void;
  itemMenuButton?: React.ReactNode;
  itemMenuItems?: React.ReactNode;
}

interface SiteListItemState {
  favicon: string;
}

class SiteListItem extends React.Component<SiteListItemProps, SiteListItemState> {

  _ismounted: boolean = false;

  constructor(props: SiteListItemProps){
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

  componentDidUpdate(preProps: SiteListItemProps){
    if(this._ismounted && preProps.site.key !== this.props.site.key){
      this.getFavicon();
    }
  }

  render(){
    let siteAvatar = ( <Avatar aria-label="recipe"  variant="rounded" sx={{ backgroundColor: red[500] }}>
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

export default SiteListItem;


