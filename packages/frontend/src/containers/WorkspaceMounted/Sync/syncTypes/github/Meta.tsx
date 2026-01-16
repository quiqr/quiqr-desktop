import React from 'react';
import GitHubIcon from '@mui/icons-material/GitHub';

export const configDialogTitle = "GitHub Target";
export const syncingText = "Syncing with GitHub Pages Server";

export const sidebarLabel = (config: { title?: string; username?: string; repository?: string }): string => {
  if (config.title && config.title !== '') {
    return config.title;
  } else {
    return config.username + "/" + config.repository;
  }
};

export const repoAdminUrl = (config: { username?: string; repository?: string }): string => {
  return `https://github.com/${config.username}/${config.repository}`;
};

export const liveUrl = (config: {
  CNAME?: string;
  setGitHubActions?: boolean;
  username?: string;
  repository?: string;
}): string => {
  if (config.CNAME) {
    return `https://${config.CNAME}`;
  } else if (config.setGitHubActions) {
    return `https://${config.username}.github.io/${config.repository}`;
  } else {
    return '';
  }
};

export const icon = (): React.ReactElement => {
  return <GitHubIcon />;
};
