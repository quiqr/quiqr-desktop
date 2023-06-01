import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import { snackMessageService } from './../services/ui-service';

class SnackbarManager extends React.Component{

  componentDidMount(){
    snackMessageService.registerListener(this);
  }

  componentWillUnmount(){
    snackMessageService.unregisterListener(this);
  }

  render(){
    let snackMessage = snackMessageService.getCurrentSnackMessage();
    let previousSnackMessage = snackMessageService.getPreviousSnackMessage();
    let snackbar = undefined;

    if(snackMessage){
      snackbar = (
        <Snackbar
          key="snack-message"
          open={ true }
          anchorOrigin={{vertical:"bottom", horizontal: "left" }}
          action={ snackMessage.action }
          autoHideDuration={ snackMessage.autoHideDuration }
          onClose={()=>{ snackMessageService.reportSnackDismiss() }}
        >
          <Alert
            elevation={6} variant="filled"
            onClose={ ()=>{ snackMessageService.reportSnackDismiss() }}
            severity={snackMessage.severity}>
            {snackMessage.message}
        </Alert>
        </Snackbar>
      )
      ;
    }
    else{
      snackbar = (
        <Snackbar
          key="snack-message"
          open={ false }
          action={ previousSnackMessage?previousSnackMessage.action:'' }
          message={ previousSnackMessage?previousSnackMessage.message:'' }
        />
      );
    }

    return <React.Fragment>
      {snackbar}
    </React.Fragment>;
  }
}
export default SnackbarManager;
