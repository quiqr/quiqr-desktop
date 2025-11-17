import React, { useEffect, useRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { snackMessageService } from './../services/ui-service';

const SnackbarManager = () => {
  const componentRef = useRef({});

  useEffect(() => {
    snackMessageService.registerListener(componentRef.current);
    
    return () => {
      snackMessageService.unregisterListener(componentRef.current);
    };
  }, []);

  const snackMessage = snackMessageService.getCurrentSnackMessage();
  const previousSnackMessage = snackMessageService.getPreviousSnackMessage();
  let snackbar = undefined;

  if(snackMessage){

    if(snackMessage.action){
      snackbar = (
        <Snackbar
          key="snack-message"
          open={ true }
          anchorOrigin={{vertical:"bottom", horizontal: "left" }}
          action={ snackMessage.action }
          autoHideDuration={ snackMessage.autoHideDuration }
          message={snackMessage.message}
        />
      );

    }
    else{
      snackbar = (
        <Snackbar
          key="snack-message"
          open={ true }
          onClose={()=>{ snackMessageService.reportSnackDismiss() }}
          anchorOrigin={{vertical:"bottom", horizontal: "left" }}
          autoHideDuration={ snackMessage.autoHideDuration }
        >
          <Alert
            elevation={6} variant="filled"
            onClose={ ()=>{ snackMessageService.reportSnackDismiss() }}
            severity={snackMessage.severity}>
            {snackMessage.message}
          </Alert>
        </Snackbar>
      );

    }
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
};

export default SnackbarManager;
