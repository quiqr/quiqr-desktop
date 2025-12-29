import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box
} from '@mui/material';
import { Workspace } from '../../../../types';

interface SelectWorkspaceDialogProps {
  open: boolean;
  workspaces: Workspace[];
  onSelect: (workspace: Workspace) => void;
  onClose: () => void;
}

const SelectWorkspaceDialog = ({
  open,
  workspaces,
  onSelect,
  onClose
}: SelectWorkspaceDialogProps) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  const handleWorkspaceClick = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
  };

  const handleConfirm = () => {
    if (selectedWorkspace) {
      onSelect(selectedWorkspace);
      setSelectedWorkspace(null);
    }
  };

  const handleClose = () => {
    setSelectedWorkspace(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Select Workspace</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This site has multiple workspaces. Please select which one to open:
        </Typography>
        <List sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          {workspaces.map((workspace) => (
            <ListItem
              key={workspace.key}
              disablePadding
              divider
            >
              <ListItemButton
                selected={selectedWorkspace?.key === workspace.key}
                onClick={() => handleWorkspaceClick(workspace)}
              >
                <ListItemText
                  primary={workspace.key}
                  secondary={
                    <Box component="span" sx={{ fontSize: '0.75rem' }}>
                      {workspace.path}
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedWorkspace}
        >
          Open Workspace
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectWorkspaceDialog;
