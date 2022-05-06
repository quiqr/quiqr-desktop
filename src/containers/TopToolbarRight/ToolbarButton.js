import React from 'react';

import Box            from '@material-ui/core/Box';
import Button      from '@material-ui/core/Button';
import IconButton      from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({
  iconButton: {
    margin: theme.spacing(0),
    padding: theme.spacing(0),
  },
});

class ToolbarButton extends React.Component {

  render(){
    const { classes, title, action, icon } = this.props;
    return (
      <Box onClick={action} display="flex" justifyContent="center" flexDirection="column" border={0} m={0.5} px={1}>
        <IconButton size="small"  color="primary" className={classes.iconButton} aria-label="directions">
          {icon}
        </IconButton>
        <Button size="small" className={classes.iconButton}>{title}</Button>
      </Box>
    )
  }
}

export default withStyles(useStyles)(ToolbarButton);

