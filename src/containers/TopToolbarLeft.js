import React from 'react';

import Box from '@material-ui/core/Box';
import { withStyles } from '@material-ui/core/styles';
//import Avatar from '@material-ui/core/Avatar';

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


    return (
      <Box textOverflow="ellipsis" overflow="hidden" fontWeight="fontWeightMedium" border={0} component="div" fontSize="h6.fontSize" m={2} whiteSpace="nowrap">
         {this.props.title}
      </Box>
    );
  }
}

export default withStyles(useStyles)(TopToolbarLeft);
