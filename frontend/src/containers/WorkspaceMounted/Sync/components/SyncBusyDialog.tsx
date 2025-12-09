import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MuiDialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import LinearProgress from '@mui/material/LinearProgress';

interface SyncProgress {
  message: string;
  progress: number;
  complete?: boolean;
  error?: string;
}

interface SyncBusyDialogProps {
  open?: boolean;
  icon?: React.ReactNode;
  serverTitle?: string;
  /** Progress info from SSE stream (optional - falls back to indeterminate) */
  progress?: SyncProgress | null;
  onClose: () => void;
}

function SyncBusyDialog({
  open = false,
  icon,
  serverTitle = '',
  progress,
  onClose,
}: SyncBusyDialogProps) {
  const hasProgress = progress && typeof progress.progress === 'number';
  const message = progress?.message || 'Working...';
  const percent = progress?.progress ?? 0;

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={true}
      maxWidth="sm"
    >
      <MuiDialogTitle sx={{ margin: 0 }} component={'div'}>
        <Box sx={{ position: 'absolute', right: '24px', top: '24px' }}>
          {icon}
        </Box>
        <Typography variant="h6">{serverTitle}</Typography>
      </MuiDialogTitle>

      <DialogContent>
        {hasProgress ? (
          <LinearProgress variant="determinate" value={percent} />
        ) : (
          <LinearProgress />
        )}
        <br />
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SyncBusyDialog;
