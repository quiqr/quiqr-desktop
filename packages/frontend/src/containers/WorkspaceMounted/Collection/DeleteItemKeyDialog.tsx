import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Spinner from './../../../components/Spinner';

interface DeleteItemKeyDialogProps {
  busy?: boolean;
  itemLabel: string;
  handleClose?: () => void;
  handleConfirm?: () => void;
}

function DeleteItemKeyDialog({ busy, itemLabel, handleClose, handleConfirm }: DeleteItemKeyDialogProps) {
  const onClose = () => {
    if (handleClose && !busy) {
      handleClose();
    }
  };

  const onConfirm = () => {
    if (handleConfirm) {
      handleConfirm();
    }
  };

  return (
    <Dialog fullWidth={true} maxWidth="sm" open={true} onClose={onClose}>
      <DialogTitle>Delete Item</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <div>
            Do you really want to delete <b>"{itemLabel}"</b>?
          </div>
          {busy && <Spinner />}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button disabled={busy} onClick={onConfirm} color="primary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteItemKeyDialog;
