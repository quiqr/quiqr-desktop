import { useState, useEffect, useCallback } from "react";
import service from "../../../services/service";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { SiteConfig } from '../../../../types';

interface RenameDialogProps {
  open: boolean;
  siteconf: SiteConfig;
  onSuccess: () => void;
  onClose: () => void;
}

const RenameDialog = ({ open, siteconf, onSuccess, onClose }: RenameDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localsites, setLocalsites] = useState<string[]>([]);
  const [execButtonsDisabled, setExecButtonsDisabled] = useState(false);
  const [errorTextSiteName, setErrorTextSiteName] = useState("");
  const [editedSiteConf, setEditedSiteConf] = useState<{ key?: string; name?: string }>({});

  // Fetch local sites when dialog opens
  useEffect(() => {
    if (open) {
      service.getConfigurations().then((configurations) => {
        setLocalsites(configurations.sites.map(site => site.name));
      });
    }
  }, [open]);

  // Sync siteconf from props when it changes
  useEffect(() => {
    if (siteconf.key) {
      setEditedSiteConf({ ...siteconf });
      setExecButtonsDisabled(true);
      setError(null);
    }
  }, [siteconf.key]);

  const validateSiteName = useCallback((newName: string) => {
    let errorText = "";
    let disabled = false;

    if (localsites && localsites.includes(newName)) {
      errorText = "Name is already used.";
      disabled = true;
    }

    setExecButtonsDisabled(disabled);
    setErrorTextSiteName(errorText);
  }, [localsites]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    validateSiteName(newName);
    setEditedSiteConf({ ...editedSiteConf, name: newName });
  };

  const saveSiteConf = async () => {
    if (!editedSiteConf.key) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await service.api.saveSiteConf(editedSiteConf.key, editedSiteConf);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description' fullWidth={true} maxWidth={"sm"}>
      <DialogTitle id='alert-dialog-title'>Edit site name: {siteconf.name}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          <Box>
            <TextField
              id='standard-full-width'
              label='Site Name'
              fullWidth
              value={editedSiteConf.name || ''}
              onChange={handleNameChange}
              error={errorTextSiteName !== ""}
              helperText={errorTextSiteName}
              disabled={loading}
            />
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
        <Button onClick={saveSiteConf} disabled={execButtonsDisabled || loading}>
          {loading ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RenameDialog;
