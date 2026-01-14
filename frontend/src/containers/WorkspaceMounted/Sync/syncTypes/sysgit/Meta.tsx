import React from 'react';
import SysGitIcon from '@mui/icons-material/GitHub';

export const configDialogTitle = "Git Target";
export const syncingText = "Syncing with a Git Server";

export const sidebarLabel = (config: { title?: string; username?: string; repository?: string }): string => {
  if (config.title && config.title !== '') {
    return config.title;
  } else {
    return config.username + "/" + config.repository;
  }
};

export const repoAdminUrl = (config: {
  type?: string;
  gitBaseUrl?: string;
  git_server_url?: string;
  username?: string;
  repository?: string;
}): string => {
  // For the universal 'git' type, construct URL from gitBaseUrl
  if (config.type === 'git' && config.gitBaseUrl) {
    const baseUrl = config.gitBaseUrl.replace(/:\d+$/, ''); // Remove port if present
    const isLocalhost = baseUrl.startsWith('localhost') || baseUrl.startsWith('127.0.0.1');
    const scheme = isLocalhost ? 'http' : 'https';
    return `${scheme}://${config.gitBaseUrl}/${config.username}/${config.repository}`;
  }
  // For sysgit type, use the full git_server_url (extract web URL)
  if (config.type === 'sysgit' && config.git_server_url) {
    // Try to extract a web URL from git URL (e.g., git@github.com:user/repo.git -> https://github.com/user/repo)
    const match = config.git_server_url.match(/git@([^:]+):([^/]+)\/(.+?)(?:\.git)?$/);
    if (match) {
      return `https://${match[1]}/${match[2]}/${match[3]}`;
    }
    return config.git_server_url;
  }
  // Fallback for github type or unknown
  return `https://github.com/${config.username}/${config.repository}`;
};

export const liveUrl = (config: {
  CNAME?: string;
  setGitHubActions?: boolean;
  setCIWorkflow?: boolean;
  username?: string;
  repository?: string;
  gitProvider?: string;
}): string => {
  if (config.CNAME) {
    return `https://${config.CNAME}`;
  } else if (config.setGitHubActions || (config.setCIWorkflow && config.gitProvider === 'github')) {
    return `https://${config.username}.github.io/${config.repository}`;
  } else {
    return '';
  }
};

export const icon = (): React.ReactElement => {
  return <SysGitIcon />;
};
