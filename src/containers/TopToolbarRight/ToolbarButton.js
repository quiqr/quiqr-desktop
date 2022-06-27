import React          from 'react';
import Box            from '@material-ui/core/Box';
import Button         from '@material-ui/core/Button';
import IconButton     from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({
  button: {
    margin: theme.spacing(0),
    padding: theme.spacing(0),
    color: '#212121',
  },
  buttonActive: {
    margin: theme.spacing(0),
    padding: theme.spacing(0),
    color: '#757575',
  },

  icon: {
    color: '#212121',
  },
  iconActive: {
    color: '#757575',
  },
});

class ToolbarButton extends React.Component {

  render(){
    const { classes, title, action, icon, active } = this.props;
    let UseIcon = icon;

    return (
      <Box onClick={action} display="flex" justifyContent="center" flexDirection="column" border={0} my={0} m={0.5} px={1}>
        <IconButton size="small" aria-label="directions">
          <UseIcon className={(active ? classes.iconActive : classes.icon)} />
        </IconButton>
        <Button size="small" className={(active ? classes.buttonActive : classes.button)} >{title}</Button>
      </Box>
    )
  }
}

export default withStyles(useStyles)(ToolbarButton);

