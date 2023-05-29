import * as React           from 'react';
import { withStyles }       from '@material-ui/core/styles';
import Button               from '@material-ui/core/Button';
import Box                  from '@material-ui/core/Box';
import MuiDialogTitle       from '@material-ui/core/DialogTitle';
import Typography           from '@material-ui/core/Typography';
import Dialog               from '@material-ui/core/Dialog';
import DialogActions        from '@material-ui/core/DialogActions';
import DialogContent        from '@material-ui/core/DialogContent';
import DialogContentText    from '@material-ui/core/DialogContentText';
import LinearProgress       from '@material-ui/core/LinearProgress';

const useStyles = theme => ({

  root: {
    margin: 0,
  },
  serverFormLogo: {
    position: 'absolute',
    right: theme.spacing(3),
    top: theme.spacing(3),
  },
});

class SyncBusyDialog extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      infoTxt: "."
    }
  }

  componentDidMount(){
    window.require('electron').ipcRenderer.on('updateProgress',(event, infoTxt, percent)=>{
      this.setState({infoTxt: infoTxt});
    });
  }

  render(){
    let { open, classes } = this.props;

    return (
      <Dialog
        open={open||false}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth="sm" >

        <MuiDialogTitle disableTypography className={classes.root}>
          <Box className={classes.serverFormLogo}>
          {this.props.icon}
          </Box>

          <Typography variant="h6">{this.props.serverTitle || ""}</Typography>
        </MuiDialogTitle>

        <DialogContent>
          <LinearProgress />
          <br/>
          <DialogContentText id="alert-dialog-description">
            {this.state.infoTxt}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={this.props.onClose}>
            {"cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(useStyles)(SyncBusyDialog);
