import * as React        from 'react';
import Button            from '@mui/material/Button';
import DialogTitle       from '@mui/material/DialogTitle';
import Dialog            from '@mui/material/Dialog';
import DialogActions     from '@mui/material/DialogActions';
import DialogContent     from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Spinner           from './../../../components/Spinner'

interface DeleteItemKeyDialogProps {
  busy?: boolean;
  itemLabel: string;
  handleClose?: () => void;
  handleConfirm?: (value: string) => void;
}

interface DeleteItemKeyDialogState {
  value: string;
  valid: boolean | null;
}

class DeleteItemKeyDialog extends React.Component<DeleteItemKeyDialogProps, DeleteItemKeyDialogState>{
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
    const { busy, itemLabel } = this.props;

    return (
      <Dialog fullWidth={true} maxWidth='sm' open={true} onClose={this.handleClose}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {this.state.valid ? undefined : (
              <div>
                Do you really want to delete <b>"{itemLabel}"</b>?
              </div>
            )}

            {busy ? <Spinner /> : undefined}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={this.handleClose.bind(this)} color='primary'>
            Cancel
          </Button>
          <Button disabled={busy} onClick={this.handleConfirm.bind(this)} color='primary'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default DeleteItemKeyDialog
