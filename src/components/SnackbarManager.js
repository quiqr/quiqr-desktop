import React from 'react';
import Snackbar from 'material-ui-02/Snackbar';
import { snackMessageService } from './../services/ui-service';
const styles = {
  snackbarStyleViaContentProps: {
    backgroundColor: "orange",
    color: "white",
    width: "100%"
  }
};

class SnackbarManager extends React.Component{

  componentWillMount(){
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
      snackbar = <Snackbar
        key="snack-message"
        open={ true }
        action={ snackMessage.action }
        onActionClick={ snackMessage.onActionClick }
        message={ snackMessage.message }
        ContentProps={{
          "aria-describedby": "message-id",
          className: styles.snackbarStyleViaContentProps
      }}
        autoHideDuration={ snackMessage.autoHideDuration }
        onRequestClose={ function(){
          snackMessageService.reportSnackDismiss()
        }}
      />;
    }
    else{
      snackbar = <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        key="snack-message"
        open={ false }
        action={ previousSnackMessage?previousSnackMessage.action:'' }
        message={ previousSnackMessage?previousSnackMessage.message:'' }
      />;
    }

    return <React.Fragment>
      {snackbar}
    </React.Fragment>;
  }
}
export default SnackbarManager;
