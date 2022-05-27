import * as React           from 'react';
import service              from '../../../../services/service';
import TextField            from '@material-ui/core/TextField';
import { withStyles }       from '@material-ui/core/styles';
import Button               from '@material-ui/core/Button';
import Box                  from '@material-ui/core/Box';
import Grid                  from '@material-ui/core/Grid';
import Paper                  from '@material-ui/core/Paper';
import Dialog               from '@material-ui/core/Dialog';
import DialogActions        from '@material-ui/core/DialogActions';
import DialogContent        from '@material-ui/core/DialogContent';
import DialogContentText    from '@material-ui/core/DialogContentText';
import DialogTitle          from '@material-ui/core/DialogTitle';
import CardLogoGitHubPages  from './CardLogoGitHubPages'
import CardLogoQuiqrCloud   from './CardLogoQuiqrCloud'

const useStyles = theme => ({
  paper: {
    padding:"40px",
    cursor: "pointer",
    backgroundColor:"#eee",
    '&:hover': {

      backgroundColor:"#ccc"

    }
  }
});

class SyncServerDialog extends React.Component{

  constructor(props){
    super(props);

    this.state = {
      serverType: null,
    }
  }

  renderServerCards(){
    const {classes} = this.props;
    return (

      <React.Fragment>
        <Grid container  spacing={2}>
          <Grid item xs={6}>
            <Paper
              onClick={()=>{
                this.setState({serverType: 'github-pages'})
              }}
              className={classes.paper}
              elevation={5}
            >
              <CardLogoGitHubPages />
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper
              onClick={()=>{
                this.setState({serverType: 'quiqr-cloud'})
              }}
              className={classes.paper}
              elevation={5}
            >
              <CardLogoQuiqrCloud />
            </Paper>
          </Grid>
        </Grid>
      </React.Fragment>
    )
  }

  render(){
    let { open, classes, modAction, serverTitle, closeText } = this.props;
    let content = null;

    if(this.state.serverType){
      if(this.state.serverType === 'quiqr-cloud'){
        content = "q"

      }
      else if (this.state.serverType === 'github-pages'){
        content = "GH"

      }

    }
    else if(modAction === 'Add'){
      content = this.renderServerCards();
    }

    const actions = [
      <Button color="primary" onClick={this.props.onClose}>
        {closeText}
      </Button>,
    ];

    return (
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth={"sm"} >

        <DialogTitle id="alert-dialog-title">{modAction + " " + serverTitle}</DialogTitle>
        <DialogContent>
          {content}
          <DialogContentText id="alert-dialog-description">
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {actions}
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(useStyles)(SyncServerDialog);
