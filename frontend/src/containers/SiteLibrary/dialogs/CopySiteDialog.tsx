import service from "../../../services/service";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { SiteConfig } from "../../../../types";
import { useCallback, useState, useEffect } from "react";

interface CopyDialogProps {
  open: boolean;
  siteconf: SiteConfig;
  onSuccess: () => void;
  onClose: () => void;
}

const CopyDialog = ({ open, siteconf, onSuccess, onClose }: CopyDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localsites, setLocalsites] = useState<string[]>([]);
  const [errorTextSiteName, setErrorTextSiteName] = useState("");
  const [editedName, setEditedName] = useState("");

  const editedSiteConf = {
    ...siteconf,
    name: open ? editedName || siteconf.key + " (copy)" : "",
    key: open ? editedName || siteconf.key + " (copy)" : "",
  };

  // Fetch local sites when dialog opens
  useEffect(() => {
    if (open) {
      service.getConfigurations().then((configurations) => {
        setLocalsites(configurations.sites.map((site) => site.name));
      });
    }
  }, [open]);

  const execButtonsDisabled = !siteconf.key || errorTextSiteName !== "";

  const validateSiteName = useCallback(
    (newName: string) => {
      if (!(localsites && localsites.includes(newName))) {
        setErrorTextSiteName("");
        return;
      }

      setErrorTextSiteName("Name is already used.");
    },
    [localsites]
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setEditedName(newName);
    validateSiteName(newName);
  };

  const saveSiteConf = async () => {
    if (!editedSiteConf.key) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await service.api.copySite(siteconf.key, editedSiteConf);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description' fullWidth={true} maxWidth={"sm"}>
      <DialogTitle id='alert-dialog-title'>Copy site: {siteconf.name}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description' component='div'>
          <TextField
            id='standard-full-width'
            label='Site Name'
            fullWidth
            value={editedSiteConf?.name || ""}
            onChange={handleNameChange}
            error={errorTextSiteName !== ""}
            helperText={errorTextSiteName}
            disabled={loading}
            sx={{
              marginTop: (theme) => theme.spacing(1),
            }}
          />
        </DialogContentText>
        {error && (
          <Box mt={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button disabled={execButtonsDisabled || loading} onClick={saveSiteConf}>
          {loading ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CopyDialog;
