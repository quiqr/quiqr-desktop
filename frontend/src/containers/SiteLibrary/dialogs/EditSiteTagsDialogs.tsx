import { useState } from "react";
import { useNavigate } from "react-router-dom";
import service from "../../../services/service";
import Chips from "../../../components/Chips";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { SiteConfig } from "../../../../types";

interface EditTagsDialogsProps {
  open: boolean;
  siteconf: SiteConfig;
  onSuccess: () => void;
  onClose: () => void;
}

const EditSiteTagsDialogs = ({ open, siteconf, onSuccess, onClose }: EditTagsDialogsProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [execButtonsDisabled, setExecButtonsDisabled] = useState(true);
  const [editedTags, setEditedTags] = useState<string[]>(siteconf.tags || []);

  const editedSiteConf = {
    ...siteconf,
    tags: editedTags,
  };

  const handlePushItem = (val: string) => {
    if (val === "") return;
    setEditedTags((prev) => [...prev, val]);
    setExecButtonsDisabled(false);
  };

  const handleSwap = (_e: Event, { index, otherIndex }: { index: number; otherIndex: number }) => {
    setEditedTags((prev) => {
      const newTags = [...prev];
      const temp = newTags[otherIndex];
      newTags[otherIndex] = newTags[index];
      newTags[index] = temp;
      return newTags;
    });
    setExecButtonsDisabled(false);
  };

  const handleRequestDelete = (index: number) => {
    setEditedTags((prev) => {
      const newTags = [...prev];
      newTags.splice(index, 1);
      return newTags;
    });
    setExecButtonsDisabled(false);
  };

  const saveSiteConf = async () => {
    if (!editedSiteConf.key) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await service.api.saveSiteConf(editedSiteConf.key, editedSiteConf);
      // Navigate to refresh the site library view
      navigate("/sites/last");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tags");
    } finally {
      setLoading(false);
    }
  };

  const field = { title: "tags" };

  return (
    <Dialog open={open} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description' fullWidth={true} maxWidth={"sm"}>
      <DialogTitle id='alert-dialog-title'>Edit tags of site: {siteconf.name}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description' component={"div"}>
          <Box>
            <Chips
              items={editedTags}
              sortable={true}
              fullWidth={true}
              field={field}
              onRequestDelete={handleRequestDelete}
              onPushItem={handlePushItem}
              onSwap={handleSwap}
            />
          </Box>
        </DialogContentText>
        {error && (
          <Box mt={2}>
            <Alert severity='error'>{error}</Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={saveSiteConf} disabled={execButtonsDisabled || loading}>
          {loading ? <CircularProgress size={20} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSiteTagsDialogs;
