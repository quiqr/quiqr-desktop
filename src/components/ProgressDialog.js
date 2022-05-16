import * as React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
//import service from '../services/service';

export default class ProgressDialog extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      confObj: {
        title: "",
        message: "",
        percent: 0,
        visible: false,
      }
    };
  }

  componentDidUpdate(preProps){
    if(this.state.confObj !== this.props.conf){
      this.setState({confObj:this.props.conf});
    }
  }

  handleClose() {
    let confObj = {
      title: "",
      message: "",
      percent: 0,
      visible: false,
    };
    this.setState({confObj:confObj});
  };

  render(){

    return (
      <Dialog
      open={this.state.confObj.visible}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={true}
      maxWidth={"sm"}
    >
        <DialogTitle id="alert-dialog-title">{this.state.confObj.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {this.state.confObj.message}
          </DialogContentText>

          <LinearProgress variant="determinate" value={this.state.confObj.percent} />

        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{this.handleClose()}} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
