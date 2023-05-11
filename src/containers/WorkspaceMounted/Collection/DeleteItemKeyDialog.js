import * as React        from 'react';
import Button            from '@material-ui/core/Button';
import DialogTitle       from '@material-ui/core/DialogTitle';
import Dialog            from '@material-ui/core/Dialog';
import DialogActions     from '@material-ui/core/DialogActions';
import DialogContent     from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Spinner           from './../../../components/Spinner'

class DeleteItemKeyDialog extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      value:'',
      valid: null
    }
  }

  handleClose(){
    if(this.props.handleClose && !this.props.busy)
      this.props.handleClose();
  }

  handleConfirm(){
    if(this.props.handleConfirm)
      this.props.handleConfirm(this.state.value);
  }

  render(){
    let { busy, itemLabel } = this.props;

    return (
      <Dialog
        fullWidth={true}
        maxWidth="sm"
        modal={true}
        open={true}
        onClose={this.handleClose}
      >
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {this.state.valid? undefined :
            <p>Do you really want to delete <b>"{itemLabel}"</b>?</p>}

            { busy ? <Spinner /> : undefined }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={this.handleClose.bind(this)} color="primary">Cancel</Button>
          <Button disabled={busy} onClick={this.handleConfirm.bind(this)} color="primary">Delete</Button>
        </DialogActions>


      </Dialog>
    );
  }
}

export default DeleteItemKeyDialog
