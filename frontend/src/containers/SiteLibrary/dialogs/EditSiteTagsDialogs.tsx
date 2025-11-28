import * as React from "react";
import service from "../../../services/service";
import Chips from "../../../components/Chips";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { SiteConfig } from '../../../../types';

interface EditTagsDialogsProps {
  open: boolean;
  siteconf: SiteConfig;
  onSavedClick: () => void;
  onCancelClick: () => void;
}

const EditSiteTagsDialogs: React.FC<EditTagsDialogsProps> = ({ open, siteconf, onSavedClick, onCancelClick }) => {
  const [execButtonsDisabled, setExecButtonsDisabled] = React.useState(true);
  const [editedSiteConf, setEditedSiteConf] = React.useState<{
    key?: string;
    name?: string;
    tags?: string[];
  }>({});

  // Sync siteconf from props when it changes
  React.useEffect(() => {
    if (siteconf.key) {
      const conf = { ...siteconf };
      if (!conf.tags) conf.tags = [];
      setEditedSiteConf(conf);
      setExecButtonsDisabled(true);
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

  const saveSiteConf = () => {
    if (editedSiteConf.key) {
      service.api.saveSiteConf(editedSiteConf.key, editedSiteConf).then(() => {
        onSavedClick();
      });
    }
  };

  const field = { title: "tags" };

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
      <DialogTitle id='alert-dialog-title'>{"Edit tags of site: " + siteconf.name}</DialogTitle>
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
      </DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
};

export default EditSiteTagsDialogs;
