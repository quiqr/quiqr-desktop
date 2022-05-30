import * as React          from 'react';
import service             from '../../../../services/service';
import { withStyles }      from '@material-ui/core/styles';
import Button              from '@material-ui/core/Button';
import MuiDialogTitle      from '@material-ui/core/DialogTitle';
import Grid                from '@material-ui/core/Grid';
import Paper               from '@material-ui/core/Paper';
import Typography          from '@material-ui/core/Typography';
import Dialog              from '@material-ui/core/Dialog';
import DialogActions       from '@material-ui/core/DialogActions';
import DialogContent       from '@material-ui/core/DialogContent';
import DialogContentText   from '@material-ui/core/DialogContentText';
import CardLogoGitHubPages from './github-pages/CardLogoGitHubPages'
import FormLogoGitHubPages from './github-pages/FormLogoGitHubPages'
import GitHubPagesForm     from './github-pages/GitHubPagesForm'
import QuiqrCloudForm      from './quiqr-cloud/QuiqrCloudForm'
import CardLogoQuiqrCloud  from './quiqr-cloud/CardLogoQuiqrCloud'
import FormLogoQuiqrCloud  from './quiqr-cloud/FormLogoQuiqrCloud'

const useStyles = theme => ({

  root: {
    margin: 0,
  },
});

class SyncBusyDialog extends React.Component{

  constructor(props){
    super(props);

    this.state = {
    }
  }

  render(){
    let { open, classes } = this.props;
    let serverFormLogo, serverTitle = null;

    if(this.props.serverType === 'quiqr'){
      serverTitle = "Quiqr Cloud Server";
      serverFormLogo = <FormLogoQuiqrCloud className={classes.serverFormLogo} />
    }
    else if (this.props.serverType === 'github'){
      serverTitle = "GitHub Pages Server";
      serverFormLogo = <FormLogoGitHubPages className={classes.serverFormLogo} />
    }

    return (
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth="sm" >

        <MuiDialogTitle disableTypography className={classes.root}>
          <Typography variant="h6">{"Syncing " + serverTitle}</Typography>
          {serverFormLogo}
        </MuiDialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {"doing this..."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={this.props.onClose}>
            {"cancel"}
          </Button>,
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(useStyles)(SyncBusyDialog);
