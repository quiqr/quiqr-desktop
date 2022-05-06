import React from 'react';
import clsx from 'clsx';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { red } from '@material-ui/core/colors';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ShareIcon from '@material-ui/icons/Share';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import service              from '../../../services/service';

import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({
  root: {
    width: 345,
  },
  content:{
    minHeight: '200',
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    backgroundColor: "#ccc"
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  avatar: {
    backgroundColor: red[500],
  }
});


class CardItem extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      expanded: false
    }
  }
  componentDidMount(){
    this._ismounted = true;
    this.getScreenshot();
  }

  getScreenshot(){
    if(this.props.site.etalage.screenshots && this.props.site.etalage.screenshots.length > 0){
      service.api.getThumbnailForPath(this.props.site.key, 'source', this.props.site.etalage.screenshots[0]).then((img)=>{
        let screenshot = img;
        this.setState({screenshot:screenshot});
        //service.api.logToConsole(screenshot);
      })
    }
    else{
      this.setState({screenshot:""});
    }
  }

  componentDidUpdate(preProps){
    if(this._ismounted && preProps.site.key !== this.props.site.key){
      this.getScreenshot();
    }
  }

  render(){
    const { classes } = this.props;
    let screenshot = '';

    return (
      <Card className={classes.root}>
        <CardHeader
          avatar={
            <Avatar aria-label="recipe" className={classes.avatar}>
              {this.props.site.name.charAt(0)}
            </Avatar>
          }
          action={
            this.props.itemMenu
          }
          title={<div onClick={this.props.siteClick}>{this.props.site.name}</div>}
          subheader=""
        />

        <CardMedia onClick={this.props.siteClick}
          className={classes.media}
          image={this.state.screenshot}
          title="Site screenshot"
        />

        {/*
        <CardContent>
          <Box style={{height:'50px'}}>
          <Typography variant="body2" color="textSecondary" component="p">
            {this.props.site.etalage.description}
          </Typography>
          </Box>
        </CardContent>
        */}
        <CardActions disableSpacing>
          <IconButton
            className={clsx(classes.expand, {
              [classes.expandOpen]: this.state.expanded,
            })}
            onClick={this.props.siteClick}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        </CardActions>
      </Card>
    );
  }

}

export default withStyles(useStyles)(CardItem);


