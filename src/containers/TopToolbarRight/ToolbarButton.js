import React          from 'react';
import Box            from '@material-ui/core/Box';
import Button         from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

const useStyles = theme => ({
  button: {
    '& .MuiButton-label': {
      flexDirection: 'column',
    },

    textTransform: 'none',
    margin: theme.spacing(0),
    padding: theme.spacing(0),
    //color: '#212121',
  },
  buttonActive: {
    '& .MuiButton-label': {
      flexDirection: 'column',
    },
    margin: theme.spacing(0),
    padding: theme.spacing(0),
    color: '#757575',
    textTransform: 'none',
  },

  icon: {
    //color: '#212121',
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
      <Box p={0.5}>
        <Button
          onClick={action}
          color="default"
          className={(active ? classes.buttonActive : classes.button) + " toolbar-button"}
          startIcon={<UseIcon style={{padding:0}} />}
        >
          {title}
        </Button>
      </Box>
    )
  }
}

export default withStyles(useStyles)(ToolbarButton);

