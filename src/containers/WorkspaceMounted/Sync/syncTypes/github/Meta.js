import * as React        from 'react';
import GitHubIcon from '@material-ui/icons/GitHub';

export default class Meta {

  static configDialogTitle = "GitHub Target";
  static syncingText = "Syncing with GitHub Pages Server";

  static sidebarLabel(config){
    if(config.title && config.title !== ''){
      return config.title;
    }
    else{
      return config.username+"/"+config.repository;
    }
  }

  static repoAdminUrl(config){
    return `https://github.com/${config.username}/${config.repository}`
  }

  static liveUrl(config){
    if(config.CNAME){
      return `https://${config.CNAME}`
    }
    else if(config.setGitHubActions){
      return `https://${config.username}.github.io/${config.repository}`
    }
    else{
      return ''
    }
  }

  static icon(){
    return <GitHubIcon />;
  }
}
