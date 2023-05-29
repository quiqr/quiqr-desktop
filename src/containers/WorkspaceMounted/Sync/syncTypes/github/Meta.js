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

  static publishCardObj(config){

    let publishCardObj = {};
    publishCardObj.serviceLogo = <GitHubIcon fontSize="large"  style={{margin:'6px'}} />
    publishCardObj.title = config.username +"/" + config.repository;
    publishCardObj.repoAdminUrl= `https://github.com/${config.username}/${config.repository}`

    publishCardObj.syncToText = 'Push to remote';
    publishCardObj.syncFromText = 'Pull from remote';

    if(config.CNAME){
      publishCardObj.liveUrl= `https://${config.CNAME}`
    }
    else if(config.setGitHubActions){
      publishCardObj.liveUrl= `https://${config.username}.github.io/${config.repository}`
    }
    else{
      publishCardObj.liveUrl= ''
    }
    return publishCardObj;
  }

  static icon(){
    return <GitHubIcon />;
  }
}
