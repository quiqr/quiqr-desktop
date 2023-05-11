import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
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
          action={ snackMessage.action }
          onActionClick={ snackMessage.onActionClick }
          message={ snackMessage.message }
          autoHideDuration={ snackMessage.autoHideDuration }
          onClose={ function(){
            snackMessageService.reportSnackDismiss()
          }}
        />
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
