import React from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';


const useStyles = theme => ({
  root: {
    margin: 20,
    maxWidth: 345,
  },
  logo:{
    alignItems: 'center',
    width: "100%",
    backgroundColor: '#ccc',
    justifyContent: 'center',
    height: 100,
    padding: 30
  },
  media: {
  },
});

class MainPublishCard extends React.Component {

  constructor(props){
    super(props);
    this.state = {
    };
  }

  render(){
    const { classes } = this.props;

    return (
      <Card className={classes.root}
      elevation={5}
      >
        <CardHeader
          avatar={ null }
          action={
            this.props.itemMenu
          }
          title={<div >{this.props.publishPath}<br/><Button color="primary" onClick={()=>{
            window.require('electron').shell.openExternal(this.props.liveURL);
          }}>{this.props.liveURL}</Button></div>}
          subheader=""
        />

        <div className={classes.logo}>
          {this.props.serviceLogo}
        </div>
        <CardContent>
        </CardContent>
        <CardActions>
          <Button variant="contained" color="primary" onClick={this.props.onPublish}>
            Publish
          </Button>
        </CardActions>
      </Card>
    );
  }
}

export default withStyles(useStyles)(MainPublishCard);

