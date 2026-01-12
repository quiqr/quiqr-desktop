import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface InfoDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

/**
 * InfoDialog - Reusable dialog for displaying informational messages
 *
 * Used for version info, about screens, and other non-interactive notifications
 */
const InfoDialog = ({ open, title, message, onClose }: InfoDialogProps) => {
  // Split message by newlines and render as separate paragraphs
  const lines = message.split('\n').filter(line => line.trim() !== '');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>
          {lines.map((line, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                mb: index < lines.length - 1 ? 1 : 0,
                fontFamily: line.includes(':') ? 'monospace' : 'inherit',
              }}
            >
              {line}
            </Typography>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoDialog;
