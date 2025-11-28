import * as React from "react";
import service from "../../../services/service";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { SiteConfig } from '../../../../types';

interface RenameDialogProps {
  open: boolean;
  siteconf: SiteConfig;
  localsites?: string[];
  onSavedClick: () => void;
  onCancelClick: () => void;
}

const RenameDialog: React.FC<RenameDialogProps> = ({ open, siteconf, localsites, onSavedClick, onCancelClick }) => {
  const [execButtonsDisabled, setExecButtonsDisabled] = React.useState(false);
  const [errorTextSiteName, setErrorTextSiteName] = React.useState("");
  const [editedSiteConf, setEditedSiteConf] = React.useState<{ key?: string; name?: string }>({});

  // Sync siteconf from props when it changes
  React.useEffect(() => {
    if (siteconf.key) {
      setEditedSiteConf({ ...siteconf });
      setExecButtonsDisabled(true);
    }
  }, [siteconf.key]);

  const validateSiteName = React.useCallback((newName: string) => {
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

  const saveSiteConf = () => {
    if (editedSiteConf.key) {
      service.api.saveSiteConf(editedSiteConf.key, editedSiteConf).then(() => {
        onSavedClick();
      });
    }
  };

  const actions = [
    <Button
      key={"menuAction1" + siteconf.name}
      onClick={onCancelClick}>
      cancel
    </Button>,

    <Button
      key={"menuAction2" + siteconf.name}
      disabled={execButtonsDisabled}
      onClick={saveSiteConf}>
      SAVE
    </Button>,
  ];

  return (
    <Dialog open={open} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description' fullWidth={true} maxWidth={"sm"}>
      <DialogTitle id='alert-dialog-title'>{"Edit site name: " + siteconf.name}</DialogTitle>
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
            />
          </Box>
        </DialogContentText>
      </DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
};

export default RenameDialog;
