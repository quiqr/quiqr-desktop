import * as React           from 'react';
import { withStyles }       from '@material-ui/core/styles';
import Button               from '@material-ui/core/Button';
import Box                  from '@material-ui/core/Box';
import Dialog               from '@material-ui/core/Dialog';
import DialogActions        from '@material-ui/core/DialogActions';
import DialogContent        from '@material-ui/core/DialogContent';
import DialogContentText    from '@material-ui/core/DialogContentText';
import DialogTitle          from '@material-ui/core/DialogTitle';

const useStyles = theme => ({

});

class DeleteSiteDialog extends React.Component{

  render(){

    let { open, siteconf } = this.props;

    return (
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={true}
        maxWidth={"sm"} >

        <DialogTitle id="alert-dialog-title">{"Edit site name: "+siteconf.name}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Box>
              <p>Are you sure you want to delete {siteconf.name} ?</p>

              <p>This cannot be undone.</p>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{ this.props.onCancelClick(); }}>
            Cancel
          </Button>
          <Button onClick={()=>this.props.onDelete(siteconf.key)} >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
export default withStyles(useStyles)(DeleteSiteDialog)
