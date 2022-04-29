import React from 'react';

import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';

const useStyles = theme => ({

  root: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
  },

  siteAvatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  }
});

//<Avatar variant="square" className={classes.siteAvatar}>{this.props.title.charAt(0)}</Avatar>

class TopToolbarLeft extends React.Component {
  render(){

    const { classes } = this.props;

    return (
      <div className={classes.root}>

        <Typography variant="h6" gutterBottom>
          {this.props.title}
        </Typography>

      </div>
    );
  }
}

export default withStyles(useStyles)(TopToolbarLeft);
