import React from 'react';

import Grid            from '@material-ui/core/Grid';
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

class TopToolbarRight extends React.Component {

  renderToolbarItem(title, icon, action){
    const { classes } = this.props;
    return (
      <Box onClick={action} display="flex" justifyContent="center" flexDirection="column" border={0} m={0.5} px={1}>
        <IconButton size="small"  color="primary" className={classes.iconButton} aria-label="directions">
          {icon}
        </IconButton>
        <Button size="small" className={classes.iconButton}>{title}</Button>
      </Box>
    )
  }

  render(){
    return (
      <Grid container spacing={3}>
        <Grid item xs>
          <Box display="flex" flexDirection="row" border={0} alignItems="center">
            {this.props.itemsLeft.map((item, index)=>{
              return (
                this.renderToolbarItem(item.title, item.icon, item.action)
              );
            })}
          </Box>

        </Grid>
        <Grid item xs>
          <Box display="flex" justifyContent="center" flexDirection="row" border={0} alignItems="center" >
            {this.props.itemsCenter.map((item, index)=>{
              return (
                this.renderToolbarItem(item.title, item.icon, item.action)
              );
            })}
          </Box>
        </Grid>
        <Grid item xs>
          <Box display="flex" justifyContent="flex-end" flexDirection="row" width={1} border={0} alignItems="center" >
            {this.props.itemsRight.map((item, index)=>{
              return (
                this.renderToolbarItem(item.title, item.icon, item.action)
              );
            })}
          </Box>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(useStyles)(TopToolbarRight);
