import service from "../../../services/service";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { SiteConfig } from "../../../../types";
import { useCallback, useState } from "react";

interface CopyDialogProps {
  open: boolean;
  siteconf: SiteConfig;
  localsites?: string[];
  onSavedClick: () => void;
  onCancelClick: () => void;
}

const CopyDialog = ({ open, siteconf, localsites, onSavedClick, onCancelClick }: CopyDialogProps) => {
  const [errorTextSiteName, setErrorTextSiteName] = useState("");

  console.log(siteconf);

  // Initialize state with the copied siteconf (computed during state initialization)
  const [editedSiteConf, setEditedSiteConf] = useState(() => (siteconf.key ? { ...siteconf, name: siteconf.name + " (copy)" } : { key: "", name: "" }));

  const execButtonsDisabled = !siteconf.key;

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
    setEditedSiteConf({ ...siteconf, name: newName, key: newName });
    validateSiteName(newName);
  };

  const saveSiteConf = async () => {
    if (!editedSiteConf.key) {
      return;
    }

    await service.api.copySite(siteconf.key, editedSiteConf);
    onSavedClick();
  };

  return (
    <Dialog open={open} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description' fullWidth={true} maxWidth={"sm"}>
      <DialogTitle id='alert-dialog-title'>{"New site name: " + siteconf.name}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description' component='div'>
          <TextField
            id='standard-full-width'
            label='Site Name'
            fullWidth
            value={editedSiteConf?.name || siteconf.name || ""}
            onChange={handleNameChange}
            error={errorTextSiteName !== ""}
            helperText={errorTextSiteName}
            sx={{
              marginTop: (theme) => theme.spacing(1),
            }}
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelClick}>cancel</Button>

        <Button disabled={execButtonsDisabled} onClick={saveSiteConf}>
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CopyDialog;
