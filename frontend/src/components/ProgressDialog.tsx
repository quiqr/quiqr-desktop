import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface ProgressConfig {
  title: string;
  message: string;
  percent: number;
  visible: boolean;
}

type ProgressDialogProps = {
  conf: ProgressConfig;
  onClose?: () => void;
};

function ProgressDialog({ conf, onClose }: ProgressDialogProps) {
  return (
    <Dialog
      open={conf.visible}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={true}
      maxWidth="sm"
    >
      <DialogTitle id="alert-dialog-title">{conf.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{conf.message}</DialogContentText>
        <LinearProgress variant="determinate" value={conf.percent} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProgressDialog;
