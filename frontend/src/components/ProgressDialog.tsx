import * as React from 'react';
import LinearProgress from '@mui/material/LinearProgress';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
//import service from '../services/service';

interface ProgressConfig {
  title: string;
  message: string;
  percent: number;
  visible: boolean;
}

type ProgressDialogProps = {
  conf: ProgressConfig;
};

type ProgressDialogState = {
  confObj: ProgressConfig;
};

export default class ProgressDialog extends React.Component<ProgressDialogProps, ProgressDialogState>{
  constructor(props: ProgressDialogProps){
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

  componentDidUpdate(){
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
