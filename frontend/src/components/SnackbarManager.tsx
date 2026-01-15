import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useSnackbar } from '../contexts/SnackbarContext';

const SnackbarManager = () => {
  const { currentSnackMessage, previousSnackMessage, reportSnackDismiss } = useSnackbar();

  const snackMessage = currentSnackMessage;
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
          onClose={()=>{ reportSnackDismiss() }}
          anchorOrigin={{vertical:"bottom", horizontal: "left" }}
          autoHideDuration={ snackMessage.autoHideDuration }
        >
          <Alert
            elevation={6} variant="filled"
            onClose={ ()=>{ reportSnackDismiss() }}
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
