import * as React           from 'react';
import service              from '../../../services/service';
import { withStyles }       from '@material-ui/core/styles';
import TextField            from '@material-ui/core/TextField';
import Button               from '@material-ui/core/Button';
import Box                  from '@material-ui/core/Box';
import Dialog               from '@material-ui/core/Dialog';
import DialogActions        from '@material-ui/core/DialogActions';
import DialogContent        from '@material-ui/core/DialogContent';
import DialogContentText    from '@material-ui/core/DialogContentText';
import DialogTitle          from '@material-ui/core/DialogTitle';

const useStyles = theme => ({

  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  serverFormLogo: {
    position: 'absolute',
    right: theme.spacing(3),
    top: theme.spacing(3),
  },

  paper: {
    padding:"40px",
    cursor: "pointer",
    backgroundColor:"#eee",
    '&:hover': {
      backgroundColor:"#ccc"
    }
  }
});

class ImportSiteDialog extends React.Component{

  constructor(props){
    super(props);

    this.state = {
    }
  }

  componentWillMount(){
  }

  renderForm(){
    return (
      <Box>
        <Box my={3}>Download <strong>{this.props.remoteSiteName}</strong> to your local computer for editing and previewing.</Box>

        <TextField
          id="standard-full-width"
          label="Name of local site copy"
          value={this.state.newSiteName}
          onChange={(e)=>{this.handleNameChange(e)}}
          error={(this.state.errorTextSiteName===""?false:true)}
          helperText={this.state.errorTextSiteName}
          />

      </Box>
    )
  }

  render(){

    let { open, classes } = this.props;
    let importButtonHidden = true;

    const actions = [
      <Button color="primary" onClick={this.props.onClose}>
        {"cancel"}
      </Button>,
      (importButtonHidden ? null :
        <Button color="primary" disabled={!this.state.importButtonEnabled} onClick={()=>{

          }}>
          {"save"}
        </Button>),
    ];

    return (
      <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={true}
      maxWidth={"lg"}
    >
        <DialogTitle id="alert-dialog-title">{"Import Quiqr Site"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            xxx
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {actions}
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(useStyles)(ImportSiteDialog);
