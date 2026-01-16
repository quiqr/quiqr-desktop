import { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import service from '../../../services/service';
import { SiteConfig } from '../../../../types';

interface DeleteSiteDialogProps {
  open: boolean;
  siteconf: SiteConfig;
  onClose: () => void;
  onSuccess: () => void;
}

const DeleteSiteDialog = ({ open, siteconf, onClose, onSuccess }: DeleteSiteDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await service.api.deleteSite(siteconf.key);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description' fullWidth={true} maxWidth={"sm"}>
      <DialogTitle id='alert-dialog-title'>Delete site: {siteconf.name}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description' component={'div'}>
          <Box>
            <div>Are you sure you want to delete {siteconf.name}?</div>
            <div>This cannot be undone.</div>
          </Box>
        </DialogContentText>
        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleDelete} disabled={loading} color="error">
          {loading ? <CircularProgress size={20} /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteSiteDialog;
