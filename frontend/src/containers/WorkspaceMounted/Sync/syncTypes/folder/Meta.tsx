import React from 'react';
import FolderIcon from '@mui/icons-material/Folder';

export const configDialogTitle = "Folder Export Target";
export const syncingText = "Syncing to folder";

export const sidebarLabel = (config: { path?: string }): string => {
  return config.path || '';
};

export const icon = (): React.ReactElement => {
  return <FolderIcon />;
};
