import { useState, useEffect } from "react";
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
import { SiteConfig } from '../../../../types';

interface EditTagsDialogsProps {
  open: boolean;
  siteconf: SiteConfig;
  onSuccess: () => void;
  onClose: () => void;
}

const EditSiteTagsDialogs = ({ open, siteconf, onSuccess, onClose }: EditTagsDialogsProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [execButtonsDisabled, setExecButtonsDisabled] = useState(true);
  const [editedSiteConf, setEditedSiteConf] = useState<{
    key?: string;
    name?: string;
    tags?: string[];
  }>({});

  // Sync siteconf from props when it changes
  useEffect(() => {
    if (siteconf.key) {
      const conf = { ...siteconf };
      if (!conf.tags) conf.tags = [];
      setEditedSiteConf(conf);
      setExecButtonsDisabled(true);
      setError(null);
    }
  }, [siteconf.key]);

  const handlePushItem = (val: string) => {
    if (val === "") return;
    setEditedSiteConf(prev => ({
      ...prev,
      tags: [...(prev.tags || []), val]
    }));
    setExecButtonsDisabled(false);
  };

  const handleSwap = (_e: Event, { index, otherIndex }: { index: number; otherIndex: number }) => {
    setEditedSiteConf(prev => {
      const newTags = [...(prev.tags || [])];
      const temp = newTags[otherIndex];
      newTags[otherIndex] = newTags[index];
      newTags[index] = temp;
      return { ...prev, tags: newTags };
    });
    setExecButtonsDisabled(false);
  };

  const handleRequestDelete = (index: number) => {
    setEditedSiteConf(prev => {
      const newTags = [...(prev.tags || [])];
      newTags.splice(index, 1);
      return { ...prev, tags: newTags };
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
      // Redirect to refresh the site library view
      await service.api.redirectTo("/sites/last", true);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tags');
    } finally {
      setLoading(false);
    }
  };

  const field = { title: "tags" };

  return (
    <Dialog open={open} aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description' fullWidth={true} maxWidth={"sm"}>
      <DialogTitle id='alert-dialog-title'>Edit tags of site: {siteconf.name}</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-description'>
          <Box>
            <Chips
              items={editedSiteConf.tags || []}
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

export default EditSiteTagsDialogs;
